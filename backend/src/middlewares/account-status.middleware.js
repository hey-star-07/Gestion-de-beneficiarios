const UserModel = require('../modules/users/user.service');
const SettingService = require('../modules/settings/setting.service');

/**
 * Guard de ESCRITURA (agregar / editar / eliminar / subir archivos).
 *
 * Nunca bloquea el login ni la lectura: un beneficiario deshabilitado
 * debe poder entrar y ver todos sus datos y documentos.
 *
 * IMPORTANTE: el permiso de escritura depende UNICAMENTE de `is_active`.
 * La fecha limite no bloquea por si sola: cuando vence, deshabilita
 * automaticamente a los beneficiarios (is_active = false). Asi, si el
 * admin vuelve a habilitar a alguien despues del vencimiento, esa
 * persona puede editar de inmediato -- que es justamente lo que no
 * ocurria cuando la fecha se validaba por separado.
 */
const checkActiveStatusMiddleware = async (req, res, next) => {
  try {
    // El ADMIN siempre puede modificar
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Si el plazo acaba de vencer, aplicar la desactivacion automatica
    // antes de decidir (evita una ventana en la que aun se podria escribir).
    await SettingService.applyDeadlineExpiryIfNeeded();

    const user = await UserModel.findById(req.user.userId);

    if (user && user.is_active === false) {
      return res.status(403).json({
        success: false,
        error: 'Tu cuenta esta deshabilitada para modificar datos. Puedes ver tu informacion, pero no editarla. Contacta al administrador.',
        code: 'ACCOUNT_DISABLED'
      });
    }

    next();
  } catch (error) {
    console.error('Error verificando estado de la cuenta:', error);
    // Ante un error inesperado, no bloqueamos al usuario
    next();
  }
};

module.exports = { checkActiveStatusMiddleware };