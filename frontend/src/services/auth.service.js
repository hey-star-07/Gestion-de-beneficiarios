import api from './api'

export const authService = {
  login: (credentials) => {
    return api.post('/auth/login', credentials)
  },
  
  register: (userData) => {
    return api.post('/auth/register', userData)
  },
  
  verifyEmail: (data) => {
    return api.post('/auth/verify-email', data)
  },
  
  getProfile: () => {
    return api.get('/auth/profile')
  },
  
  refreshToken: (refreshToken) => {
    return api.post('/auth/refresh-token', { refreshToken })
  },
  
  forgotPassword: (email) => {
    return api.post('/auth/forgot-password', { email })
  },
  
  resetPassword: (data) => {
    return api.post('/auth/reset-password', data)
  },
  
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }
}