import api from './api'

export const beneficiaryService = {
  // ============================================
  // MÉTODOS GENERALES
  // ============================================
  getAll: async () => {
    const response = await api.get('/beneficiaries')
    return response
  },
  
  getById: async (id) => {
    const response = await api.get(`/beneficiaries/${id}`)
    return response
  },
  
  getByCode: async (code) => {
    console.log('🔍 getByCode llamado con:', code)
    const response = await api.get(`/beneficiaries/code/${code}`)
    console.log('📦 getByCode respuesta:', response)
    return response
  },
  
  getCompleteProfile: async (id) => {
    console.log('🔍 getCompleteProfile llamado con ID:', id)
    if (!id) {
      throw new Error('ID de beneficiario no proporcionado')
    }
    const response = await api.get(`/beneficiaries/${id}/complete`)
    console.log('📦 getCompleteProfile respuesta:', response)
    return response
  },
  
  // ============================================
  // PERFIL PROPIO (USUARIO)
  // ============================================
  getMyProfile: async () => {
    const response = await api.get('/beneficiaries/my-profile')
    return response.data
  },
  
  updateMyProfile: async (data) => {
    const response = await api.put('/beneficiaries/my-profile', data)
    return response.data
  },
  
  uploadFile: async (formData) => {
    try {
      console.log('📤 Subiendo archivo...')
      const response = await api.post('/beneficiaries/my-profile/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log('✅ Respuesta de upload:', response)
      return response.data
    } catch (error) {
      console.error('❌ Error en uploadFile:', error)
      throw error
    }
  },

  // ============================================
  // CRUD ADMIN
  // ============================================
  create: (data) => api.post('/beneficiaries', data),
  update: (id, data) => api.put(`/beneficiaries/${id}`, data),
  delete: (id) => api.delete(`/beneficiaries/${id}`),

  // ============================================
  // MÉTODOS PARA EDUCACIÓN
  // ============================================
  addEducation: async (id, data) => {
    try {
      console.log('📤 Agregando educación con datos:', data);
      
      const payload = {
        career_name: data.career_name,
        institution: data.institution,
        year_semester: data.year_semester,
        institution_address: data.institution_address,
        institution_map_link: data.institution_map_link,
        year_of_study: data.year_of_study || null,
        semester: data.semester || null
      };
      
      console.log('📦 Payload a enviar:', payload);
      
      const response = await api.post(`/beneficiaries/${id}/education`, payload);
      console.log('✅ Respuesta addEducation:', response);
      return response;
    } catch (error) {
      console.error('❌ Error en addEducation:', error);
      console.error('❌ Detalles:', error.response?.data);
      throw error;
    }
  },

  updateEducation: async (educationId, data) => {
    try {
      console.log('📤 Actualizando educación:', educationId, data);
      const response = await api.put(`/beneficiaries/education/${educationId}`, data);
      console.log('✅ Respuesta:', response);
      return response;
    } catch (error) {
      console.error('❌ Error en updateEducation:', error);
      throw error;
    }
  },

  deleteEducation: async (educationId) => {
    try {
      console.log('🗑️ Eliminando educación:', educationId);
      const response = await api.delete(`/beneficiaries/education/${educationId}`);
      console.log('✅ Respuesta:', response);
      return response;
    } catch (error) {
      console.error('❌ Error en deleteEducation:', error);
      throw error;
    }
  },

  uploadSchedule: async (educationId, formData) => {
    try {
      const response = await api.post(
        `/beneficiaries/education/${educationId}/upload-schedule`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response;
    } catch (error) {
      console.error('Error en uploadSchedule:', error);
      throw error;
    }
  },

  // ============================================
  // MÉTODOS PARA FAMILIA
  // ============================================
  addFamilyMember: async (id, data) => {
    try {
      console.log('📤 Agregando familiar:', data);
      
      const response = await api.post(`/beneficiaries/${id}/family`, data);
      console.log('✅ Respuesta addFamilyMember:', response);
      return response;
    } catch (error) {
      console.error('❌ Error en addFamilyMember:', error);
      console.error('❌ Detalles:', error.response?.data);
      throw error;
    }
  },

  updateFamilyMember: async (familyId, data) => {
    try {
      console.log('📤 Actualizando familiar:', familyId, data);
      const response = await api.put(`/beneficiaries/family/${familyId}`, data);
      console.log('✅ Respuesta:', response);
      return response;
    } catch (error) {
      console.error('❌ Error en updateFamilyMember:', error);
      throw error;
    }
  },

  deleteFamilyMember: async (familyId) => {
    try {
      console.log('🗑️ Eliminando familiar:', familyId);
      const response = await api.delete(`/beneficiaries/family/${familyId}`);
      console.log('✅ Respuesta:', response);
      return response;
    } catch (error) {
      console.error('❌ Error en deleteFamilyMember:', error);
      throw error;
    }
  },

  toggleBeneficiaryStatus: async (id, isActive) => {
    try {
      const response = await api.put(`/beneficiaries/${id}/toggle-status`, {
        is_active: isActive
      })
      return response.data
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      throw error
    }
  },

  getBeneficiaryStatus: async (id) => {
    try {
      const response = await api.get(`/beneficiaries/${id}/status`)
      return response.data
    } catch (error) {
      console.error('Error al obtener estado:', error)
      throw error
    }
  }
}