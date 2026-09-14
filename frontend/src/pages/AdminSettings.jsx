import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Container,
  Alert,
  Chip,
  InputAdornment
} from '@mui/material'
import {
  ArrowBack,
  Settings,
  Save,
  Delete,
  AccessTime,
  Home,
  EventAvailable,
  Warning,
  CheckCircle,
  Cancel,
  CalendarToday
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { settingService } from '../services/setting.service'
import { useDeadline } from '../context/DeadlineContext'

const AdminSettings = () => {
  const navigate = useNavigate()
  const { deadlineInfo, reloadDeadline } = useDeadline()
  const [deadline, setDeadline] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (deadlineInfo.deadline) {
      const date = new Date(deadlineInfo.deadline)
      const formatted = date.toISOString().slice(0, 16)
      setDeadline(formatted)
    }
  }, [deadlineInfo])

  const handleSave = async () => {
    if (!deadline) {
      toast.error('Selecciona una fecha límite')
      return
    }

    setLoading(true)
    try {
      await settingService.setDeadline(new Date(deadline).toISOString())
      toast.success('¡Fecha límite actualizada exitosamente!')
      await reloadDeadline()
    } catch (error) {
      console.error('Error:', error)
      toast.error(error.response?.data?.error || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!window.confirm('¿Estás seguro de eliminar la fecha límite? Los beneficiarios podrán editar sin restricciones.')) {
      return
    }

    setLoading(true)
    try {
      await settingService.removeDeadline()
      toast.success('Fecha límite eliminada')
      setDeadline('')
      await reloadDeadline()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f0e8' }}>
      <AppBar 
        position="static" 
        sx={{ bgcolor: '#1a237e', borderBottom: '3px solid #1a1a1a', boxShadow: 'none' }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Settings sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: 'Playfair Display', fontWeight: 700 }}>
            Configuración del Sistema
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Estado actual */}
          <Paper sx={{
            p: 3,
            mb: 3,
            border: '3px solid #1a1a1a',
            borderRadius: 4,
            boxShadow: '5px 5px 0px rgba(26,26,26,0.2)',
            bgcolor: '#fffdf9'
          }}>
            <Typography variant="h6" sx={{ 
              fontFamily: 'Playfair Display', 
              fontWeight: 700, 
              mb: 3, 
              color: '#1a237e',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <EventAvailable />
              Estado Actual
            </Typography>
            
            {deadlineInfo.isActive ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  {deadlineInfo.isExpired ? (
                    <Cancel sx={{ color: '#ff1744', fontSize: 28 }} />
                  ) : (
                    <CheckCircle sx={{ color: '#00c853', fontSize: 28 }} />
                  )}
                  <Typography sx={{ fontFamily: 'Playfair Display', fontWeight: 600 }}>
                    Fecha límite: {formatDate(deadlineInfo.deadline)}
                  </Typography>
                  <Chip
                    icon={deadlineInfo.isExpired ? <Cancel sx={{ fontSize: 16 }} /> : <CheckCircle sx={{ fontSize: 16 }} />}
                    label={deadlineInfo.isExpired ? 'EXPIRADA' : 'ACTIVA'}
                    sx={{
                      bgcolor: deadlineInfo.isExpired ? '#ff1744' : '#00c853',
                      color: 'white',
                      fontWeight: 700,
                      fontFamily: 'Playfair Display',
                      border: '2px solid #1a1a1a',
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }}
                  />
                </Box>
                {!deadlineInfo.isExpired && (
                  <Alert 
                    severity="info" 
                    icon={<AccessTime />}
                    sx={{ 
                      mt: 2,
                      border: '2px solid #1a1a1a',
                      borderRadius: 2
                    }}
                  >
                    Quedan <strong>{deadlineInfo.daysRemaining} días</strong> y <strong>{deadlineInfo.hoursRemaining} horas</strong>
                  </Alert>
                )}
              </>
            ) : (
              <Alert 
                severity="info"
                icon={<CheckCircle />}
                sx={{ 
                  border: '2px solid #1a1a1a',
                  borderRadius: 2
                }}
              >
                No hay fecha límite establecida. Los beneficiarios pueden editar sin restricciones.
              </Alert>
            )}
          </Paper>

          {/* Formulario */}
          <Paper sx={{
            p: 3,
            border: '3px solid #1a1a1a',
            borderRadius: 4,
            boxShadow: '5px 5px 0px rgba(26,26,26,0.2)',
            bgcolor: '#fffdf9'
          }}>
            <Typography variant="h6" sx={{ 
              fontFamily: 'Playfair Display', 
              fontWeight: 700, 
              mb: 3, 
              color: '#1a237e',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Settings />
              Configurar Fecha Límite
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Establece la fecha hasta la cual los beneficiarios podrán modificar sus datos.
              Después de esta fecha, los botones de actualizar, agregar, editar y eliminar se bloquearán automáticamente.
            </Typography>

            <TextField
              fullWidth
              label="Fecha límite"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  border: '2px solid #1a1a1a',
                  borderRadius: 2,
                  bgcolor: '#ffffff'
                }
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={loading || !deadline}
                sx={{
                  bgcolor: '#1a237e',
                  border: '2px solid #1a1a1a',
                  boxShadow: '3px 3px 0px rgba(26,26,26,0.2)',
                  '&:hover': { 
                    bgcolor: '#0d1442',
                    transform: 'translate(1px, 1px)',
                    boxShadow: '2px 2px 0px rgba(26,26,26,0.2)'
                  }
                }}
              >
                {loading ? 'Guardando...' : 'Guardar Fecha Límite'}
              </Button>

              {deadlineInfo.isActive && (
                <Button
                  variant="outlined"
                  startIcon={<Delete />}
                  onClick={handleRemove}
                  disabled={loading}
                  sx={{
                    border: '2px solid #1a1a1a',
                    color: '#ff1744',
                    boxShadow: '2px 2px 0px rgba(26,26,26,0.2)',
                    '&:hover': { 
                      bgcolor: '#ffebee',
                      transform: 'translate(1px, 1px)',
                      boxShadow: '1px 1px 0px rgba(26,26,26,0.2)'
                    }
                  }}
                >
                  Eliminar Fecha Límite
                </Button>
              )}
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  )
}

export default AdminSettings