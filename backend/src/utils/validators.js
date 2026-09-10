const { body, param, query } = require('express-validator');

const validators = {
  // Validación de email
  email: () => 
    body('email')
      .isEmail()
      .withMessage('Debe ser un email válido')
      .normalizeEmail(),
  
  // Validación de contraseña
  password: () =>
    body('password')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres')
      .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
      .withMessage('La contraseña debe contener letras y números'),
  
  // Validación de código de beneficiario
  beneficiaryCode: () =>
    body('beneficiaryCode')
      .optional()
      .isString()
      .withMessage('Código de beneficiario inválido')
      .trim(),
  
  // Validación de ID
  idParam: () =>
    param('id')
      .isInt()
      .withMessage('ID inválido'),
  
  // Validación de paginación
  pagination: () => [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Página inválida'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Límite inválido')
  ]
};

module.exports = validators;