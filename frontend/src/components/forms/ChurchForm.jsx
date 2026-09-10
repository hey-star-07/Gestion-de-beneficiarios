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
  Radio
} from '@mui/material'
import {
  Save,
  Edit,
  Church,
  Person,
  Phone,
  CheckCircle,
  Cancel
} from '@mui/icons-material'
import { beneficiaryService } from '../../services/beneficiary.service'

const ChurchForm = ({ profile, onUpdate }) => {
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
    setLoading(true)

    try {
      await beneficiaryService.updateMyProfile(formData)
      toast.success('¡Información de iglesia guardada! ⛪')
      setIsEditing(false)
      if (onUpdate) onUpdate()
    } catch (error) {
      toast.error('Error al guardar la información')
    } finally {
      setLoading(false)
    }
  }

  if (!isEditing) {
    return (
      <Paper sx={{ p: 4, maxWidth: 600 }}>
        <Typography variant="h5" gutterBottom sx={{ color: '#1a237e', fontWeight: 700 }}>
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

        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => setIsEditing(true)}
          sx={{ mt: 3 }}
        >
          Actualizar Datos
        </Button>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom sx={{ color: '#1a237e', fontWeight: 700 }}>
        <Church sx={{ mr: 1, verticalAlign: 'middle' }} />
        Actualizar Información de la Iglesia
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">¿Asiste a la iglesia la familia?</FormLabel>
              <RadioGroup
                name="church_attendance"
                value={formData.church_attendance}
                onChange={(e) => setFormData({...formData, church_attendance: e.target.value === 'true'})}
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
              >
                <FormControlLabel value={true} control={<Radio />} label="Sí" />
                <FormControlLabel value={false} control={<Radio />} label="No" />
              </RadioGroup>
            </FormControl>
          </Grid>
          
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
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save />}
            disabled={loading}
            sx={{ flex: 1 }}
          >
            {loading ? 'Guardando...' : 'Guardar Datos'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => setIsEditing(false)}
          >
            Cancelar
          </Button>
        </Box>
      </form>
    </Paper>
  )
}

export default ChurchForm