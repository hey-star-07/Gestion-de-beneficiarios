import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import {
  Box,
  Typography,
  CircularProgress,
  Paper
} from '@mui/material'

const OAuthCallback = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginWithGoogle } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const refreshToken = params.get('refreshToken')

    if (token && refreshToken) {
      // Guardar tokens
      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      
      // Obtener información del usuario
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data.success && data.data) {
            const userData = data.data
            localStorage.setItem('user', JSON.stringify(userData))
            
            // Actualizar contexto
            loginWithGoogle(token, refreshToken, userData)
            
            toast.success('¡Bienvenido!')
            navigate('/')
          } else {
            throw new Error('Error al obtener perfil')
          }
        })
        .catch(error => {
          console.error('Error:', error)
          toast.error('Error al completar autenticación')
          navigate('/login')
        })
    } else {
      toast.error('Error en la autenticación')
      navigate('/login')
    }
  }, [location, navigate, loginWithGoogle])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
      }}
    >
      <Paper elevation={10} sx={{ p: 5, borderRadius: 3, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Completando autenticación...
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Por favor espera un momento
        </Typography>
      </Paper>
    </Box>
  )
}

export default OAuthCallback