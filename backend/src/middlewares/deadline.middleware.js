const SettingService = require('../modules/settings/setting.service');

/**
 * Middleware que verifica si la fecha límite ha expirado
 * Solo aplica para usuarios con rol USER (no ADMIN)
 */
const checkDeadlineMiddleware = async (req, res, next) => {
  try {
    // El ADMIN siempre puede modificar
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const deadlineInfo = await SettingService.getDataSubmissionDeadline();

    // Si no hay fecha límite configurada, permitir
    if (!deadlineInfo.isActive) {
      return next();
    }

    // Si la fecha ya expiró, bloquear
    if (deadlineInfo.isExpired) {
      return res.status(403).json({
        success: false,
        error: 'El plazo para modificar datos ha expirado',
        code: 'DEADLINE_EXPIRED',
        deadline: deadlineInfo.deadline
      });
    }

    next();
  } catch (error) {
    console.error('Error verificando fecha límite:', error);
    next();
  }
};

module.exports = { checkDeadlineMiddleware };