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
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
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

  // Cuenta regresiva del botón de reenvío, para no dejar mandar
  // solicitudes en cadena (el backend igual las limita, esto es solo UX)
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown(prev => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

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
    if (!email) {
      toast.error('Ingresa tu email para reenviar el código')
      return
    }

    setResending(true)
    try {
      const response = await authService.resendVerification(email)
      toast.success(response.data?.message || 'Código reenviado. Revisa tu email')
      setResendCooldown(60)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al reenviar el código')
    } finally {
      setResending(false)
    }
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
                : `Ingresa el código de verificación enviado a ${email || 'tu email'}. Si no lo recibiste, revisa tu carpeta de spam.`}
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
                disabled={resending || resendCooldown > 0}
                sx={{ mb: 1 }}
              >
                {resendCooldown > 0
                  ? `Reenviar código (${resendCooldown}s)`
                  : (resending ? 'Reenviando...' : 'Reenviar código')}
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