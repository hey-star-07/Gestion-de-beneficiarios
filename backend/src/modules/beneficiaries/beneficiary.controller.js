const beneficiaryService = require('./beneficiary.service');
const { validationResult } = require('express-validator');

class BeneficiaryController {
  async list(req, res) {
    try {
      const beneficiaries = await beneficiaryService.listBeneficiaries(req.query);
      
      // Asegurarse de que la respuesta sea un array directamente
      res.json(beneficiaries); // En lugar de { success: true, data: beneficiaries }
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async getById(req, res) {
    try {
      const beneficiary = await beneficiaryService.getBeneficiaryById(req.params.id);
      
      res.json({
        success: true,
        data: beneficiary
      });
    } catch (error) {
      res.status(404).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async getByCode(req, res) {
    try {
      const { code } = req.params;
      console.log('getByCode - Código recibido:', code);
      
      const beneficiary = await beneficiaryService.getBeneficiaryByCode(code);
      console.log('👤 Beneficiario encontrado:', beneficiary);
      
      res.json({
        success: true,
        data: beneficiary
      });
    } catch (error) {
      console.error('❌ Error en getByCode:', error);
      res.status(404).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async getCompleteProfile(req, res) {
    try {
      const profile = await beneficiaryService.getCompleteProfile(req.params.id);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      res.status(404).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array() 
        });
      }

      const beneficiary = await beneficiaryService.createBeneficiary(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Beneficiario creado exitosamente',
        data: beneficiary
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async update(req, res) {
    try {
      const b = req.body;
      const updateData = {
        firstName: b.first_name ?? b.firstName,
        lastName: b.last_name ?? b.lastName,
        address: b.address,
        mapLink: b.map_link ?? b.mapLink,
        phone: b.phone,
        familyMembersCount: b.family_members_count ?? b.familyMembersCount,
        croquisFile: b.croquis_file ?? b.croquisFile,
        churchAttendance: b.church_attendance ?? b.churchAttendance,
        isBaptized: b.is_baptized ?? b.isBaptized,
        churchName: b.church_name ?? b.churchName,
        pastorName: b.pastor_name ?? b.pastorName,
        pastorPhone: b.pastor_phone ?? b.pastorPhone,
        isWorking: b.is_working ?? b.isWorking,
        workplace: b.workplace,
        workPhone: b.work_phone ?? b.workPhone
      };

      const beneficiary = await beneficiaryService.updateBeneficiary(
        req.params.id,
        updateData
      );

      res.json({
        success: true,
        message: 'Beneficiario actualizado exitosamente',
        data: beneficiary
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async delete(req, res) {
    try {
      await beneficiaryService.deleteBeneficiary(req.params.id);
      
      res.json({
        success: true,
        message: 'Beneficiario eliminado exitosamente'
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async addEducationProfile(req, res) {
    try {
      console.log('📥 Datos recibidos para agregar educación:', req.body);
      console.log('👤 Beneficiario ID:', req.params.id);
      
      const { id } = req.params;
      
      // Mapear campos del frontend al backend
      const educationData = {
        beneficiaryId: id,
        careerName: req.body.career_name,
        yearOfStudy: req.body.year_of_study,
        semester: req.body.semester,
        institution: req.body.institution,
        institutionAddress: req.body.institution_address,
        institutionMapLink: req.body.institution_map_link,
        yearSemester: req.body.year_semester, // Nuevo campo
        scheduleFile: req.body.schedule_file
      };
      
      console.log('📤 Datos mapeados:', educationData);
      
      const educationProfile = await beneficiaryService.addEducationProfile(
        id,
        educationData
      );
      
      console.log('✅ Educación agregada:', educationProfile);
      
      res.status(201).json({
        success: true,
        message: 'Perfil educativo agregado exitosamente',
        data: educationProfile
      });
    } catch (error) {
      console.error('❌ Error al agregar educación:', error);
      res.status(400).json({ 
        success: false,
        error: error.message || 'Error al agregar estudio'
      });
    }
  }

  async addFamilyMember(req, res) {
    try {
      console.log('📥 Datos recibidos para agregar familiar:', req.body);
      console.log('👤 Beneficiario ID:', req.params.id);
      
      const { id } = req.params;
      
      // Aceptar diferentes formatos de nombres de campos
      const familyData = {
        beneficiaryId: id,
        fullName: req.body.full_name || req.body.fullName,
        phone: req.body.phone || req.body.phone_number,
        relationship: req.body.relationship || req.body.relation
      };
      
      console.log('📤 Datos mapeados:', familyData);
      
      // Validar campos requeridos
      if (!familyData.fullName) {
        return res.status(400).json({
          success: false,
          error: 'El nombre del familiar es requerido'
        });
      }
      
      const familyMember = await beneficiaryService.addFamilyMember(id, familyData);
      
      console.log('✅ Familiar agregado:', familyMember);
      
      res.status(201).json({
        success: true,
        message: 'Familiar agregado exitosamente',
        data: familyMember
      });
    } catch (error) {
      console.error('❌ Error al agregar familiar:', error);
      res.status(400).json({ 
        success: false,
        error: error.message || 'Error al agregar familiar'
      });
    }
  }

  async getMyProfile(req, res) {
    try {
      if (!req.user.beneficiaryId) {
        return res.status(404).json({
          success: false,
          error: 'No tienes un perfil de beneficiario asociado'
        });
      }
      
      const profile = await beneficiaryService.getCompleteProfile(req.user.beneficiaryId);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      res.status(404).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  async updateMyProfile(req, res) {
    try {
      console.log('📥 Datos recibidos para actualizar:', req.body);
      
      if (!req.user.beneficiaryId) {
        return res.status(404).json({
          success: false,
          error: 'No tienes un perfil de beneficiario asociado'
        });
      }
      
      // Mapear TODOS los campos correctamente
      const updateData = {
        firstName: req.body.first_name,
        lastName: req.body.last_name,
        address: req.body.address,
        mapLink: req.body.map_link,
        phone: req.body.phone,
        familyMembersCount: req.body.family_members_count,
        croquisFile: req.body.croquis_file,
        
        // Iglesia
        churchAttendance: req.body.church_attendance,
        isBaptized: req.body.is_baptized,
        churchName: req.body.church_name,
        pastorName: req.body.pastor_name,
        pastorPhone: req.body.pastor_phone,
        
        // Trabajo
        isWorking: req.body.is_working,
        workplace: req.body.workplace,
        workPhone: req.body.work_phone
      };
      
      console.log('📤 Datos mapeados:', updateData);
      
      const beneficiary = await beneficiaryService.updateBeneficiary(
        req.user.beneficiaryId,
        updateData
      );
      
      console.log('Perfil actualizado:', beneficiary);
      
      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: beneficiary
      });
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Agregar estos métodos al controlador existente

  async uploadFile(req, res) {
    try {
      console.log('📤 Subiendo archivo...');
      console.log('Archivo:', req.file);
      console.log('Usuario:', req.user);
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se proporcionó ningún archivo'
        });
      }
      
      if (!req.user.beneficiaryId) {
        return res.status(404).json({
          success: false,
          error: 'No tienes un perfil de beneficiario asociado'
        });
      }
      
      // Determinar el tipo de archivo
      let fileField = 'croquis_file';
      if (req.file.fieldname === 'schedule_file') {
        fileField = 'schedule_file';
      } else if (req.file.fieldname === 'croquis_file') {
        fileField = 'croquis_file';
      }
      
      // Guardar la ruta del archivo en la base de datos
      const db = require('../../config/database');
      
      if (fileField === 'croquis_file') {
        await db.query(
          'UPDATE beneficiaries SET croquis_file = $1 WHERE id = $2',
          [req.file.filename, req.user.beneficiaryId]
        );
      }
      
      res.json({
        success: true,
        message: 'Archivo subido exitosamente',
        data: {
          filename: req.file.filename,
          path: `/uploads/croquis/${req.file.filename}`,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    } catch (error) {
      console.error('❌ Error al subir archivo:', error);
      res.status(500).json({
        success: false,
        error: 'Error al subir el archivo'
      });
    }
  }

  async uploadScheduleFile(req, res) {
    try {
      console.log('📤 Subiendo horario de estudio...');
      console.log('Archivo:', req.file);
      console.log('ID de educación:', req.params.educationId);
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se proporcionó ningún archivo'
        });
      }
      
      // Guardar la ruta del archivo en la base de datos
      const db = require('../../config/database');
      await db.query(
        'UPDATE education_profiles SET schedule_file = $1 WHERE id = $2',
        [req.file.filename, req.params.educationId]
      );
      
      res.json({
        success: true,
        message: 'Horario subido exitosamente',
        data: {
          filename: req.file.filename,
          path: `/uploads/schedules/${req.file.filename}`,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    } catch (error) {
      console.error('❌ Error al subir horario:', error);
      res.status(500).json({
        success: false,
        error: 'Error al subir el horario'
      });
    }
  }

    // ============================================
  // MÉTODOS PARA EDUCACIÓN
  // ============================================
  async updateEducation(req, res) {
    try {
      const { educationId } = req.params;
      const data = req.body;
      
      console.log('📥 Actualizando educación ID:', educationId);
      console.log('📤 Datos:', data);
      
      const db = require('../../config/database');
      
      const result = await db.query(
        `UPDATE education_profiles SET
          career_name = COALESCE($1, career_name),
          institution = COALESCE($2, institution),
          year_semester = COALESCE($3, year_semester),
          institution_address = COALESCE($4, institution_address),
          institution_map_link = COALESCE($5, institution_map_link),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *`,
        [
          data.career_name,
          data.institution,
          data.year_semester,
          data.institution_address,
          data.institution_map_link,
          educationId
        ]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Estudio no encontrado'
        });
      }
      
      console.log('✅ Educación actualizada:', result.rows[0]);
      
      res.json({
        success: true,
        message: 'Estudio actualizado exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Error al actualizar educación:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteEducation(req, res) {
    try {
      const { educationId } = req.params;
      
      console.log('🗑️ Eliminando educación ID:', educationId);
      
      const db = require('../../config/database');
      
      const result = await db.query(
        'DELETE FROM education_profiles WHERE id = $1 RETURNING id',
        [educationId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Estudio no encontrado'
        });
      }
      
      console.log('✅ Educación eliminada');
      
      res.json({
        success: true,
        message: 'Estudio eliminado exitosamente'
      });
    } catch (error) {
      console.error('❌ Error al eliminar educación:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // ============================================
  // MÉTODOS PARA FAMILIA
  // ============================================
  async updateFamilyMember(req, res) {
    try {
      const { familyId } = req.params;
      const data = req.body;
      
      console.log('📥 Actualizando familiar ID:', familyId);
      console.log('📤 Datos:', data);
      
      const db = require('../../config/database');
      
      const result = await db.query(
        `UPDATE family_members SET
          full_name = COALESCE($1, full_name),
          phone = COALESCE($2, phone),
          relationship = COALESCE($3, relationship)
        WHERE id = $4
        RETURNING *`,
        [
          data.full_name,
          data.phone,
          data.relationship,
          familyId
        ]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Familiar no encontrado'
        });
      }
      
      console.log('✅ Familiar actualizado:', result.rows[0]);
      
      res.json({
        success: true,
        message: 'Familiar actualizado exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Error al actualizar familiar:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteFamilyMember(req, res) {
    try {
      const { familyId } = req.params;
      
      console.log('🗑️ Eliminando familiar ID:', familyId);
      
      const db = require('../../config/database');
      
      const result = await db.query(
        'DELETE FROM family_members WHERE id = $1 RETURNING id',
        [familyId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Familiar no encontrado'
        });
      }
      
      console.log('✅ Familiar eliminado');
      
      res.json({
        success: true,
        message: 'Familiar eliminado exitosamente'
      });
    } catch (error) {
      console.error('❌ Error al eliminar familiar:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async toggleBeneficiaryStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      
      console.log('🔄 Cambiando estado de beneficiario:', id, 'a', is_active);
      
      const db = require('../../config/database');
      
      // Actualizar en la tabla users
      const result = await db.query(
        `UPDATE users 
        SET is_active = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE beneficiary_id = $2
        RETURNING id, email, username, is_active`,
        [is_active, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuario asociado al beneficiario no encontrado'
        });
      }
      
      console.log('✅ Estado actualizado:', result.rows[0]);
      
      res.json({
        success: true,
        message: is_active ? 'Beneficiario habilitado exitosamente' : 'Beneficiario deshabilitado exitosamente',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getBeneficiaryStatus(req, res) {
    try {
      const { id } = req.params;
      
      const db = require('../../config/database');
      
      const result = await db.query(
        `SELECT u.id, u.email, u.username, u.is_active 
        FROM users u
        WHERE u.beneficiary_id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new BeneficiaryController();