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
      const beneficiary = await beneficiaryService.updateBeneficiary(
        req.params.id,
        req.body
      );
      
      res.json({
        success: true,
        message: 'Beneficiario actualizado exitosamente',
        data: beneficiary
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
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
}

module.exports = new BeneficiaryController();