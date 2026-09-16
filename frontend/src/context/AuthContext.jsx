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

  /**
   * Vuelve a consultar el estado de la cuenta en el servidor y lo
   * sincroniza con el estado local. Sirve para que, cuando el admin
   * habilita o deshabilita a un beneficiario, el cambio se refleje en su
   * panel sin que tenga que volver a iniciar sesión.
   *
   * Solo se fusiona `isActive`: el resto del objeto `user` (que viene del
   * login) se conserva para no perder campos con otro formato de nombre.
   */
  const refreshUser = async () => {
    if (!localStorage.getItem('token')) return

    try {
      const response = await authService.getProfile()
      const fresh = response?.data?.data

      if (!fresh) return

      setUser(prev => {
        if (!prev) return prev
        if (prev.isActive === fresh.isActive) return prev

        const updated = { ...prev, isActive: fresh.isActive }
        localStorage.setItem('user', JSON.stringify(updated))
        return updated
      })
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error al refrescar estado del usuario:', error)
      }
    }
  }

  // Sondeo periódico del estado de la cuenta (solo para beneficiarios).
  // También se refresca al volver a la pestaña, para que el cambio se vea
  // de inmediato sin esperar al siguiente intervalo.
  useEffect(() => {
    if (!user || user.role === 'ADMIN') return

    const interval = setInterval(refreshUser, 15000)

    const onFocus = () => refreshUser()
    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [user?.id, user?.role])

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}