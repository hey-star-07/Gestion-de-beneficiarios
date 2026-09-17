const db = require('../../config/database');

// Logs de depuración: se activan solo con DEBUG_DB=true en el .env
const DEBUG = process.env.DEBUG_DB === 'true';
const log = (...args) => { if (DEBUG) console.log(...args); };

// Mapa campo (camelCase que llega del controlador) -> columna real en la BD
const UPDATABLE_FIELDS = {
  firstName: 'first_name',
  lastName: 'last_name',
  address: 'address',
  mapLink: 'map_link',
  phone: 'phone',
  familyMembersCount: 'family_members_count',
  croquisFile: 'croquis_file',
  churchAttendance: 'church_attendance',
  isBaptized: 'is_baptized',
  churchName: 'church_name',
  pastorName: 'pastor_name',
  pastorPhone: 'pastor_phone',
  isWorking: 'is_working',
  workplace: 'workplace',
  workPhone: 'work_phone'
};

class BeneficiaryModel {
  // NOTA: is_active vive en la tabla `users`, no en `beneficiaries`.
  // Por eso estas consultas hacen JOIN: sin él, el panel del admin
  // recibía is_active = undefined y siempre mostraba "ACTIVO".
  async findById(id) {
    const result = await db.query(
      `SELECT b.*, u.is_active
       FROM beneficiaries b
       LEFT JOIN users u ON b.id = u.beneficiary_id
       WHERE b.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async findByCode(code) {
    const result = await db.query(
      `SELECT b.*, u.is_active
       FROM beneficiaries b
       LEFT JOIN users u ON b.id = u.beneficiary_id
       WHERE b.code = $1`,
      [code]
    );
    return result.rows[0];
  }

  async list(filters = {}) {
    let query = `
      SELECT b.*,
             u.id as user_id, u.email as user_email, u.is_verified, u.is_active
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

  /**
   * UPDATE PARCIAL.
   *
   * Regla clave: solo se escriben en la BD las columnas que realmente
   * vienen en el payload. Un campo `undefined` (porque el formulario de
   * Iglesia no manda datos de Trabajo, y viceversa) se IGNORA; ya no se
   * manda como NULL, que era lo que borraba la sección contraria.
   *
   * Un `null` explícito sí se escribe: eso permite limpiar los campos
   * cuando el usuario marca "No" en iglesia/trabajo.
   */
  async update(id, beneficiaryData = {}) {
    const data = { ...beneficiaryData };

    // Si contesta "No", se limpian los campos dependientes.
    if (data.churchAttendance === false) {
      data.churchName = null;
      data.pastorName = null;
      data.pastorPhone = null;
    }
    if (data.isWorking === false) {
      data.workplace = null;
      data.workPhone = null;
    }

    const setClauses = [];
    const values = [];

    for (const [field, column] of Object.entries(UPDATABLE_FIELDS)) {
      if (data[field] === undefined) continue; // no vino -> no se toca
      values.push(data[field]);
      setClauses.push(`${column} = $${values.length}`);
    }

    if (setClauses.length === 0) {
      log('⚠️ update sin campos válidos, no se modifica nada. ID:', id);
      return await this.findById(id);
    }

    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE beneficiaries
      SET ${setClauses.join(', ')}
      WHERE id = $${values.length}
      RETURNING *`;

    log('📝 Actualizando beneficiario ID:', id, '| campos:', setClauses);

    const result = await db.query(query, values);
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

    let finalYearOfStudy = yearOfStudy;
    let finalSemester = semester;

    if (yearSemester) {
      const yearMatch = yearSemester.match(/(\d+)/);
      if (yearMatch) {
        finalYearOfStudy = parseInt(yearMatch[1]);
      }

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

    log('✅ Educación insertada:', result.rows[0]);
    return result.rows[0];
  }

  async getEducationProfiles(beneficiaryId) {
    const result = await db.query(
      `SELECT * FROM education_profiles
      WHERE beneficiary_id = $1
      ORDER BY is_primary DESC, created_at DESC`,
      [beneficiaryId]
    );
    log('📚 Estudios del beneficiario:', result.rows.length);
    return result.rows;
  }

  async addFamilyMember(familyData) {
    const { beneficiaryId, fullName, phone, relationship } = familyData;

    const result = await db.query(
      `INSERT INTO family_members (beneficiary_id, full_name, phone, relationship)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [beneficiaryId, fullName, phone, relationship]
    );

    log('✅ Familiar insertado:', result.rows[0]);
    return result.rows[0];
  }

  async getFamilyMembers(beneficiaryId) {
    const result = await db.query(
      `SELECT * FROM family_members
      WHERE beneficiary_id = $1
      ORDER BY created_at`,
      [beneficiaryId]
    );
    log('👨‍👩‍👧‍👦 Familiares del beneficiario:', result.rows.length);
    return result.rows;
  }

  async getCompleteProfile(beneficiaryId) {
    const beneficiary = await this.findById(beneficiaryId);

    if (!beneficiary) {
      log('❌ Beneficiario no encontrado:', beneficiaryId);
      return null;
    }

    const [educationProfiles, familyMembers] = await Promise.all([
      this.getEducationProfiles(beneficiaryId),
      this.getFamilyMembers(beneficiaryId)
    ]);

    return {
      ...beneficiary,
      educationProfiles,
      familyMembers
    };
  }
}

module.exports = new BeneficiaryModel();