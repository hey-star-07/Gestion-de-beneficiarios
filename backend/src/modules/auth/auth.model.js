const db = require('../../config/database');

class AuthModel {
  async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  async findById(id) {
    const result = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async create(userData) {
    const { 
      email, 
      username, 
      passwordHash, 
      role, 
      verificationCode, 
      verificationCodeExpires, 
      beneficiaryId 
    } = userData;
    
    const result = await db.query(
      `INSERT INTO users (
        email, username, password_hash, role, 
        verification_code, verification_code_expires, beneficiary_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, username, role, beneficiary_id, is_verified, created_at`,
      [email, username, passwordHash, role, verificationCode, verificationCodeExpires, beneficiaryId]
    );
    
    return result.rows[0];
  }

  async verifyEmail(email) {
    const result = await db.query(
      `UPDATE users 
       SET is_verified = true, 
           verification_code = NULL,
           verification_code_expires = NULL
       WHERE email = $1 
       RETURNING id, email, username, role, is_verified`,
      [email]
    );
    return result.rows[0];
  }

  async updateLastLogin(id) {
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }

  async saveRefreshToken(userId, refreshToken) {
    await db.query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [refreshToken, userId]
    );
  }

  async removeRefreshToken(userId) {
    await db.query(
      'UPDATE users SET refresh_token = NULL WHERE id = $1',
      [userId]
    );
  }
}

module.exports = new AuthModel();