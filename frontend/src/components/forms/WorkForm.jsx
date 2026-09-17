import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Alert
} from '@mui/material'
import {
  Save,
  Edit,
  Work,
  Phone,
  Business,
  CheckCircle,
  Cancel,
  Lock
} from '@mui/icons-material'
import { beneficiaryService } from '../../services/beneficiary.service'
import { useDeadline } from '../../context/DeadlineContext'

const WorkForm = ({ profile, onUpdate }) => {
  const { canEdit } = useDeadline()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    is_working: profile?.is_working || false,
    workplace: profile?.workplace || '',
    work_phone: profile?.work_phone || ''
  })
  const [loading, setLoading] = useState(false)

  // Resincroniza el formulario cuando el perfil se recarga desde el backend.
  // Sin esto, el estado inicial quedaba "congelado" y al volver a entrar en
  // modo edición se mostraban los valores viejos.
  // Solo se aplica fuera del modo edición para no pisar lo que la usuaria
  // está escribiendo en ese momento.
  useEffect(() => {
    if (isEditing) return
    setFormData({
      is_working: profile?.is_working || false,
      workplace: profile?.workplace || '',
      work_phone: profile?.work_phone || ''
    })
  }, [profile, isEditing])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!canEdit) {
      toast.error('El plazo para modificar datos ha expirado')
      return
    }

    setLoading(true)

    try {
      // Solo se envían los campos de trabajo. El backend ahora hace un
      // UPDATE parcial, así que los datos de iglesia no se tocan.
      // El `null` explícito cuando no trabaja sí limpia los campos.
      const dataToSend = {
        is_working: formData.is_working,
        workplace: formData.is_working ? (formData.workplace || null) : null,
        work_phone: formData.is_working ? (formData.work_phone || null) : null
      }

      await beneficiaryService.updateMyProfile(dataToSend)
      toast.success('¡Información laboral guardada! 💼')
      // Esperamos a que el perfil se recargue con los datos frescos ANTES
      // de volver a la vista de solo lectura.
      if (onUpdate) await onUpdate()
      setIsEditing(false)
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error(error.response?.data?.error || 'Error al guardar la información')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Descarta los cambios no guardados y vuelve a los datos del perfil.
    setFormData({
      is_working: profile?.is_working || false,
      workplace: profile?.workplace || '',
      work_phone: profile?.work_phone || ''
    })
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <Paper sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 700,
        mx: 'auto',
        border: '3px solid #1a1a1a',
        borderRadius: 4,
        boxShadow: '5px 5px 0px rgba(26,26,26,0.2)',
        bgcolor: '#fffdf9'
      }}>
        <Typography variant="h5" gutterBottom sx={{
          color: '#1a237e',
          fontWeight: 700,
          fontFamily: 'Playfair Display',
          mb: 3
        }}>
          <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
          Información Laboral
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ mr: 1, fontFamily: 'Playfair Display' }}>
              <strong>Trabaja actualmente:</strong>
            </Typography>
            {profile?.is_working ? (
              <CheckCircle sx={{ color: '#00c853' }} />
            ) : (
              <Cancel sx={{ color: '#ff1744' }} />
            )}
          </Box>

          {profile?.is_working && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Business sx={{ mr: 1, color: '#1a237e' }} />
                <Typography>{profile?.workplace || 'No especificado'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Phone sx={{ mr: 1, color: '#1a237e' }} />
                <Typography>{profile?.work_phone || 'No especificado'}</Typography>
              </Box>
            </>
          )}
        </Box>

        {!canEdit && (
          <Alert
            severity="warning"
            icon={<Lock />}
            sx={{
              mt: 3,
              border: '2px solid #1a1a1a',
              borderRadius: 2
            }}
          >
            El plazo para modificar datos ha expirado
          </Alert>
        )}

        <Button
          variant="contained"
          startIcon={canEdit ? <Edit /> : <Lock />}
          onClick={() => setIsEditing(true)}
          disabled={!canEdit}
          sx={{
            mt: 3,
            bgcolor: canEdit ? '#1a237e' : '#9e9e9e',
            border: '2px solid #1a1a1a',
            boxShadow: '3px 3px 0px rgba(26,26,26,0.2)',
            '&:hover': {
              bgcolor: canEdit ? '#0d1442' : '#9e9e9e'
            }
          }}
        >
          {canEdit ? 'Actualizar Datos' : 'Plazo Expirado'}
        </Button>
      </Paper>
    )
  }

  return (
    <Paper sx={{
      p: { xs: 2, sm: 3, md: 4 },
      maxWidth: 700,
      mx: 'auto',
      border: '3px solid #1a1a1a',
      borderRadius: 4,
      boxShadow: '5px 5px 0px rgba(26,26,26,0.2)',
      bgcolor: '#fffdf9'
    }}>
      <Typography variant="h5" gutterBottom sx={{
        color: '#1a237e',
        fontWeight: 700,
        fontFamily: 'Playfair Display',
        mb: 3
      }}>
        <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
        Actualizar Información Laboral
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ fontFamily: 'Playfair Display', fontWeight: 600 }}>
                ¿Trabaja actualmente?
              </FormLabel>
              <RadioGroup
                name="is_working"
                value={formData.is_working}
                onChange={(e) => setFormData({ ...formData, is_working: e.target.value === 'true' })}
                row
              >
                <FormControlLabel value={true} control={<Radio />} label="Sí" />
                <FormControlLabel value={false} control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {formData.is_working && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="¿Dónde trabaja actualmente?"
                  name="workplace"
                  value={formData.workplace}
                  onChange={handleChange}
                  placeholder="Ej: Cafetería Central"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business sx={{ color: '#1a237e' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Número de contacto del trabajo"
                  name="work_phone"
                  value={formData.work_phone}
                  onChange={handleChange}
                  placeholder="Ej: 987654321"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: '#1a237e' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </>
          )}
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save />}
            disabled={loading || !canEdit}
            sx={{
              flex: 1,
              minWidth: 200,
              bgcolor: '#1a237e',
              border: '2px solid #1a1a1a',
              boxShadow: '3px 3px 0px rgba(26,26,26,0.2)',
              '&:hover': {
                bgcolor: '#0d1442'
              }
            }}
          >
            {loading ? 'Guardando...' : 'Guardar Datos'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={loading}
            sx={{
              border: '2px solid #1a1a1a',
              boxShadow: '2px 2px 0px rgba(26,26,26,0.2)'
            }}
          >
            Cancelar
          </Button>
        </Box>
      </form>
    </Paper>
  )
}

export default WorkForm