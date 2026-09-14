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
  InputAdornment,
  Alert
} from '@mui/material'
import {
  Save,
  Edit,
  Church,
  Person,
  Phone,
  CheckCircle,
  Cancel,
  Lock
} from '@mui/icons-material'
import { beneficiaryService } from '../../services/beneficiary.service'
import { useDeadline } from '../../context/DeadlineContext'

const ChurchForm = ({ profile, onUpdate }) => {
  const { canEdit } = useDeadline()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    church_attendance: profile?.church_attendance || false,
    is_baptized: profile?.is_baptized || false,
    church_name: profile?.church_name || '',
    pastor_name: profile?.pastor_name || '',
    pastor_phone: profile?.pastor_phone || ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
      const dataToSend = {
        church_attendance: formData.church_attendance,
        is_baptized: formData.is_baptized,
        church_name: formData.church_attendance ? formData.church_name : null,
        pastor_name: formData.church_attendance ? formData.pastor_name : null,
        pastor_phone: formData.church_attendance ? formData.pastor_phone : null
      }
      
      await beneficiaryService.updateMyProfile(dataToSend)
      toast.success('¡Información de iglesia guardada! ⛪')
      setIsEditing(false)
      if (onUpdate) onUpdate()
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error(error.response?.data?.error || 'Error al guardar la información')
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
          <Church sx={{ mr: 1, verticalAlign: 'middle' }} />
          Información de la Iglesia
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ mr: 1 }}>
              <strong>Asiste a la iglesia:</strong>
            </Typography>
            {profile?.church_attendance ? (
              <CheckCircle sx={{ color: '#00c853' }} />
            ) : (
              <Cancel sx={{ color: '#ff1744' }} />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ mr: 1 }}>
              <strong>Está bautizado:</strong>
            </Typography>
            {profile?.is_baptized ? (
              <CheckCircle sx={{ color: '#00c853' }} />
            ) : (
              <Cancel sx={{ color: '#ff1744' }} />
            )}
          </Box>

          {profile?.church_name && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Iglesia:</strong> {profile.church_name}
            </Typography>
          )}
          {profile?.pastor_name && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Pastor:</strong> {profile.pastor_name}
            </Typography>
          )}
          {profile?.pastor_phone && (
            <Typography variant="body1">
              <strong>Contacto:</strong> {profile.pastor_phone}
            </Typography>
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
        <Church sx={{ mr: 1, verticalAlign: 'middle' }} />
        Actualizar Información de la Iglesia
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">¿Asiste a la iglesia la familia?</FormLabel>
              <RadioGroup
                name="church_attendance"
                value={formData.church_attendance}
                onChange={(e) => setFormData({...formData, church_attendance: e.target.value === 'true'})}
                row
              >
                <FormControlLabel value={true} control={<Radio />} label="Sí" />
                <FormControlLabel value={false} control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">¿Está bautizado?</FormLabel>
              <RadioGroup
                name="is_baptized"
                value={formData.is_baptized}
                onChange={(e) => setFormData({...formData, is_baptized: e.target.value === 'true'})}
                row
              >
                <FormControlLabel value={true} control={<Radio />} label="Sí" />
                <FormControlLabel value={false} control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Grid>
          
          {formData.church_attendance && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre de la iglesia"
                  name="church_name"
                  value={formData.church_name}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <Church sx={{ mr: 1, color: '#1a237e' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre del pastor"
                  name="pastor_name"
                  value={formData.pastor_name}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: '#1a237e' }} />
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Número de contacto del pastor"
                  name="pastor_phone"
                  value={formData.pastor_phone}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: '#1a237e' }} />
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

export default ChurchForm