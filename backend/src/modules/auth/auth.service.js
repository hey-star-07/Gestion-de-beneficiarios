const AuthModel = require('./auth.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const authConfig = require('../../config/auth');
const emailService = require('../../utils/email.service');
const db = require('../../config/database');

class AuthService {
  async register(userData) {
    const { email, code, firstName, lastName, password, role = 'USER' } = userData;
    
    // Verificar si el email ya existe
    const existingEmail = await AuthModel.findByEmail(email);
    if (existingEmail) {
      throw new Error('El email ya está registrado');
    }
    
    // Verificar si el código ya existe
    const existingCode = await this.findByBeneficiaryCode(code);
    if (existingCode) {
      throw new Error('El código de beneficiario ya está registrado');
    }
        
    // Validar contraseña
    if (password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }
    
    // Generar código de verificación
    const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    
    // Hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Generar username desde el email
    const username = email.split('@')[0];
    
    // Crear beneficiario primero
    const beneficiaryResult = await db.query(
      `INSERT INTO beneficiaries (code, first_name, last_name, email)
       VALUES ($1, $2, $3, $4)
       RETURNING id, code, first_name, last_name, email`,
      [code, firstName, lastName, email]
    );
    
    const beneficiary = beneficiaryResult.rows[0];
    
    // Crear usuario
    const newUser = await AuthModel.create({
      email,
      username,
      passwordHash,
      role,
      verificationCode,
      verificationCodeExpires,
      beneficiaryId: beneficiary.id
    });
    
    // Enviar email de verificación
    emailService.sendVerificationEmail(email, verificationCode).catch(err => {
      console.error('Error enviando email:', err);
    });
    
    return {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      beneficiaryId: beneficiary.id,
      beneficiaryCode: beneficiary.code,
      firstName: beneficiary.first_name,
      lastName: beneficiary.last_name
    };
  }

  async findByBeneficiaryCode(code) {
    const result = await db.query(
      'SELECT id, code FROM beneficiaries WHERE code = $1',
      [code]
    );
    return result.rows[0];
  }

  async verifyEmail(email, code) {
    const user = await AuthModel.findByEmail(email);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    if (user.is_verified) {
      throw new Error('El email ya está verificado');
    }
    
    if (user.verification_code_expires && user.verification_code_expires < new Date()) {
      throw new Error('El código ha expirado. Por favor solicita uno nuevo');
    }
    
    if (user.verification_code !== code) {
      throw new Error('Código de verificación incorrecto');
    }
    
    return await AuthModel.verifyEmail(email);
  }

  async login(loginData) {
    const { identifier, password } = loginData;
    
    // Buscar usuario
    const user = await this.findUserByIdentifier(identifier);
    
    if (!user) {
      throw new Error('El email, usuario o código no existe en el sistema');
    }
    
    if (!user.is_verified) {
      throw new Error('Email no verificado. Por favor revisa tu correo para verificar tu cuenta');
    }
    
    if (!user.is_active) {
      throw new Error('Usuario desactivado. Contacta al administrador');
    }
    
    // Verificar contraseña
    let validPassword = false;
    
    // Si el hash empieza con $2, es bcrypt
    if (user.password_hash.startsWith('$2')) {
      validPassword = await bcrypt.compare(password, user.password_hash);
    } else {
      // Si es texto plano (temporal), comparar directamente
      validPassword = (password === user.password_hash);
      
      // Si coincide, actualizar a hash
      if (validPassword) {
        const saltRounds = 10;
        const newHash = await bcrypt.hash(password, saltRounds);
        await db.query(
          'UPDATE users SET password_hash = $1 WHERE id = $2',
          [newHash, user.id]
        );
        console.log('✅ Contraseña actualizada a hash bcrypt');
      }
    }
    
    if (!validPassword) {
      throw new Error('La contraseña es incorrecta');
    }
    
    // Generar tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    await Promise.all([
      AuthModel.saveRefreshToken(user.id, refreshToken),
      AuthModel.updateLastLogin(user.id)
    ]);
    
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        beneficiaryId: user.beneficiary_id,
        beneficiaryCode: user.beneficiary_code,
        firstName: user.first_name,
        lastName: user.last_name,
        isVerified: user.is_verified
      }
    };
  }

  async findUserByIdentifier(identifier) {
    // Buscar por email o username
    const emailResult = await db.query(
      `SELECT u.*, b.code as beneficiary_code, b.first_name, b.last_name
       FROM users u
       LEFT JOIN beneficiaries b ON u.beneficiary_id = b.id
       WHERE u.email = $1 OR u.username = $1`,
      [identifier]
    );
    
    if (emailResult.rows.length > 0) {
      return emailResult.rows[0];
    }
    
    // Buscar por código de beneficiario
    const codeResult = await db.query(
      `SELECT u.*, b.code as beneficiary_code, b.first_name, b.last_name
       FROM users u
       LEFT JOIN beneficiaries b ON u.beneficiary_id = b.id
       WHERE b.code = $1`,
      [identifier]
    );
    
    return codeResult.rows[0] || null;
  }

  async forgotPassword(email) {
    const user = await AuthModel.findByEmail(email);
    
    if (!user) {
      throw new Error('No existe una cuenta con este email');
    }
    
    // Generar código de recuperación
    const resetCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    
    await db.query(
      'UPDATE users SET reset_code = $1, reset_code_expires = $2 WHERE id = $3',
      [resetCode, resetCodeExpires, user.id]
    );
    
    // Enviar email con código
    await emailService.sendPasswordResetEmail(email, resetCode);
    
    return { message: 'Código de recuperación enviado a tu email' };
  }

  async resetPassword(email, code, newPassword) {
    const user = await AuthModel.findByEmail(email);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    if (user.reset_code !== code) {
      throw new Error('Código de recuperación incorrecto');
    }
    
    if (user.reset_code_expires < new Date()) {
      throw new Error('El código ha expirado');
    }
    
    if (newPassword.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }
    
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    await db.query(
      'UPDATE users SET password_hash = $1, reset_code = NULL, reset_code_expires = NULL WHERE id = $2',
      [passwordHash, user.id]
    );
    
    return { message: 'Contraseña actualizada exitosamente' };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, authConfig.jwtRefreshSecret);
      const user = await AuthModel.findById(decoded.userId);
      
      if (!user || user.refresh_token !== refreshToken) {
        throw new Error('Refresh token inválido');
      }
      
      const accessToken = this.generateAccessToken(user);
      
      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          beneficiaryId: user.beneficiary_id
        }
      };
    } catch (error) {
      throw new Error('Refresh token inválido o expirado');
    }
  }

  async logout(userId) {
    await AuthModel.removeRefreshToken(userId);
  }

  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        beneficiaryId: user.beneficiary_id
      },
      authConfig.jwtSecret,
      { expiresIn: '24h' }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { userId: user.id },
      authConfig.jwtRefreshSecret,
      { expiresIn: '7d' }
    );
  }

  async getProfile(userId) {
    const result = await db.query(
      `SELECT u.id, u.email, u.username, u.role, u.beneficiary_id, u.is_verified,
              b.code as beneficiary_code, b.first_name, b.last_name
       FROM users u
       LEFT JOIN beneficiaries b ON u.beneficiary_id = b.id
       WHERE u.id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }
    
    return result.rows[0];
  }

  async findByBeneficiaryCode(code) {
    const result = await db.query(
      'SELECT id, code FROM beneficiaries WHERE code = $1',
      [code]
    );
    return result.rows[0];
  }
}

module.exports = new AuthService();