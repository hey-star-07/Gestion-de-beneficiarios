const express = require('express');
const router = express.Router();
const beneficiaryController = require('./beneficiary.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { roleMiddleware, isOwnerOrAdmin } = require('../../middlewares/role.middleware');
const { upload } = require('../../config/upload');
const { checkDeadlineMiddleware } = require('../../middlewares/deadline.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ============================================
// RUTAS DEL PERFIL DEL USUARIO
// ============================================
router.get('/my-profile', checkDeadlineMiddleware, beneficiaryController.getMyProfile);
router.put('/my-profile', checkDeadlineMiddleware, beneficiaryController.updateMyProfile);
router.post('/my-profile/upload', upload.single('file'), beneficiaryController.uploadFile);

// ============================================
// RUTAS DE EDUCACIÓN (ESTUDIOS)
// ============================================
router.post('/:id/education', checkDeadlineMiddleware, isOwnerOrAdmin, beneficiaryController.addEducationProfile);
router.put('/education/:educationId', checkDeadlineMiddleware, beneficiaryController.updateEducation);
router.delete('/education/:educationId', checkDeadlineMiddleware, beneficiaryController.deleteEducation);
router.post('/education/:educationId/upload-schedule', 
  upload.single('schedule_file'), 
  beneficiaryController.uploadScheduleFile
);

// ============================================
// RUTAS DE FAMILIA
// ============================================
router.post('/:id/family', checkDeadlineMiddleware, isOwnerOrAdmin, beneficiaryController.addFamilyMember);
router.put('/family/:familyId', checkDeadlineMiddleware, beneficiaryController.updateFamilyMember);
router.delete('/family/:familyId', checkDeadlineMiddleware, beneficiaryController.deleteFamilyMember);

// ============================================
// RUTAS DE ADMIN
// ============================================
router.get('/', roleMiddleware('ADMIN'), beneficiaryController.list);
router.get('/code/:code', roleMiddleware('ADMIN'), beneficiaryController.getByCode);
router.post('/', roleMiddleware('ADMIN'), beneficiaryController.create);
router.get('/:id', isOwnerOrAdmin, beneficiaryController.getById);
router.get('/:id/complete', isOwnerOrAdmin, beneficiaryController.getCompleteProfile);
router.put('/:id', isOwnerOrAdmin, beneficiaryController.update);
router.delete('/:id', roleMiddleware('ADMIN'), beneficiaryController.delete);// ============================================
// RUTAS DE ADMIN PARA HABILITAR/DESHABILITAR
// ============================================
router.put('/:id/toggle-status', 
  roleMiddleware('ADMIN'), 
  beneficiaryController.toggleBeneficiaryStatus
);
module.exports = router;