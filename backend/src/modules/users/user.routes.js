const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { roleMiddleware } = require('../../middlewares/role.middleware');
const { body } = require('express-validator');

// Validaciones
const userValidation = [
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('username').optional().isString().isLength({ min: 3, max: 50 }).withMessage('Nombre de usuario debe tener entre 3 y 50 caracteres'),
    body('role').optional().isIn(['ADMIN', 'USER']).withMessage('Rol inválido'),
    body('beneficiaryCode').optional().isString().withMessage('Código de beneficiario inválido')
];

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas del perfil del usuario autenticado (cualquier rol)
router.get('/profile', userController.getProfile);
router.put('/profile', userValidation, userController.updateProfile);
router.put('/password', userController.updatePassword);

// Rutas de administración (solo ADMIN)
router.get('/', roleMiddleware('ADMIN'), userController.list);
router.get('/:id', roleMiddleware('ADMIN'), userController.getById);
router.put('/:id', roleMiddleware('ADMIN'), userValidation, userController.update);
router.delete('/:id', roleMiddleware('ADMIN'), userController.delete);
router.put('/:id/deactivate', roleMiddleware('ADMIN'), userController.deactivateUser);
router.put('/:id/activate', roleMiddleware('ADMIN'), userController.activateUser);

module.exports = router;