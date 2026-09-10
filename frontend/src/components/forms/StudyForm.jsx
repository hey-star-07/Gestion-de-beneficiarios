import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material'
import {
  Add,
  School,
  Save,
  LocationOn,
  Schedule,
  Description,
  Visibility
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { beneficiaryService } from '../../services/beneficiary.service'

const StudyForm = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [educationProfiles, setEducationProfiles] = useState(
    profile?.educationProfiles || []
  )
  const [newEducation, setNewEducation] = useState({
    institution: '',
    career_name: '',
    year_semester: '',
    institution_address: '',
    institution_map_link: '',
    schedule_file: null
  })
  const [loading, setLoading] = useState(false)
  const [schedulePreview, setSchedulePreview] = useState(null)

  const UPLOADS_URL = 'http://localhost:3000'

  useEffect(() => {
    if (profile?.educationProfiles) {
      setEducationProfiles(profile.educationProfiles)
    }
  }, [profile])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewEducation({
        ...newEducation,
        schedule_file: file
      })
      
      // Crear preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setSchedulePreview(reader.result)
        }
        reader.readAsDataURL(file)
      } else if (file.type === 'application/pdf') {
        setSchedulePreview('pdf')
      }
      
      toast.success(`Horario seleccionado: ${file.name}`)
    }
  }

  const handleAddEducation = async () => {
    if (!newEducation.institution || !newEducation.career_name) {
      toast.error('Institución y carrera son requeridos', {
        style: {
          border: '2px solid #ff6b00',
          boxShadow: '3px 3px 0px rgba(255,107,0,0.3)'
        }
      })
      return
    }

    setLoading(true)
    try {
      // Primero agregar el estudio
      const response = await beneficiaryService.addEducation(profile.id, newEducation)
      console.log('✅ Estudio agregado:', response)
      
      // Si hay archivo de horario, subirlo
      if (newEducation.schedule_file) {
        const educationId = response?.data?.id || response?.data?.data?.id
        
        if (educationId) {
          const formData = new FormData()
          formData.append('schedule_file', newEducation.schedule_file)
          
          await beneficiaryService.uploadSchedule(educationId, formData)
          console.log('✅ Horario subido')
        }
      }
      
      toast.success(`¡${newEducation.career_name} agregado! 🎓`, {
        style: {
          border: '2px solid #1a237e',
          boxShadow: '3px 3px 0px rgba(26,35,126,0.3)'
        }
      })
      
      setNewEducation({
        institution: '',
        career_name: '',
        year_semester: '',
        institution_address: '',
        institution_map_link: '',
        schedule_file: null
      })
      setSchedulePreview(null)
      
      if (onUpdate) await onUpdate()
      
      // Recargar estudios
      const updatedProfile = await beneficiaryService.getMyProfile()
      setEducationProfiles(updatedProfile?.educationProfiles || [])
      setIsEditing(false)
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error('Error al agregar estudio')
    } finally {
      setLoading(false)
    }
  }

  // Vista estática
  if (!isEditing && educationProfiles.length > 0) {
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
          <School sx={{ mr: 1, verticalAlign: 'middle' }} />
          Estudios Superiores
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <AnimatePresence>
            {educationProfiles.map((education, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card
                  sx={{
                    mb: 2,
                    borderRadius: 3,
                    border: '2px solid #1a1a1a',
                    boxShadow: '3px 3px 0px rgba(26,26,26,0.15)',
                    bgcolor: '#fffdf9',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '5px 5px 0px rgba(26,26,26,0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          bgcolor: '#1a237e',
                          mr: 2,
                          border: '2px solid #1a1a1a',
                          fontFamily: 'Playfair Display'
                        }}
                      >
                        <School />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e', fontFamily: 'Playfair Display' }}>
                          {education.career_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {education.institution}
                        </Typography>
                      </Box>
                    </Box>

                    {education.year_semester && (
                      <Typography variant="caption" sx={{ 
                        display: 'inline-block',
                        bgcolor: '#f0f7ff',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        border: '1px solid #1a237e',
                        fontWeight: 600,
                        mb: 2
                      }}>
                        {education.year_semester}
                      </Typography>
                    )}

                    {education.institution_address && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <LocationOn sx={{ fontSize: 18, mr: 1, color: '#1a237e' }} />
                        <Typography variant="body2">
                          {education.institution_address}
                        </Typography>
                      </Box>
                    )}

                    {education.schedule_file && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={education.schedule_file.endsWith('.pdf') ? <Description /> : <Visibility />}
                        href={`${UPLOADS_URL}/uploads/schedules/${education.schedule_file}`}
                        target="_blank"
                        sx={{ 
                          mt: 2,
                          border: '2px solid #1a1a1a',
                          boxShadow: '2px 2px 0px rgba(26,26,26,0.15)'
                        }}
                      >
                        Ver Horario
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
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
          Agregar Estudio
        </Button>
      </Paper>
    )
  }

  // Vista de edición
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
        <School sx={{ mr: 1, verticalAlign: 'middle' }} />
        {educationProfiles.length > 0 ? 'Agregar Nuevo Estudio' : 'Registrar Estudios'}
      </Typography>

      {educationProfiles.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, fontFamily: 'Playfair Display' }}>
            Estudios registrados:
          </Typography>
          {educationProfiles.map((education, index) => (
            <Card
              key={index}
              sx={{
                mb: 1.5,
                borderRadius: 2,
                border: '2px solid #1a1a1a',
                boxShadow: '2px 2px 0px rgba(26,26,26,0.1)',
                bgcolor: '#faf8f3'
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 1.5 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#1a237e',
                    mr: 2,
                    border: '2px solid #1a1a1a'
                  }}
                >
                  <School sx={{ fontSize: 20 }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {education.career_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {education.institution}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
          <Divider sx={{ my: 3 }} />
        </Box>
      )}

      <Box
        sx={{
          mt: 2,
          p: 3,
          bgcolor: '#faf8f3',
          borderRadius: 3,
          border: '2px dashed #1a1a1a'
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontFamily: 'Playfair Display' }}>
          <Add sx={{ mr: 1, verticalAlign: 'middle' }} />
          Nuevo Estudio
        </Typography>
        
        <Grid container spacing={3}>
          {/* 1. UNIVERSIDAD/INSTITUTO */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Universidad/Instituto"
              value={newEducation.institution}
              onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
              required
              placeholder="Ej: Universidad Nacional"
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
                    <School sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          {/* 2. CARRERA DE ESTUDIOS */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Carrera de Estudios"
              value={newEducation.career_name}
              onChange={(e) => setNewEducation({...newEducation, career_name: e.target.value})}
              required
              placeholder="Ej: Ingeniería Civil"
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
          
          {/* 3. AÑO/SEMESTRE DE ESTUDIO */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Año/Semestre de Estudio"
              value={newEducation.year_semester}
              onChange={(e) => setNewEducation({...newEducation, year_semester: e.target.value})}
              placeholder="Ej: 2do Año - 4to Semestre"
              helperText="Puedes escribir libremente, por ejemplo: 1er Año, 3er Semestre, etc."
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
          
          {/* 4. DIRECCIÓN DEL CENTRO DE ESTUDIOS */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Dirección del Centro de Estudios"
              value={newEducation.institution_address}
              onChange={(e) => setNewEducation({...newEducation, institution_address: e.target.value})}
              placeholder="Ej: Av. Principal 123"
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
                    <LocationOn sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          {/* 5. LINK DE LA DIRECCIÓN */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Link de la Dirección (Google Maps)"
              value={newEducation.institution_map_link}
              onChange={(e) => setNewEducation({...newEducation, institution_map_link: e.target.value})}
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
                    <LocationOn sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          {/* 6. SUBIR HORARIO */}
          <Grid item xs={12}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Schedule />}
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
              Subir Horario (PDF/Imagen)
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </Button>
            
            {/* Vista previa del horario */}
            {schedulePreview && schedulePreview !== 'pdf' && (
              <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                <img 
                  src={schedulePreview} 
                  alt="Vista previa del horario" 
                  style={{ 
                    maxWidth: 200, 
                    maxHeight: 200, 
                    borderRadius: 8,
                    border: '2px solid #1a1a1a',
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0px rgba(26,26,26,0.2)'
                  }}
                  onClick={() => window.open(schedulePreview, '_blank')}
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
                    setSchedulePreview(null)
                    setNewEducation({...newEducation, schedule_file: null})
                  }}
                >
                  ✕
                </IconButton>
              </Box>
            )}
            
            {schedulePreview === 'pdf' && newEducation.schedule_file && (
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
                const url = URL.createObjectURL(newEducation.schedule_file)
                window.open(url, '_blank')
              }}
              >
                <Description sx={{ mr: 1, color: '#ff6b00' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {newEducation.schedule_file.name}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleAddEducation}
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
            {loading ? 'Guardando...' : 'Guardar Estudio'}
          </Button>
          {educationProfiles.length > 0 && (
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
          )}
        </Box>
      </Box>
    </Paper>
  )
}

export default StudyForm