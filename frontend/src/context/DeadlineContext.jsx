import React, { createContext, useContext, useState, useEffect } from 'react'
import { settingService } from '../services/setting.service'
import { useAuth } from './AuthContext'

const DeadlineContext = createContext()

export const useDeadline = () => {
  const context = useContext(DeadlineContext)
  if (!context) {
    throw new Error('useDeadline debe usarse dentro de DeadlineProvider')
  }
  return context
}

export const DeadlineProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth()
  const [deadlineInfo, setDeadlineInfo] = useState({
    deadline: null,
    isActive: false,
    isExpired: false,
    daysRemaining: null,
    hoursRemaining: null
  })
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  const loadDeadline = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await settingService.getDeadline()
      if (response.success) {
        setDeadlineInfo(response.data)
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error al cargar fecha límite:', error)
      }
    } finally {
      setLoading(false)
      setHasLoaded(true)
    }
  }

  useEffect(() => {
    if (authLoading) return

    if (user && !hasLoaded) {
      loadDeadline()
    }

    if (!user) {
      setDeadlineInfo({
        deadline: null,
        isActive: false,
        isExpired: false,
        daysRemaining: null,
        hoursRemaining: null
      })
      setHasLoaded(false)
    }
  }, [user, authLoading, hasLoaded])

  // Refrescar la fecha límite periódicamente. Esto además dispara en el
  // backend la desactivación automática al vencer el plazo.
  useEffect(() => {
    if (!user) return

    const interval = setInterval(loadDeadline, 30000)
    return () => clearInterval(interval)
  }, [user?.id])

  // Admin SIEMPRE puede editar, sin importar la fecha o el estado de la cuenta
  const isAdmin = user?.role === 'ADMIN'

  // Cuenta deshabilitada (por el admin, o automáticamente al vencer el plazo)
  const isAccountDisabled = !isAdmin && user?.isActive === false

  // El permiso de edición depende SOLO del estado de la cuenta.
  // Al vencer el plazo, el backend deshabilita automáticamente a los
  // beneficiarios; por eso no hace falta (ni conviene) volver a validar la
  // fecha aquí: si se validara, rehabilitar a alguien pasada la fecha no
  // tendría ningún efecto.
  const canEdit = isAdmin || !isAccountDisabled

  return (
    <DeadlineContext.Provider value={{
      deadlineInfo,
      loading,
      canEdit,
      isAccountDisabled,
      reloadDeadline: loadDeadline
    }}>
      {children}
    </DeadlineContext.Provider>
  )
}