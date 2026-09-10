import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box
} from '@mui/material'
import { MarkEmailRead, Verified } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { authService } from '../services/auth.service'

const VerifyEmail = () => {
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Obtener email del state o query param
    if (location.state?.email) {
      setEmail(location.state.email)
    } else {
      const params = new URLSearchParams(location.search)
      const emailParam = params.get('email')
      if (emailParam) {
        setEmail(emailParam)
      }
    }
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !code) {
      toast.error('Email y código son requeridos')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await authService.verifyEmail({ email, code })
      
      if (response.data.success) {
        setVerified(true)
        toast.success('¡Email verificado exitosamente!')
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al verificar email')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    // Aquí podrías implementar el reenvío de código
    toast.success('Código reenviado (funcionalidad en desarrollo)')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
        padding: 3
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 450 }}
      >
        <Paper elevation={10} sx={{ p: 4, borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {verified ? (
              <Verified sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            ) : (
              <MarkEmailRead sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            )}
            
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              {verified ? '¡Email Verificado!' : 'Verifica tu Email'}
            </Typography>
            
            <Typography variant="body1" color="text.secondary">
              {verified 
                ? 'Tu email ha sido verificado exitosamente. Redirigiendo...' 
                : `Ingresa el código de verificación enviado a ${email || 'tu email'}`
              }
            </Typography>
          </Box>

          {!verified && (
            <form onSubmit={handleSubmit}>
              {!email && (
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  placeholder="tu@email.com"
                />
              )}

              <TextField
                fullWidth
                label="Código de Verificación"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                margin="normal"
                required
                placeholder="ABC123"
                inputProps={{ maxLength: 6 }}
                helperText="Ingresa el código de 6 caracteres"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? 'Verificando...' : 'Verificar Email'}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={handleResendCode}
                sx={{ mb: 1 }}
              >
                Reenviar código
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/login')}
              >
                Volver al inicio de sesión
              </Button>
            </form>
          )}
        </Paper>
      </motion.div>
    </Box>
  )
}

export default VerifyEmail