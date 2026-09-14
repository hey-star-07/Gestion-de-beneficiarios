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

  // Admin SIEMPRE puede editar, sin importar la fecha
  const canEdit = user?.role === 'ADMIN' || !deadlineInfo.isActive || !deadlineInfo.isExpired

  return (
    <DeadlineContext.Provider value={{
      deadlineInfo,
      loading,
      canEdit,
      reloadDeadline: loadDeadline
    }}>
      {children}
    </DeadlineContext.Provider>
  )
}