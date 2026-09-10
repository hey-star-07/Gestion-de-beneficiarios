import api from './api'

export const beneficiaryService = {
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
    try {
      console.log('🔍 Obteniendo perfil completo para ID:', id);
      
      const response = await api.get(`/beneficiaries/${id}/complete`);
      console.log('📦 Respuesta perfil completo:', response);
      
      // Asegurarse de que los arrays existan
      if (response.data?.data) {
        response.data.data.educationProfiles = response.data.data.educationProfiles || [];
        response.data.data.familyMembers = response.data.data.familyMembers || [];
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error en getCompleteProfile:', error);
      throw error;
    }
  },
  
  getMyProfile: async () => {
    const response = await api.get('/beneficiaries/my-profile')
    return response.data
  },
  
  updateMyProfile: async (data) => {
    const response = await api.put('/beneficiaries/my-profile', data)
    return response.data
  },
  
  addEducation: async (id, data) => {
    try {
      console.log('📤 Agregando educación con datos:', data);
      
      // Asegurarse de enviar los campos correctos
      const payload = {
        career_name: data.career_name,
        institution: data.institution,
        year_semester: data.year_semester,
        institution_address: data.institution_address,
        institution_map_link: data.institution_map_link,
        // Si hay year_of_study y semester, enviarlos también
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
  
  // Agregar al servicio
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

  uploadSchedule: async (educationId, formData) => {
    try {
      const response = await api.post(`/beneficiaries/education/${educationId}/upload-schedule`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error en uploadSchedule:', error)
      throw error
    }
  }
}