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
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Alert
} from '@mui/material'
import {
  Add,
  School,
  Save,
  LocationOn,
  Schedule,
  Description,
  Visibility,
  Edit,
  Delete,
  Close,
  Lock
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { beneficiaryService } from '../../services/beneficiary.service'
import { useDeadline } from '../../context/DeadlineContext'

const StudyForm = ({ profile, onUpdate }) => {
  const { canEdit } = useDeadline()
  const [isEditing, setIsEditing] = useState(false)
  const [editingEducation, setEditingEducation] = useState(null)
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
  // URL temporal (blob:) del horario seleccionado, para el visor de PDF.
  const [scheduleObjectUrl, setScheduleObjectUrl] = useState(null)
  // Visor interno: { open, type: 'image' | 'pdf', src, name }
  const [previewDialog, setPreviewDialog] = useState({ open: false })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [educationToDelete, setEducationToDelete] = useState(null)

  // Única fuente de verdad para la lista: el perfil que baja del padre
  // (Profile.jsx) vía props, refrescado con onUpdate(). NO se vuelve a
  // pedir el perfil acá dentro con otra llamada aparte: eso es lo que
  // causaba el bug (una llamada mal interpretada pisaba esta lista con
  // un arreglo vacío justo después de guardar, y el formulario nunca
  // volvía a la vista de tarjetas).
  useEffect(() => {
    if (profile?.educationProfiles) {
      setEducationProfiles(profile.educationProfiles)
    }
  }, [profile])

  // Libera la URL temporal al cambiarla o al desmontar el componente.
  useEffect(() => {
    return () => {
      if (scheduleObjectUrl) URL.revokeObjectURL(scheduleObjectUrl)
    }
  }, [scheduleObjectUrl])

  const clearSelectedSchedule = () => {
    if (scheduleObjectUrl) URL.revokeObjectURL(scheduleObjectUrl)
    setScheduleObjectUrl(null)
    setSchedulePreview(null)
    setNewEducation(prev => ({ ...prev, schedule_file: null }))
  }

  const handleFileChange = (e) => {
    if (!canEdit) {
      toast.error('El plazo para modificar datos ha expirado')
      return
    }

    const file = e.target.files[0]
    if (!file) return

    if (scheduleObjectUrl) URL.revokeObjectURL(scheduleObjectUrl)
    setScheduleObjectUrl(URL.createObjectURL(file))

    setNewEducation(prev => ({
      ...prev,
      schedule_file: file
    }))

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

    // Permite volver a elegir el mismo archivo si lo quitas y lo vuelves a subir.
    e.target.value = ''
  }

  // Abre el horario YA GUARDADO en el servidor dentro del modal.
  const handleViewSavedSchedule = (education) => {
    if (!education?.schedule_file) return
    // schedule_file ya es la URL completa de Cloudinary — se usa directo.
    const fileUrl = education.schedule_file
    setPreviewDialog({
      open: true,
      type: education.schedule_file.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
      src: fileUrl,
      name: `Horario — ${education.career_name || 'Estudio'}`
    })
  }

  // Abre el horario AÚN NO SUBIDO (el que se acaba de seleccionar).
  // No se usa window.open() con un data:URL porque los navegadores
  // bloquean esa navegación (pantalla en blanco); se muestra en el modal.
  const handlePreviewSelectedSchedule = () => {
    if (!newEducation.schedule_file) return
    setPreviewDialog({
      open: true,
      type: schedulePreview === 'pdf' ? 'pdf' : 'image',
      src: schedulePreview === 'pdf' ? scheduleObjectUrl : schedulePreview,
      name: newEducation.schedule_file.name
    })
  }

  const closePreview = () => setPreviewDialog({ open: false })

  // Modal de vista previa, compartido por el horario guardado y el seleccionado.
  const previewModal = (
    <Dialog
      open={Boolean(previewDialog.open)}
      onClose={closePreview}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          border: '3px solid #1a1a1a',
          borderRadius: 3,
          boxShadow: '5px 5px 0px rgba(26,26,26,0.2)',
          bgcolor: '#fffdf9'
        }
      }}
    >
      <DialogTitle sx={{
        fontFamily: 'Playfair Display',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {previewDialog.name || 'Vista previa'}
        <IconButton onClick={closePreview} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: '#faf8f3' }}>
        {previewDialog.type === 'pdf' ? (
          <Box
            component="iframe"
            src={previewDialog.src}
            title={previewDialog.name || 'Documento'}
            sx={{
              width: '100%',
              height: { xs: '60vh', md: '70vh' },
              border: '2px solid #1a1a1a',
              borderRadius: 2,
              bgcolor: 'white'
            }}
          />
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Box
              component="img"
              src={previewDialog.src}
              alt={previewDialog.name || 'Vista previa'}
              sx={{
                maxWidth: '100%',
                maxHeight: { xs: '60vh', md: '70vh' },
                borderRadius: 2,
                border: '2px solid #1a1a1a'
              }}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )

  const handleAddEducation = async () => {
    if (!canEdit) {
      toast.error('El plazo para modificar datos ha expirado')
      return
    }

    if (!newEducation.institution || !newEducation.career_name) {
      toast.error('Institución y carrera son requeridos')
      return
    }

    setLoading(true)
    try {
      if (editingEducation) {
        await beneficiaryService.updateEducation(editingEducation.id, {
          career_name: newEducation.career_name,
          institution: newEducation.institution,
          year_semester: newEducation.year_semester,
          institution_address: newEducation.institution_address,
          institution_map_link: newEducation.institution_map_link
        })

        // Si al editar se eligió un horario nuevo, se sube ahora. Antes
        // esta rama nunca subía el archivo: solo lo hacía la de "agregar".
        if (newEducation.schedule_file) {
          const scheduleFormData = new FormData()
          scheduleFormData.append('schedule_file', newEducation.schedule_file)
          await beneficiaryService.uploadSchedule(editingEducation.id, scheduleFormData)
        }

        toast.success('¡Estudio actualizado exitosamente! 🎓')
      } else {
        const response = await beneficiaryService.addEducation(profile.id, newEducation)

        if (newEducation.schedule_file) {
          const educationId = response?.data?.data?.id || response?.data?.id

          if (educationId) {
            const scheduleFormData = new FormData()
            scheduleFormData.append('schedule_file', newEducation.schedule_file)
            await beneficiaryService.uploadSchedule(educationId, scheduleFormData)
          }
        }

        toast.success(`¡${newEducation.career_name} agregado! 🎓`)
      }

      // Se espera a que el perfil se recargue con los datos frescos ANTES
      // de resetear el formulario y volver a la vista de tarjetas. Con
      // esto la lista de estudios (y el horario recién subido) ya están
      // actualizados en el momento en que se cierra el formulario.
      if (onUpdate) await onUpdate()

      resetForm()
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error(error.response?.data?.error || 'Error al guardar estudio')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    clearSelectedSchedule()
    setNewEducation({
      institution: '',
      career_name: '',
      year_semester: '',
      institution_address: '',
      institution_map_link: '',
      schedule_file: null
    })
    setEditingEducation(null)
    setIsEditing(false)
  }

  const handleEditClick = (education) => {
    if (!canEdit) {
      toast.error('El plazo para modificar datos ha expirado')
      return
    }

    clearSelectedSchedule()
    setEditingEducation(education)
    setNewEducation({
      institution: education.institution || '',
      career_name: education.career_name || '',
      year_semester: education.year_semester || '',
      institution_address: education.institution_address || '',
      institution_map_link: education.institution_map_link || '',
      schedule_file: null
    })
    setIsEditing(true)
  }

  const handleDeleteClick = (education) => {
    if (!canEdit) {
      toast.error('El plazo para modificar datos ha expirado')
      return
    }

    setEducationToDelete(education)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!educationToDelete || !canEdit) return

    try {
      await beneficiaryService.deleteEducation(educationToDelete.id)

      toast.success('Estudio eliminado exitosamente')

      const updatedList = educationProfiles.filter(e => e.id !== educationToDelete.id)
      setEducationProfiles(updatedList)

      if (onUpdate) await onUpdate()
    } catch (error) {
      console.error('❌ Error al eliminar:', error)
      toast.error('Error al eliminar el estudio')
    } finally {
      setDeleteDialogOpen(false)
      setEducationToDelete(null)
    }
  }

  const hasProfiles = educationProfiles.length > 0

  // Encabezado + banner de plazo, compartidos por las dos vistas de solo lectura.
  const readOnlyHeader = (
    <>
      <Typography variant="h5" gutterBottom sx={{
        color: '#1a237e',
        fontWeight: 700,
        fontFamily: 'Playfair Display',
        mb: 3
      }}>
        <School sx={{ mr: 1, verticalAlign: 'middle' }} />
        Estudios Superiores
      </Typography>

      {!canEdit && (
        <Alert
          severity="warning"
          icon={<Lock />}
          sx={{
            mb: 3,
            border: '2px solid #1a1a1a',
            borderRadius: 2
          }}
        >
          El plazo para modificar datos ha expirado
        </Alert>
      )}
    </>
  )

  // Vista vacía: aún no hay ningún estudio registrado. Antes, en este
  // caso, "cerrar" el formulario devolvía otra vez al mismo formulario
  // vacío porque no había una vista de solo lectura a la que volver.
  if (!isEditing && !hasProfiles) {
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
        {readOnlyHeader}

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Todavía no registraste ningún estudio.
        </Typography>

        <Button
          variant="contained"
          startIcon={canEdit ? <Add /> : <Lock />}
          onClick={() => {
            resetForm()
            setIsEditing(true)
          }}
          disabled={!canEdit}
          sx={{
            bgcolor: canEdit ? '#1a237e' : '#9e9e9e',
            border: '2px solid #1a1a1a',
            boxShadow: '3px 3px 0px rgba(26,26,26,0.2)',
            '&:hover': {
              bgcolor: canEdit ? '#0d1442' : '#9e9e9e'
            }
          }}
        >
          {canEdit ? 'Agregar Estudio' : 'Plazo Expirado'}
        </Button>
      </Paper>
    )
  }

  // Vista estática con tarjetas
  if (!isEditing && hasProfiles) {
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
        {readOnlyHeader}

        <Box sx={{ mt: 3 }}>
          <AnimatePresence>
            {educationProfiles.map((education, index) => (
              <motion.div
                key={education.id || index}
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
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '5px 5px 0px rgba(26,26,26,0.1)',
                      '& .action-buttons': {
                        opacity: 1
                      }
                    }
                  }}
                >
                  {canEdit && (
                    <Box
                      className="action-buttons"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        gap: 0.5,
                        opacity: 0.7,
                        transition: 'opacity 0.2s'
                      }}
                    >
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(education)}
                          sx={{
                            bgcolor: 'white',
                            border: '2px solid #1a1a1a',
                            '&:hover': {
                              bgcolor: '#f0f7ff',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <Edit sx={{ fontSize: 16, color: '#1a237e' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(education)}
                          sx={{
                            bgcolor: 'white',
                            border: '2px solid #1a1a1a',
                            '&:hover': {
                              bgcolor: '#ffebee',
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <Delete sx={{ fontSize: 16, color: '#ff1744' }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}

                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
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
                      <Box sx={{ flex: 1, pr: canEdit ? 8 : 0 }}>
                        <Typography variant="h6" sx={{
                          fontWeight: 700,
                          color: '#1a237e',
                          fontFamily: 'Playfair Display'
                        }}>
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
                        mb: 1.5
                      }}>
                        {education.year_semester}
                      </Typography>
                    )}

                    {education.institution_address && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <LocationOn sx={{ fontSize: 18, mr: 1, color: '#1a237e' }} />
                        <Typography variant="body2">
                          {education.institution_address}
                        </Typography>
                      </Box>
                    )}

                    {(education.institution_map_link || education.schedule_file) && (
                      <Grid container spacing={1}>
                        {education.institution_map_link && (
                          <Grid item xs={education.schedule_file ? 6 : 12}>
                            <Button
                              fullWidth
                              variant="outlined"
                              size="small"
                              startIcon={<LocationOn />}
                              href={education.institution_map_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                border: '2px solid #1a1a1a',
                                boxShadow: '2px 2px 0px rgba(26,26,26,0.15)'
                              }}
                            >
                              Ver Dirección
                            </Button>
                          </Grid>
                        )}

                        {education.schedule_file && (
                          <Grid item xs={education.institution_map_link ? 6 : 12}>
                            <Button
                              fullWidth
                              variant="outlined"
                              size="small"
                              startIcon={education.schedule_file.toLowerCase().endsWith('.pdf') ? <Description /> : <Visibility />}
                              onClick={() => handleViewSavedSchedule(education)}
                              sx={{
                                border: '2px solid #1a1a1a',
                                boxShadow: '2px 2px 0px rgba(26,26,26,0.15)'
                              }}
                            >
                              Ver Horario
                            </Button>
                          </Grid>
                        )}
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>

        <Button
          variant="contained"
          startIcon={canEdit ? <Add /> : <Lock />}
          onClick={() => {
            resetForm()
            setIsEditing(true)
          }}
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
          {canEdit ? 'Agregar Estudio' : 'Plazo Expirado'}
        </Button>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              border: '3px solid #1a1a1a',
              borderRadius: 3,
              boxShadow: '5px 5px 0px rgba(26,26,26,0.2)'
            }
          }}
        >
          <DialogTitle sx={{ fontFamily: 'Playfair Display', fontWeight: 700 }}>
            ¿Eliminar estudio?
          </DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro de que deseas eliminar <strong>{educationToDelete?.career_name}</strong>?
              Esta acción no se puede deshacer.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmDelete}
              variant="contained"
              sx={{
                bgcolor: '#ff1744',
                '&:hover': { bgcolor: '#d50000' }
              }}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {previewModal}
      </Paper>
    )
  }

  // Vista de edición/crear
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{
          color: '#1a237e',
          fontWeight: 700,
          fontFamily: 'Playfair Display'
        }}>
          <School sx={{ mr: 1, verticalAlign: 'middle' }} />
          {editingEducation ? 'Editar Estudio' : 'Agregar Nuevo Estudio'}
        </Typography>
        <IconButton onClick={resetForm} disabled={loading}>
          <Close />
        </IconButton>
      </Box>

      <Box
        sx={{
          mt: 2,
          p: 3,
          bgcolor: '#faf8f3',
          borderRadius: 3,
          border: '2px dashed #1a1a1a'
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Universidad/Instituto"
              value={newEducation.institution}
              onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
              required
              placeholder="Ej: Universidad Nacional"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <School sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Carrera de Estudios"
              value={newEducation.career_name}
              onChange={(e) => setNewEducation({ ...newEducation, career_name: e.target.value })}
              required
              placeholder="Ej: Ingeniería Civil"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Año/Semestre de Estudio"
              value={newEducation.year_semester}
              onChange={(e) => setNewEducation({ ...newEducation, year_semester: e.target.value })}
              placeholder="Ej: 2do Año - 4to Semestre"
              helperText="Puedes escribir libremente"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Dirección del Centro de Estudios"
              value={newEducation.institution_address}
              onChange={(e) => setNewEducation({ ...newEducation, institution_address: e.target.value })}
              placeholder="Ej: Av. Principal 123"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Link de la Dirección (Google Maps)"
              value={newEducation.institution_map_link}
              onChange={(e) => setNewEducation({ ...newEducation, institution_map_link: e.target.value })}
              placeholder="https://maps.google.com/..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Schedule />}
              disabled={!canEdit}
              sx={{
                mr: 2,
                border: '2px solid #1a1a1a',
                boxShadow: '2px 2px 0px rgba(26,26,26,0.2)'
              }}
            >
              {editingEducation && editingEducation.schedule_file
                ? 'Reemplazar Horario (PDF/Imagen)'
                : 'Subir Horario (PDF/Imagen)'}
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={!canEdit}
              />
            </Button>

            {editingEducation?.schedule_file && !newEducation.schedule_file && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="text"
                  size="small"
                  startIcon={editingEducation.schedule_file.toLowerCase().endsWith('.pdf') ? <Description /> : <Visibility />}
                  onClick={() => handleViewSavedSchedule(editingEducation)}
                  sx={{ color: '#1a237e' }}
                >
                  Ver horario actual
                </Button>
              </Box>
            )}

            {newEducation.schedule_file && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                Haz clic sobre el archivo para verlo antes de guardarlo.
              </Typography>
            )}

            {schedulePreview && schedulePreview !== 'pdf' && (
              <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                <img
                  src={schedulePreview}
                  alt="Vista previa"
                  style={{
                    maxWidth: 200,
                    maxHeight: 200,
                    borderRadius: 8,
                    border: '2px solid #1a1a1a',
                    cursor: 'pointer'
                  }}
                  onClick={handlePreviewSelectedSchedule}
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
                  onClick={clearSelectedSchedule}
                >
                  ✕
                </IconButton>
              </Box>
            )}

            {schedulePreview === 'pdf' && newEducation.schedule_file && (
              <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                <Box
                  sx={{
                    p: 2,
                    border: '2px solid #1a1a1a',
                    borderRadius: 2,
                    display: 'inline-flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    bgcolor: '#faf8f3'
                  }}
                  onClick={handlePreviewSelectedSchedule}
                >
                  <Description sx={{ mr: 1, color: '#ff6b00' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {newEducation.schedule_file.name}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    bgcolor: 'white',
                    border: '2px solid #1a1a1a'
                  }}
                  onClick={clearSelectedSchedule}
                >
                  ✕
                </IconButton>
              </Box>
            )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleAddEducation}
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
            {loading ? 'Guardando...' : (editingEducation ? 'Actualizar Estudio' : 'Guardar Estudio')}
          </Button>
          <Button
            variant="outlined"
            onClick={resetForm}
            disabled={loading}
            sx={{
              border: '2px solid #1a1a1a',
              boxShadow: '2px 2px 0px rgba(26,26,26,0.2)'
            }}
          >
            Cancelar
          </Button>
        </Box>
      </Box>

      {previewModal}
    </Paper>
  )
}

export default StudyForm