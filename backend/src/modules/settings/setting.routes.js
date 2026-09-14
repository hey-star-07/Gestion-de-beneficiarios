const express = require('express');
const router = express.Router();
const SettingController = require('./setting.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { roleMiddleware } = require('../../middlewares/role.middleware');

// RUTA PÚBLICA - No requiere autenticación
// Los usuarios necesitan ver la fecha límite antes de autenticarse
router.get('/deadline/public', SettingController.getDeadline);

// Rutas que SÍ requieren autenticación
router.get('/deadline', authMiddleware, SettingController.getDeadline);
router.post('/deadline', authMiddleware, roleMiddleware('ADMIN'), SettingController.setDeadline);
router.delete('/deadline', authMiddleware, roleMiddleware('ADMIN'), SettingController.removeDeadline);
router.get('/', authMiddleware, roleMiddleware('ADMIN'), SettingController.getAllSettings);

module.exports = router;