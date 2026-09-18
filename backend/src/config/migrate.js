/**
 * Aplica database/schema.sql contra la base de datos apuntada por
 * DATABASE_URL (o las variables sueltas DB_HOST/DB_USER/etc. en local).
 *
 * package.json ya tenía el script "migrate": "node src/config/migrate.js"
 * pero este archivo no existía — se agrega ahora para poder correr:
 *
 *   npm run migrate
 *
 * Es seguro correrlo varias veces: todo el schema.sql usa
 * "CREATE TABLE IF NOT EXISTS" / "CREATE INDEX IF NOT EXISTS".
 */
const fs = require('fs');
const path = require('path');
const db = require('./database');

async function migrate() {
  const schemaPath = path.join(__dirname, '../../../database/schema.sql');

  if (!fs.existsSync(schemaPath)) {
    console.error('❌ No se encontró database/schema.sql en:', schemaPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('🔄 Aplicando database/schema.sql ...');

  try {
    await db.query(sql);
    console.log('✅ Migración completada exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al migrar:', error.message);
    process.exit(1);
  }
}

migrate();