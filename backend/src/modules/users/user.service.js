const db = require('../../config/database');

class UserModel {
  async findById(id) {
    const result = await db.query(
      `SELECT id, email, username, role, beneficiary_id, is_verified, is_active, created_at, last_login 
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async findByBeneficiaryId(beneficiaryId) {
    const result = await db.query(
      'SELECT id, email, username, role, beneficiary_id FROM users WHERE beneficiary_id = $1',
      [beneficiaryId]
    );
    return result.rows[0];
  }

  async updateProfile(userId, userData) {
    const { username, email } = userData;
    
    const result = await db.query(
      `UPDATE users 
       SET username = COALESCE($1, username),
           email = COALESCE($2, email),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, email, username, role, beneficiary_id, is_verified, is_active`,
      [username, email, userId]
    );
    
    return result.rows[0];
  }

  async updatePassword(userId, newPasswordHash) {
    const result = await db.query(
      `UPDATE users 
       SET password_hash = $1, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2
       RETURNING id`,
      [newPasswordHash, userId]
    );
    
    return result.rows[0];
  }

  async deactivate(userId) {
    const result = await db.query(
      `UPDATE users 
       SET is_active = false, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1
       RETURNING id, is_active`,
      [userId]
    );
    
    return result.rows[0];
  }

  async activate(userId) {
    const result = await db.query(
      `UPDATE users 
       SET is_active = true, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1
       RETURNING id, is_active`,
      [userId]
    );
    
    return result.rows[0];
  }

  async list(filters = {}) {
    let query = `
      SELECT id, email, username, role, beneficiary_id, is_verified, is_active, created_at, last_login
      FROM users
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (filters.role) {
      query += ` AND role = $${paramCount}`;
      params.push(filters.role);
      paramCount++;
    }
    
    if (filters.isActive !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      params.push(filters.isActive);
      paramCount++;
    }
    
    if (filters.search) {
      query += ` AND (email ILIKE $${paramCount} OR username ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = new UserModel();