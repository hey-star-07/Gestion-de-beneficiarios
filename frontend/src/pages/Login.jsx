import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  Email
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { authService } from '../services/auth.service'

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const result = await login(formData)
      
      if (result.success) {
        toast.success('¡Bienvenido!', { duration: 2000 })
        
        setTimeout(() => {
          if (result.user?.role === 'ADMIN') {
            navigate('/', { replace: true })
          } else {
            navigate('/profile', { replace: true })
          }
        }, 500)
      } else {
        toast.error(result.error || 'Error al iniciar sesión')
        setLoading(false)
      }
    } catch (error) {
      toast.error('Error al iniciar sesión')
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error('Ingresa tu email')
      return
    }
    
    setForgotLoading(true)
    
    try {
      const response = await authService.forgotPassword(forgotEmail)
      toast.success(response.data.message || 'Código enviado a tu email')
      setForgotOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al enviar código')
    } finally {
      setForgotLoading(false)
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
        style={{ width: '100%', maxWidth: 450 }}
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
              <Person sx={{ fontSize: 35, color: 'white' }} />
            </Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1a237e' }}>
              Bienvenido
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Inicia sesión para continuar
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email, Usuario o Código"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              margin="normal"
              required
              placeholder="ejemplo@gmail.com"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              sx={{ mb: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ textAlign: 'right', mb: 2 }}>
              <Button
                component={Link}
                to="/reset-password"
                sx={{ 
                  color: '#1a237e', 
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: 'transparent', color: '#ff6b00' }
                }}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                py: 1.5,
                backgroundColor: '#1a237e',
                border: '2px solid #1a1a1a',
                boxShadow: '3px 3px 0px rgba(26,26,26,0.2)',
                '&:hover': {
                  backgroundColor: '#0d1442',
                  transform: 'translate(1px, 1px)',
                  boxShadow: '2px 2px 0px rgba(26,26,26,0.2)'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              ¿No tienes una cuenta?{' '}
              <Link to="/register" style={{ color: '#1a237e', textDecoration: 'none', fontWeight: 600 }}>
                Regístrate
              </Link>
            </Typography>
          </Box>
        </Paper>
      </motion.div>

      {/* Dialog para recuperar contraseña */}
      <Dialog 
        open={forgotOpen} 
        onClose={() => setForgotOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: '3px solid #1a1a1a',
            boxShadow: '5px 5px 0px rgba(26,26,26,0.2)',
            backgroundColor: '#fffdf9'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1a237e', fontFamily: 'Playfair Display' }}>
          Recuperar Contraseña
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Ingresa tu email y te enviaremos un código de recuperación
          </Typography>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: '#1a237e' }} />
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setForgotOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleForgotPassword}
            variant="contained"
            disabled={forgotLoading}
            sx={{ 
              backgroundColor: '#1a237e',
              '&:hover': { backgroundColor: '#0d1442' }
            }}
          >
            {forgotLoading ? 'Enviando...' : 'Enviar Código'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Login