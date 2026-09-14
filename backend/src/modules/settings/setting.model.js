const db = require('../../config/database');

class SettingModel {
  async getByKey(key) {
    const result = await db.query(
      'SELECT * FROM system_settings WHERE setting_key = $1',
      [key]
    );
    return result.rows[0];
  }

  async getAll() {
    const result = await db.query(
      'SELECT * FROM system_settings ORDER BY setting_key'
    );
    return result.rows;
  }

  async upsert(key, value, description, updatedBy) {
    const result = await db.query(
      `INSERT INTO system_settings (setting_key, setting_value, description, updated_by, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (setting_key) 
       DO UPDATE SET 
         setting_value = $2,
         description = COALESCE($3, system_settings.description),
         updated_by = $4,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [key, value, description, updatedBy]
    );
    return result.rows[0];
  }

  async deleteByKey(key) {
    await db.query(
      'DELETE FROM system_settings WHERE setting_key = $1',
      [key]
    );
  }
}

module.exports = new SettingModel();