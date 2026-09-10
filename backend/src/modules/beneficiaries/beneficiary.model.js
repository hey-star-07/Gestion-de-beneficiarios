const db = require('../../config/database');

class BeneficiaryModel {
  async findById(id) {
    const result = await db.query(
      `SELECT * FROM beneficiaries WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async findByCode(code) {
    const result = await db.query(
      'SELECT * FROM beneficiaries WHERE code = $1',
      [code]
    );
    return result.rows[0];
  }

  async list(filters = {}) {
    let query = `
      SELECT b.*, 
             u.id as user_id, u.email as user_email, u.is_verified
      FROM beneficiaries b
      LEFT JOIN users u ON b.id = u.beneficiary_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (filters.search) {
      query += ` AND (b.first_name ILIKE $${paramCount} OR b.last_name ILIKE $${paramCount} OR b.code ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }
    
    query += ' ORDER BY b.code ASC';
    
    const result = await db.query(query, params);
    return result.rows;
  }

  async create(beneficiaryData) {
    const {
      code, firstName, lastName, address, mapLink, phone,
      familyMembersCount, croquisFile, churchAttendance, isBaptized,
      churchName, pastorName, pastorPhone, isWorking, workplace, workPhone
    } = beneficiaryData;
    
    const result = await db.query(
      `INSERT INTO beneficiaries (
        code, first_name, last_name, address, map_link, phone,
        family_members_count, croquis_file, church_attendance, is_baptized,
        church_name, pastor_name, pastor_phone, is_working, workplace, work_phone
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        code, firstName, lastName, address, mapLink, phone,
        familyMembersCount, croquisFile, churchAttendance, isBaptized,
        churchName, pastorName, pastorPhone, isWorking, workplace, workPhone
      ]
    );
    
    return result.rows[0];
  }

  async update(id, beneficiaryData) {
    const {
      firstName, lastName, address, mapLink, phone,
      familyMembersCount, croquisFile, churchAttendance, isBaptized,
      churchName, pastorName, pastorPhone, isWorking, workplace, workPhone
    } = beneficiaryData;
    
    const result = await db.query(
      `UPDATE beneficiaries SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        address = COALESCE($3, address),
        map_link = COALESCE($4, map_link),
        phone = COALESCE($5, phone),
        family_members_count = COALESCE($6, family_members_count),
        croquis_file = COALESCE($7, croquis_file),
        church_attendance = COALESCE($8, church_attendance),
        is_baptized = COALESCE($9, is_baptized),
        church_name = COALESCE($10, church_name),
        pastor_name = COALESCE($11, pastor_name),
        pastor_phone = COALESCE($12, pastor_phone),
        is_working = COALESCE($13, is_working),
        workplace = COALESCE($14, workplace),
        work_phone = COALESCE($15, work_phone),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING *`,
      [
        firstName, lastName, address, mapLink, phone,
        familyMembersCount, croquisFile, churchAttendance, isBaptized,
        churchName, pastorName, pastorPhone, isWorking, workplace, workPhone,
        id
      ]
    );
    
    return result.rows[0];
  }

  async delete(id) {
    await db.query('DELETE FROM beneficiaries WHERE id = $1', [id]);
  }

  async addEducationProfile(educationData) {
    const {
      beneficiaryId, 
      careerName, 
      yearOfStudy, 
      semester,
      institution, 
      institutionAddress, 
      institutionMapLink,
      yearSemester,
      scheduleFile
    } = educationData;
    
    console.log('📝 Insertando educación:', educationData);
    
    // Si viene year_semester del frontend, usarlo
    let finalYearOfStudy = yearOfStudy;
    let finalSemester = semester;
    
    if (yearSemester) {
      // Intentar extraer año y semestre del texto
      const yearMatch = yearSemester.match(/(\d+)/);
      if (yearMatch) {
        finalYearOfStudy = parseInt(yearMatch[1]);
      }
      
      // Si es por semestre solamente
      if (yearSemester.toLowerCase().includes('semestre')) {
        const semesterMatch = yearSemester.match(/(\d+)\s*(?:°|er|do|to|ro)?\s*semestre/i);
        if (semesterMatch) {
          finalSemester = parseInt(semesterMatch[1]);
        }
      }
    }
    
    const result = await db.query(
      `INSERT INTO education_profiles (
        beneficiary_id, career_name, year_of_study, semester,
        institution, institution_address, institution_map_link, 
        year_semester, schedule_file, is_primary
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false)
      RETURNING *`,
      [
        beneficiaryId, careerName, finalYearOfStudy, finalSemester,
        institution, institutionAddress, institutionMapLink,
        yearSemester, scheduleFile
      ]
    );
    
    console.log('✅ Educación insertada:', result.rows[0]);
    return result.rows[0];
  }

  async getEducationProfiles(beneficiaryId) {
    const result = await db.query(
      `SELECT * FROM education_profiles 
      WHERE beneficiary_id = $1 
      ORDER BY is_primary DESC, created_at DESC`,
      [beneficiaryId]
    );
    return result.rows;
  }

  async addFamilyMember(familyData) {
    const { beneficiaryId, fullName, phone, relationship } = familyData;
    
    console.log('📝 Insertando familiar:', familyData);
    
    const result = await db.query(
      `INSERT INTO family_members (beneficiary_id, full_name, phone, relationship)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [beneficiaryId, fullName, phone, relationship]
    );
    
    console.log('✅ Familiar insertado:', result.rows[0]);
    return result.rows[0];
  }

  async getFamilyMembers(beneficiaryId) {
    const result = await db.query(
      'SELECT * FROM family_members WHERE beneficiary_id = $1 ORDER BY created_at',
      [beneficiaryId]
    );
    return result.rows;
  }

  // Actualizar el método getCompleteProfile para incluir todos los datos
  async getCompleteProfile(beneficiaryId) {
    console.log('🔍 Obteniendo perfil completo para ID:', beneficiaryId);
    
    const beneficiary = await this.findById(beneficiaryId);
    
    if (!beneficiary) {
      console.log('❌ Beneficiario no encontrado');
      return null;
    }
    
    // Obtener educación y familia en paralelo
    const [educationProfiles, familyMembers] = await Promise.all([
      this.getEducationProfiles(beneficiaryId),
      this.getFamilyMembers(beneficiaryId)
    ]);
    
    console.log('📋 Educación encontrada:', educationProfiles);
    console.log('👨‍👩‍👧‍👦 Familia encontrada:', familyMembers);
    
    return {
      ...beneficiary,
      educationProfiles,
      familyMembers
    };
  }

  async update(id, beneficiaryData) {
    const {
      firstName, lastName, address, mapLink, phone,
      familyMembersCount, croquisFile, 
      churchAttendance, isBaptized,
      churchName, pastorName, pastorPhone, 
      isWorking, workplace, workPhone
    } = beneficiaryData;
    
    console.log('📝 Actualizando beneficiario ID:', id);
    console.log('📤 Datos:', beneficiaryData);
    
    // Lógica especial para trabajo:
    // Si isWorking es false, limpiar workplace y workPhone
    const finalWorkplace = isWorking === false ? null : workplace;
    const finalWorkPhone = isWorking === false ? null : workPhone;
    
    // Lógica especial para iglesia:
    // Si churchAttendance es false, limpiar churchName, pastorName, pastorPhone
    const finalChurchName = churchAttendance === false ? null : churchName;
    const finalPastorName = churchAttendance === false ? null : pastorName;
    const finalPastorPhone = churchAttendance === false ? null : pastorPhone;
    
    const result = await db.query(
      `UPDATE beneficiaries SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        address = COALESCE($3, address),
        map_link = COALESCE($4, map_link),
        phone = COALESCE($5, phone),
        family_members_count = COALESCE($6, family_members_count),
        croquis_file = COALESCE($7, croquis_file),
        church_attendance = COALESCE($8, church_attendance),
        is_baptized = COALESCE($9, is_baptized),
        church_name = $10,
        pastor_name = $11,
        pastor_phone = $12,
        is_working = COALESCE($13, is_working),
        workplace = $14,
        work_phone = $15,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING *`,
      [
        firstName, 
        lastName, 
        address, 
        mapLink, 
        phone,
        familyMembersCount, 
        croquisFile, 
        churchAttendance, 
        isBaptized,
        finalChurchName, 
        finalPastorName, 
        finalPastorPhone, 
        isWorking, 
        finalWorkplace, 
        finalWorkPhone,
        id
      ]
    );
    
    console.log('✅ Beneficiario actualizado:', result.rows[0]);
    return result.rows[0];
  }

  async getEducationProfiles(beneficiaryId) {
    const result = await db.query(
      `SELECT * FROM education_profiles 
      WHERE beneficiary_id = $1 
      ORDER BY is_primary DESC, created_at DESC`,
      [beneficiaryId]
    );
    console.log('📚 Estudios del beneficiario:', result.rows);
    return result.rows;
  }

  async getFamilyMembers(beneficiaryId) {
    const result = await db.query(
      `SELECT * FROM family_members 
      WHERE beneficiary_id = $1 
      ORDER BY created_at`,
      [beneficiaryId]
    );
    console.log('👨‍👩‍👧‍👦 Familiares del beneficiario:', result.rows);
    return result.rows;
  }
}

module.exports = new BeneficiaryModel();