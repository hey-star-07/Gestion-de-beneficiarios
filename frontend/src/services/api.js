import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
})

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Variable para evitar múltiples redirecciones
let isRedirecting = false

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // NO redirigir si es una petición a /settings/deadline
    // o si ya estamos en login
    const isDeadlineRequest = error.config?.url?.includes('/settings/deadline')
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    const isOnLoginPage = window.location.pathname === '/login'
    
    if (error.response?.status === 401 && !isDeadlineRequest && !isLoginRequest && !isOnLoginPage && !isRedirecting) {
      isRedirecting = true
      
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      // Redirigir solo si no estamos ya en login
      window.location.href = '/login'
      
      // Resetear flag después de un tiempo
      setTimeout(() => {
        isRedirecting = false
      }, 2000)
    }
    
    return Promise.reject(error)
  }
)

export default api