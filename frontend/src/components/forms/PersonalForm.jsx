import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  IconButton,
  InputAdornment
} from '@mui/material'
import {
  Save,
  Edit,
  Person,
  Phone,
  Home,
  Map,
  FileUpload,
  Visibility,
  Description
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { beneficiaryService } from '../../services/beneficiary.service'

const PersonalForm = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    address: profile?.address || '',
    map_link: profile?.map_link || '',
    phone: profile?.phone || ''
  })
  const [loading, setLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)

  const UPLOADS_URL = 'http://localhost:3000'

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        address: profile.address || '',
        map_link: profile.map_link || '',
        phone: profile.phone || ''
      })
    }
  }, [profile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadedFile(file)
      
      // Crear preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview(reader.result)
        }
        reader.readAsDataURL(file)
      } else if (file.type === 'application/pdf') {
        setFilePreview('pdf')
      }
      
      // Subir archivo inmediatamente
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('fieldname', 'croquis_file')
        
        console.log('📤 Subiendo archivo:', file.name)
        
        const response = await beneficiaryService.uploadFile(formData)
        console.log('✅ Archivo subido:', response)
        
        toast.success('Croquis subido exitosamente')
        
        // Recargar perfil para mostrar el archivo subido
        if (onUpdate) {
          await onUpdate()
        }
      } catch (error) {
        console.error('❌ Error al subir archivo:', error)
        toast.error('Error al subir el archivo')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('📤 Enviando datos:', formData)
      
      const response = await beneficiaryService.updateMyProfile(formData)
      console.log('✅ Respuesta del servidor:', response)
      
      toast.success('¡Datos guardados exitosamente! 🎉')
      setIsEditing(false)
      
      if (onUpdate) {
        await onUpdate()
      }
    } catch (error) {
      console.error('❌ Error al guardar:', error)
      toast.error(error.response?.data?.error || 'Error al guardar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleViewCroquis = () => {
    if (profile?.croquis_file) {
      const fileUrl = `${UPLOADS_URL}/uploads/croquis/${profile.croquis_file}`
      window.open(fileUrl, '_blank')
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
          <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
          Información Personal
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Playfair Display' }}>
            {profile?.first_name} {profile?.last_name}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Código: {profile?.code}
          </Typography>
          
          {profile?.address && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Home sx={{ mr: 1, color: '#1a237e' }} />
              <Typography>{profile.address}</Typography>
            </Box>
          )}
          
          {profile?.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Phone sx={{ mr: 1, color: '#1a237e' }} />
              <Typography>{profile.phone}</Typography>
            </Box>
          )}
          
          {profile?.map_link && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Map sx={{ mr: 1, color: '#1a237e' }} />
              <Button
                href={profile.map_link}
                target="_blank"
                sx={{ color: '#1a237e', textDecoration: 'underline' }}
              >
                Ver en Google Maps
              </Button>
            </Box>
          )}

          {/* Botón Ver Croquis */}
          {profile?.croquis_file && (
            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={profile.croquis_file.endsWith('.pdf') ? <Description /> : <Visibility />}
                onClick={handleViewCroquis}
                sx={{
                  border: '2px solid #1a1a1a',
                  boxShadow: '3px 3px 0px rgba(26,26,26,0.2)',
                  color: '#1a237e',
                  '&:hover': {
                    bgcolor: '#f0f7ff',
                    transform: 'translate(1px, 1px)',
                    boxShadow: '2px 2px 0px rgba(26,26,26,0.2)'
                  }
                }}
              >
                Ver Croquis
              </Button>
            </Box>
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
              bgcolor: '#0d1442',
              transform: 'translate(1px, 1px)',
              boxShadow: '2px 2px 0px rgba(26,26,26,0.2)'
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
        <Edit sx={{ mr: 1, verticalAlign: 'middle' }} />
        Actualizar Información Personal
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nombres"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
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
                    <Person sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Apellidos"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              sx={{ 
                '& .MuiInputLabel-root': { mb: 1 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  border: '2px solid #1a1a1a',
                  bgcolor: '#ffffff'
                }
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Dirección"
              name="address"
              value={formData.address}
              onChange={handleChange}
              multiline
              rows={2}
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
                    <Home sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Link de Google Maps"
              name="map_link"
              value={formData.map_link}
              onChange={handleChange}
              placeholder="https://maps.google.com/..."
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
                    <Map sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Número de Celular"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
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
          <Grid item xs={12}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<FileUpload />}
              sx={{ 
                mr: 2,
                border: '2px solid #1a1a1a',
                boxShadow: '2px 2px 0px rgba(26,26,26,0.2)',
                '&:hover': {
                  transform: 'translate(1px, 1px)',
                  boxShadow: '1px 1px 0px rgba(26,26,26,0.2)'
                }
              }}
            >
              Subir Croquis (PDF/Imagen)
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </Button>
            
            {/* Vista previa del archivo */}
            {filePreview && filePreview !== 'pdf' && (
              <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                <img 
                  src={filePreview} 
                  alt="Vista previa" 
                  style={{ 
                    maxWidth: 200, 
                    maxHeight: 200, 
                    borderRadius: 8,
                    border: '2px solid #1a1a1a',
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0px rgba(26,26,26,0.2)'
                  }}
                  onClick={() => window.open(filePreview, '_blank')}
                />
                <IconButton
                  size="small"
                  sx={{ 
                    position: 'absolute', 
                    top: -10, 
                    right: -10,
                    bgcolor: 'white',
                    border: '2px solid #1a1a1a'
                  }}
                  onClick={() => {
                    setFilePreview(null)
                    setUploadedFile(null)
                  }}
                >
                  ✕
                </IconButton>
              </Box>
            )}
            
            {filePreview === 'pdf' && uploadedFile && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                border: '2px solid #1a1a1a',
                borderRadius: 2,
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                bgcolor: '#faf8f3',
                boxShadow: '3px 3px 0px rgba(26,26,26,0.2)'
              }}
              onClick={() => {
                const url = URL.createObjectURL(uploadedFile)
                window.open(url, '_blank')
              }}
              >
                <Description sx={{ mr: 1, color: '#ff6b00' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {uploadedFile.name}
                </Typography>
              </Box>
            )}
          </Grid>
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
                bgcolor: '#0d1442',
                transform: 'translate(1px, 1px)',
                boxShadow: '2px 2px 0px rgba(26,26,26,0.2)'
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

export default PersonalForm