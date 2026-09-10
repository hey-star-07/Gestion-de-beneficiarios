import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material'
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Verified,
  Key
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { authService } from '../services/auth.service'

const ResetPassword = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const steps = ['Solicitar código', 'Verificar código', 'Nueva contraseña']

  React.useEffect(() => {
    // Si viene email desde login
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }))
      setActiveStep(1)
    }
  }, [location])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRequestCode = async () => {
    if (!formData.email) {
      toast.error('Ingresa tu email')
      return
    }

    setLoading(true)
    try {
      await authService.forgotPassword(formData.email)
      toast.success('Código enviado a tu email')
      setActiveStep(1)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al enviar código')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!formData.code || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Todos los campos son requeridos')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (formData.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword({
        email: formData.email,
        code: formData.code,
        newPassword: formData.newPassword
      })
      
      toast.success('¡Contraseña actualizada exitosamente!')
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Contraseña actualizada. Inicia sesión con tu nueva contraseña.' 
          } 
        })
      }, 1500)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al restablecer contraseña')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', textAlign: 'center' }}>
              Ingresa tu email y te enviaremos un código de recuperación
            </Typography>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              placeholder="tucorreo@gmail.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleRequestCode}
              disabled={loading}
              sx={{ mt: 3, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Enviar Código'}
            </Button>
          </Box>
        )

      case 1:
        return (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Verified sx={{ fontSize: 60, color: '#1a237e', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Enviamos un código a <strong>{formData.email}</strong>
              </Typography>
            </Box>
            <TextField
              fullWidth
              label="Código de Verificación"
              name="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              margin="normal"
              required
              placeholder="ABC123"
              inputProps={{ maxLength: 6 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Key sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => setActiveStep(2)}
              disabled={loading || !formData.code}
              sx={{ mt: 3, py: 1.5 }}
            >
              Continuar
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => setActiveStep(0)}
              sx={{ mt: 1 }}
            >
              Volver
            </Button>
          </Box>
        )

      case 2:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', textAlign: 'center' }}>
              Ingresa tu nueva contraseña
            </Typography>
            <TextField
              fullWidth
              label="Nueva Contraseña"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={handleChange}
              margin="normal"
              required
              helperText="Mínimo 8 caracteres"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirmar Contraseña"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleResetPassword}
              disabled={loading}
              sx={{ mt: 3, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Cambiar Contraseña'}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => setActiveStep(1)}
              sx={{ mt: 1 }}
            >
              Volver
            </Button>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f0e8 0%, #e8e0d5 100%)',
        padding: 3
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ width: '100%', maxWidth: 500 }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            p: 5, 
            borderRadius: 4,
            border: '3px solid #1a1a1a',
            boxShadow: '5px 5px 0px rgba(26,26,26,0.2)',
            backgroundColor: '#fffdf9'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                backgroundColor: '#1a237e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 3,
                border: '3px solid #1a1a1a',
                boxShadow: '3px 3px 0px rgba(26,26,26,0.2)'
              }}
            >
              <Key sx={{ fontSize: 35, color: 'white' }} />
            </Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1a237e', fontFamily: 'Playfair Display' }}>
              Recuperar Contraseña
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel sx={{ 
                  '& .MuiStepLabel-label': { 
                    fontFamily: 'Playfair Display',
                    fontSize: '0.75rem'
                  } 
                }}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStep()}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              ¿Recordaste tu contraseña?{' '}
              <Link to="/login" style={{ color: '#1a237e', textDecoration: 'none', fontWeight: 600 }}>
                Volver al login
              </Link>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  )
}

export default ResetPassword