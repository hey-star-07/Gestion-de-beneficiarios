const { Pool } = require('pg');
require('dotenv').config();

// Neon y Supabase entregan una sola cadena de conexión (DATABASE_URL) y
// EXIGEN SSL. Si existe DATABASE_URL se usa esa (producción); si no,
// se arma la conexión con las variables sueltas de siempre (desarrollo
// local con Postgres en tu máquina, que normalmente no usa SSL).
const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'gestion_beneficiarios',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      // DB_SSL=true por si en algún momento conectas a un Postgres local
      // o de otro proveedor que también exija SSL sin usar DATABASE_URL.
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    };

const pool = new Pool({
  ...connectionConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test de conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ ERROR DE CONEXIÓN A LA BASE DE DATOS:', err.message);
    console.error('   Verifica que:');
    console.error('   1. DATABASE_URL (o DB_HOST/DB_USER/DB_PASSWORD) sea correcta');
    console.error('   2. La base de datos exista y acepte conexiones SSL');
    console.error('   3. Si usas Neon/Supabase, que la cadena incluya ?sslmode=require');
  } else {
    console.log('✅ CONECTADO A POSTGRESQL EXITOSAMENTE');
    console.log(`   Modo: ${process.env.DATABASE_URL ? 'DATABASE_URL (producción)' : 'variables sueltas (local)'}`);
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