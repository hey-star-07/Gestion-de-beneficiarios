const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Rate limiting para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { 
    success: false, 
    error: 'Demasiados intentos de login. Por favor intenta de nuevo en 15 minutos' 
  }
});

// Validaciones
const registerValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('code').isString().notEmpty().withMessage('Código de beneficiario requerido'),
  body('firstName').isString().notEmpty().withMessage('Nombres requeridos'),
  body('lastName').isString().notEmpty().withMessage('Apellidos requeridos'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
];

const loginValidation = [
  body('identifier').notEmpty().withMessage('Email, usuario o código requerido'),
  body('password').notEmpty().withMessage('Contraseña requerida')
];

// Rutas de autenticación
router.post('/register', registerValidation, authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', loginLimiter, loginValidation, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;