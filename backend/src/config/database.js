const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'gestion_beneficiarios',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test de conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ ERROR DE CONEXIÓN A LA BASE DE DATOS:', err.message);
    console.error('   Verifica que:');
    console.error('   1. PostgreSQL esté corriendo');
    console.error('   2. Las credenciales en .env sean correctas');
    console.error('   3. La base de datos "gestion_beneficiarios" exista');
  } else {
    console.log('✅ CONECTADO A POSTGRESQL EXITOSAMENTE');
    console.log(`   Base de datos: ${process.env.DB_NAME || 'gestion_beneficiarios'}`);
    release();
  }
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de conexiones:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  getClient: () => pool.connect()
};