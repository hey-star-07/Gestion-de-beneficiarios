const SettingModel = require('./setting.model');

class SettingService {
  async getDataSubmissionDeadline() {
    const setting = await SettingModel.getByKey('data_submission_deadline');
    
    if (!setting || !setting.setting_value) {
      return {
        deadline: null,
        isActive: false,
        isExpired: false,
        daysRemaining: null,
        hoursRemaining: null
      };
    }
    
    const deadline = new Date(setting.setting_value);
    const now = new Date();
    const isExpired = deadline < now;
    
    let daysRemaining = null;
    let hoursRemaining = null;
    
    if (!isExpired) {
      const diff = deadline - now;
      daysRemaining = Math.floor(diff / (1000 * 60 * 60 * 24));
      hoursRemaining = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    }
    
    return {
      deadline: setting.setting_value,
      isActive: true,
      isExpired,
      daysRemaining,
      hoursRemaining,
      updatedAt: setting.updated_at
    };
  }

  async setDataSubmissionDeadline(deadline, updatedBy) {
    if (!deadline) {
      throw new Error('La fecha límite es requerida');
    }
    
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      throw new Error('Formato de fecha inválido');
    }
    
    const result = await SettingModel.upsert(
      'data_submission_deadline',
      deadlineDate.toISOString(),
      'Fecha límite para que los Patrocinados puedan modificar sus datos',
      updatedBy
    );
    
    return result;
  }

  async removeDataSubmissionDeadline(updatedBy) {
    await SettingModel.upsert(
      'data_submission_deadline',
      null,
      'Fecha límite para que los Patrocinados puedan modificar sus datos',
      updatedBy
    );
    
    return { message: 'Fecha límite eliminada' };
  }

  async getAllSettings() {
    return await SettingModel.getAll();
  }
}

module.exports = new SettingService();