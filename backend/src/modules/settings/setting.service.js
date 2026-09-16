const SettingModel = require('./setting.model');
const UserModel = require('../users/user.service');

// Guarda para qué fecha límite ya se ejecutó la desactivación automática,
// para no volver a deshabilitar a alguien que el admin ya rehabilitó.
const EXPIRY_APPLIED_KEY = 'deadline_expiry_applied_for';

class SettingService {
  /**
   * Si la fecha límite ya venció y todavía no se aplicó la desactivación
   * automática para ESA fecha, deshabilita a todos los beneficiarios.
   *
   * Es idempotente: se ejecuta una sola vez por cada fecha límite. Así, si
   * el admin vuelve a habilitar a un beneficiario después del vencimiento,
   * no se lo vuelve a deshabilitar en la siguiente llamada.
   */
  async applyDeadlineExpiryIfNeeded() {
    const setting = await SettingModel.getByKey('data_submission_deadline');

    if (!setting || !setting.setting_value) return;

    const deadlineValue = setting.setting_value;
    const isExpired = new Date(deadlineValue) < new Date();

    if (!isExpired) return;

    const applied = await SettingModel.getByKey(EXPIRY_APPLIED_KEY);

    // Ya se aplicó para esta misma fecha límite: no hacer nada
    if (applied && applied.setting_value === deadlineValue) return;

    const disabled = await UserModel.deactivateAllBeneficiaries();

    await SettingModel.upsert(
      EXPIRY_APPLIED_KEY,
      deadlineValue,
      'Fecha límite para la cual ya se aplicó la desactivación automática',
      null
    );

    console.log(`⏰ Plazo vencido: ${disabled.length} beneficiario(s) deshabilitado(s) automáticamente`);
  }

  async getDataSubmissionDeadline() {
    // Aplicar la desactivación automática si corresponde
    await this.applyDeadlineExpiryIfNeeded();

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

    // Es una fecha límite nueva: al vencer, deberá aplicarse de nuevo
    // la desactivación automática.
    await SettingModel.deleteByKey(EXPIRY_APPLIED_KEY);
    
    return result;
  }

  async removeDataSubmissionDeadline(updatedBy) {
    await SettingModel.upsert(
      'data_submission_deadline',
      null,
      'Fecha límite para que los Patrocinados puedan modificar sus datos',
      updatedBy
    );

    await SettingModel.deleteByKey(EXPIRY_APPLIED_KEY);
    
    return { message: 'Fecha límite eliminada' };
  }

  async getAllSettings() {
    return await SettingModel.getAll();
  }
}

module.exports = new SettingService();