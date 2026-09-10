const authService = require('./auth.service');
const { validationResult } = require('express-validator');

class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const result = await authService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente. Por favor verifica tu email.',
        data: result
      });
    } catch (error) {
      console.error('Error en registro:', error.message);
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { email, code } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({
          success: false,
          error: 'Email y código son requeridos'
        });
      }
      
      const result = await authService.verifyEmail(email, code);
      
      res.json({
        success: true,
        message: 'Email verificado exitosamente. Ya puedes iniciar sesión.',
        data: result
      });
    } catch (error) {
      console.error('Error en verificación:', error.message);
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const result = await authService.login(req.body);
      
      res.json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error) {
      console.error('❌ Error en login:', error.message);
      res.status(401).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email requerido'
        });
      }
      
      const result = await authService.forgotPassword(email);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, code, newPassword } = req.body;
      
      if (!email || !code || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Email, código y nueva contraseña son requeridos'
        });
      }
      
      const result = await authService.resetPassword(email, code, newPassword);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token requerido'
        });
      }
      
      const result = await authService.refreshToken(refreshToken);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(401).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async logout(req, res) {
    try {
      await authService.logout(req.user.userId);
      
      res.json({
        success: true,
        message: 'Logout exitoso'
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async getProfile(req, res) {
    try {
      const profile = await authService.getProfile(req.user.userId);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      res.status(404).json({ 
        success: false,
        error: error.message 
      });
    }
  }
}

module.exports = new AuthController();