import api from './api'

export const settingService = {
  getDeadline: async () => {
    try {
      // Usar la ruta pública que no requiere autenticación
      const response = await api.get('/settings/deadline/public')
      return response.data
    } catch (error) {
      throw error
    }
  },

  setDeadline: async (deadline) => {
    try {
      const response = await api.post('/settings/deadline', { deadline })
      return response.data
    } catch (error) {
      throw error
    }
  },

  removeDeadline: async () => {
    try {
      const response = await api.delete('/settings/deadline')
      return response.data
    } catch (error) {
      throw error
    }
  },

  getAllSettings: async () => {
    try {
      const response = await api.get('/settings')
      return response.data
    } catch (error) {
      throw error
    }
  }
}