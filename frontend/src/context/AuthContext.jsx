import React, { createContext, useState, useContext, useEffect } from 'react'
import { authService } from '../services/auth.service'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay token guardado
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData && userData !== 'undefined') {
      try {
        const parsedUser = JSON.parse(userData)
        if (parsedUser && parsedUser.id) {
          setUser(parsedUser)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      
      const { data } = response
      
      if (data.success && data.data) {
        const { accessToken, refreshToken, user } = data.data
        
        // Guardar en localStorage
        localStorage.setItem('token', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Actualizar estado
        setUser(user)
        
        return { success: true, user }
      }
      
      return { 
        success: false, 
        error: data.error || 'Error al iniciar sesión' 
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al iniciar sesión' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}