const express = require('express');
const router = express.Router();
const beneficiaryController = require('./beneficiary.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { roleMiddleware, isOwnerOrAdmin } = require('../../middlewares/role.middleware');
const { upload } = require('../../config/upload');
const { checkActiveStatusMiddleware } = require('../../middlewares/account-status.middleware');
const SettingService = require('../../modules/settings/setting.service');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Aplica la desactivación automática si el plazo ya venció, ANTES de
// responder cualquier consulta. Así el admin ve el estado real
// ("DESHABILITADO") apenas abre el panel, sin esperar a otro evento.
// Es idempotente y usa caché en memoria, por lo que no golpea la BD
// en cada petición.
router.use(async (req, res, next) => {
  try {
    await SettingService.applyDeadlineExpiryIfNeeded();
  } catch (error) {
    console.error('Error aplicando vencimiento del plazo:', error);
  }
  next();
});

// Bloquea escritura si la cuenta está deshabilitada.
// La fecha límite NO se valida aquí por separado: al vencer, deshabilita
// automáticamente a los beneficiarios, así que is_active es la única
// fuente de verdad y rehabilitar a alguien surte efecto de inmediato.
// Nunca se usa en rutas GET: ver el perfil siempre debe estar permitido.
const guardWrite = [checkActiveStatusMiddleware];

// ============================================
// RUTAS DEL PERFIL DEL USUARIO
// ============================================
router.get('/my-profile', beneficiaryController.getMyProfile);
router.put('/my-profile', ...guardWrite, beneficiaryController.updateMyProfile);
router.post('/my-profile/upload', ...guardWrite, upload.single('file'), beneficiaryController.uploadFile);

// ============================================
// RUTAS DE EDUCACIÓN (ESTUDIOS)
// ============================================
router.post('/:id/education', ...guardWrite, isOwnerOrAdmin, beneficiaryController.addEducationProfile);
router.put('/education/:educationId', ...guardWrite, beneficiaryController.updateEducation);
router.delete('/education/:educationId', ...guardWrite, beneficiaryController.deleteEducation);
router.post('/education/:educationId/upload-schedule', 
  ...guardWrite,
  upload.single('schedule_file'), 
  beneficiaryController.uploadScheduleFile
);

// ============================================
// RUTAS DE FAMILIA
// ============================================
router.post('/:id/family', ...guardWrite, isOwnerOrAdmin, beneficiaryController.addFamilyMember);
router.put('/family/:familyId', ...guardWrite, beneficiaryController.updateFamilyMember);
router.delete('/family/:familyId', ...guardWrite, beneficiaryController.deleteFamilyMember);

// ============================================
// RUTAS DE ADMIN
// ============================================
router.get('/', roleMiddleware('ADMIN'), beneficiaryController.list);
router.get('/code/:code', roleMiddleware('ADMIN'), beneficiaryController.getByCode);
router.post('/', roleMiddleware('ADMIN'), beneficiaryController.create);
router.get('/:id', isOwnerOrAdmin, beneficiaryController.getById);
router.get('/:id/complete', isOwnerOrAdmin, beneficiaryController.getCompleteProfile);
router.put('/:id', isOwnerOrAdmin, beneficiaryController.update);
router.delete('/:id', roleMiddleware('ADMIN'), beneficiaryController.delete);
// ============================================
// RUTAS DE ADMIN PARA HABILITAR/DESHABILITAR
// ============================================
router.put('/:id/toggle-status', 
  roleMiddleware('ADMIN'), 
  beneficiaryController.toggleBeneficiaryStatus
);
module.exports = router;