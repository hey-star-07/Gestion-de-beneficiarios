import React, { useState } from 'react'
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
  InputAdornment
} from '@mui/material'
import {
  Save,
  Edit,
  Work,
  Phone,
  Business,
  CheckCircle,
  Cancel
} from '@mui/icons-material'
import { beneficiaryService } from '../../services/beneficiary.service'

const WorkForm = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    is_working: profile?.is_working || false,
    workplace: profile?.workplace || '',
    work_phone: profile?.work_phone || ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // IMPORTANTE: Si is_working es false, enviar null para limpiar los campos
      const dataToSend = {
        is_working: formData.is_working,
        workplace: formData.is_working ? formData.workplace : null,
        work_phone: formData.is_working ? formData.work_phone : null
      }
      
      console.log('📤 Enviando datos de trabajo:', dataToSend)
      
      await beneficiaryService.updateMyProfile(dataToSend)
      toast.success('¡Información laboral guardada! 💼')
      setIsEditing(false)
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error('Error al guardar la información')
    } finally {
      setLoading(false)
    }
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
              {profile?.workplace && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Business sx={{ mr: 1, color: '#1a237e' }} />
                  <Typography>{profile.workplace}</Typography>
                </Box>
              )}
              {profile?.work_phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Phone sx={{ mr: 1, color: '#1a237e' }} />
                  <Typography>{profile.work_phone}</Typography>
                </Box>
              )}
            </>
          )}
        </Box>

        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => setIsEditing(true)}
          sx={{ 
            mt: 3,
            bgcolor: '#1a237e',
            border: '2px solid #1a1a1a',
            boxShadow: '3px 3px 0px rgba(26,26,26,0.2)',
            '&:hover': {
              bgcolor: '#0d1442'
            }
          }}
        >
          Actualizar Datos
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
                onChange={(e) => setFormData({...formData, is_working: e.target.value === 'true'})}
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
                  sx={{ 
                    '& .MuiInputLabel-root': { mb: 1 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      border: '2px solid #1a1a1a',
                      bgcolor: '#ffffff'
                    }
                  }}
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
                  sx={{ 
                    '& .MuiInputLabel-root': { mb: 1 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      border: '2px solid #1a1a1a',
                      bgcolor: '#ffffff'
                    }
                  }}
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
            disabled={loading}
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
            onClick={() => setIsEditing(false)}
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