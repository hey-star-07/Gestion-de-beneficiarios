const express = require('express');
const router = express.Router();
const beneficiaryController = require('./beneficiary.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { roleMiddleware, isOwnerOrAdmin } = require('../../middlewares/role.middleware');
const { upload } = require('../../config/upload');
const { body } = require('express-validator');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas del perfil del usuario autenticado
router.get('/my-profile', roleMiddleware('USER', 'ADMIN'), beneficiaryController.getMyProfile);
router.put('/my-profile', roleMiddleware('USER', 'ADMIN'), beneficiaryController.updateMyProfile);

// RUTA PARA SUBIR ARCHIVOS
router.post('/my-profile/upload', 
  roleMiddleware('USER', 'ADMIN'),
  upload.single('file'),
  beneficiaryController.uploadFile
);

// RUTA PARA SUBIR HORARIO DE ESTUDIO
router.post('/education/:educationId/upload-schedule',
  roleMiddleware('USER', 'ADMIN'),
  upload.single('schedule_file'),
  beneficiaryController.uploadScheduleFile
);

// Rutas de listado (ADMIN ve todos)
router.get('/', roleMiddleware('ADMIN'), beneficiaryController.list);
router.get('/code/:code', roleMiddleware('ADMIN'), beneficiaryController.getByCode);

// Rutas CRUD
router.post('/', roleMiddleware('ADMIN'), beneficiaryController.create);
router.get('/:id', isOwnerOrAdmin, beneficiaryController.getById);
router.get('/:id/complete', isOwnerOrAdmin, beneficiaryController.getCompleteProfile);
router.put('/:id', isOwnerOrAdmin, beneficiaryController.update);
router.delete('/:id', roleMiddleware('ADMIN'), beneficiaryController.delete);

// Rutas de educación y familia
router.post('/:id/education', isOwnerOrAdmin, beneficiaryController.addEducationProfile);
router.post('/:id/family', isOwnerOrAdmin, beneficiaryController.addFamilyMember);

module.exports = router;