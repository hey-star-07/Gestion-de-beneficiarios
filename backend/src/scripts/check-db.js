const db = require('../config/database');

async function checkDatabase() {
  console.log('🔍 Verificando base de datos...\n');
  
  try {
    // Verificar estructura de la tabla users
    console.log('📋 Estructura de la tabla users:');
    const usersResult = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    usersResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Verificar usuarios existentes
    console.log('\n👥 Usuarios registrados:');
    const usersList = await db.query(`
      SELECT id, email, username, role, is_verified, is_active, beneficiary_id
      FROM users
      ORDER BY id
    `);
    
    usersList.rows.forEach(user => {
      console.log(`  ID: ${user.id} | Email: ${user.email} | Username: ${user.username} | Rol: ${user.role} | Verificado: ${user.is_verified} | Activo: ${user.is_active}`);
    });
    
    // Verificar beneficiarios
    console.log('\n👤 Beneficiarios registrados:');
    const beneficiariesList = await db.query(`
      SELECT id, code, first_name, last_name, email
      FROM beneficiaries
      ORDER BY id
    `);
    
    beneficiariesList.rows.forEach(b => {
      console.log(`  ID: ${b.id} | Código: ${b.code} | Nombre: ${b.first_name} ${b.last_name} | Email: ${b.email}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al verificar base de datos:', error);
    process.exit(1);
  }
}

checkDatabase();