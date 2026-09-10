class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Error de validación') {
    super(message, 400);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, 403);
  }
}

// Middleware para manejo de errores
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log del error
  console.error('Error:', err);
  
  // Error de PostgreSQL
  if (err.code === '23505') {
    const message = 'Dato duplicado';
    error = new ValidationError(message);
  }
  
  // Error de validación de express-validator
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ValidationError(message);
  }
  
  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    error = new UnauthorizedError('Token inválido');
  }
  
  if (err.name === 'TokenExpiredError') {
    error = new UnauthorizedError('Token expirado');
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Error interno del servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Asegúrate de exportar correctamente
module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  errorHandler
};