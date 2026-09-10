const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Importar configuración
const authConfig = require('./config/auth');

// Importar rutas
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const beneficiaryRoutes = require('./modules/beneficiaries/beneficiary.routes');

// Importar middlewares
const { errorHandler } = require('./utils/errors');
const logger = require('./utils/logger');

const app = express();

// Configurar trust proxy para producción
app.set('trust proxy', 1);

// Middlewares de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// Configuración CORS - PERMITIR TODO EN DESARROLLO
app.use(cors({
  origin: true, // Permitir cualquier origen en desarrollo
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middlewares básicos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Morgan para logging
app.use(morgan('dev'));

// Servir archivos estáticos
const { UPLOAD_ROOT } = require('./config/upload');
app.use('/uploads', express.static(UPLOAD_ROOT));
console.log('📁 Sirviendo archivos desde:', UPLOAD_ROOT);

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Ruta raíz de la API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API de Gestión de Beneficiarios',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      beneficiaries: '/api/beneficiaries'
    }
  });
});

// MANEJO DE RUTAS NO ENCONTRADAS (SOLO PARA API)
app.use('/api/*', (req, res) => {
  console.log('❌ Ruta API no encontrada:', req.originalUrl);
  res.status(404).json({
    success: false,
    error: 'Ruta de API no encontrada',
    path: req.originalUrl
  });
});

// Para cualquier otra ruta, devolver 404 simple (no error)
app.use((req, res) => {
  console.log('ℹ️  Ruta no API ignorada:', req.originalUrl);
  res.status(404).send('Not Found');
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  // Si es un error de ruta, devolver 404 simple
  if (err.status === 404 || err.statusCode === 404) {
    return res.status(404).json({
      success: false,
      error: 'Ruta no encontrada'
    });
  }
  
  // Para otros errores
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('🚀 Servidor backend corriendo en puerto', PORT);
  console.log('📋 Ambiente:', process.env.NODE_ENV || 'development');
  console.log('🔗 API disponible en:', `http://localhost:${PORT}/api`);
  console.log('💡 Frontend debe estar en: http://localhost:5173');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('Error no manejado (Promise):', err);
});

process.on('uncaughtException', (err) => {
  console.error('Excepción no capturada:', err);
});

module.exports = app;