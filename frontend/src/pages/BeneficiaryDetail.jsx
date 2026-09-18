import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { beneficiaryService } from '../services/beneficiary.service'
import { toast } from 'react-hot-toast'
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme
} from '@mui/material'
import {
  ArrowBack,
  Person,
  School,
  FamilyRestroom,
  Church,
  Work,
  Phone,
  LocationOn,
  CheckCircle,
  Cancel,
  FolderOpen,
  Description,
  Visibility,
  Close
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import ConfirmDialog from '../components/common/ConfirmDialog'

const BeneficiaryDetail = () => {
  const { code } = useParams()
  const navigate = useNavigate()
  const [beneficiary, setBeneficiary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tabValue, setTabValue] = useState(0)
  const [error, setError] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false)
  // Visor interno de documentos: { open, type: 'image' | 'pdf', src, name }
  // Reemplaza los antiguos href target="_blank" — así el admin ve el
  // croquis y los horarios en una pantallita dentro de la app, igual
  // que en el panel del Patrocinado.
  const [previewDialog, setPreviewDialog] = useState({ open: false })

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    console.log('📋 BeneficiaryDetail montado con código:', code)

    if (code) {
      loadBeneficiary(code)
    } else {
      setError('No se proporcionó un código de Patrocinado')
      setLoading(false)
    }
  }, [code])

  const loadBeneficiary = async (beneficiaryCode) => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Cargando Patrocinado:', beneficiaryCode)

      const codeResponse = await beneficiaryService.getByCode(beneficiaryCode)
      console.log('📦 Respuesta getByCode:', codeResponse)

      let beneficiaryData = null
      let beneficiaryId = null

      if (codeResponse?.data?.success && codeResponse?.data?.data) {
        beneficiaryData = codeResponse.data.data
        beneficiaryId = beneficiaryData.id
      } else if (codeResponse?.data?.id) {
        beneficiaryData = codeResponse.data
        beneficiaryId = codeResponse.data.id
      } else if (Array.isArray(codeResponse?.data)) {
        beneficiaryData = codeResponse.data[0]
        beneficiaryId = beneficiaryData?.id
      }

      console.log('👤 Datos del Patrocinado:', beneficiaryData)
      console.log('🆔 ID:', beneficiaryId)

      if (!beneficiaryId) {
        throw new Error('No se pudo obtener el ID del Patrocinado')
      }

      const completeResponse = await beneficiaryService.getCompleteProfile(beneficiaryId)
      console.log('📋 Respuesta perfil completo:', completeResponse)

      let completeData = null
      if (completeResponse?.data?.success && completeResponse?.data?.data) {
        completeData = completeResponse.data.data
      } else if (completeResponse?.data) {
        completeData = completeResponse.data
      }

      console.log('📋 Datos completos:', completeData)

      const finalData = {
        ...beneficiaryData,
        ...completeData,
        // is_active llega desde la tabla users vía JOIN. Solo se considera
        // deshabilitado cuando es explícitamente false; si el Patrocinado
        // no tiene usuario asociado llega null y se muestra como activo.
        is_active: (completeData?.is_active ?? beneficiaryData?.is_active) !== false,
        educationProfiles: completeData?.educationProfiles || [],
        familyMembers: completeData?.familyMembers || []
      }

      console.log('✅ Datos finales:', finalData)
      setBeneficiary(finalData)

    } catch (error) {
      console.error('❌ Error al cargar Patrocinado:', error)
      setError(error.response?.data?.error || error.message || 'Error al cargar los datos')
      toast.error('Error al cargar los datos del Patrocinado')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleToggleStatus = () => {
    if (!beneficiary) return
    setConfirmToggleOpen(true)
  }

  const confirmToggleStatus = async () => {
    const newStatus = beneficiary.is_active === false ? true : false

    setStatusLoading(true)
    try {
      const response = await beneficiaryService.toggleBeneficiaryStatus(
        beneficiary.id,
        newStatus
      )

      if (response.success) {
        setBeneficiary(prev => ({ ...prev, is_active: newStatus }))
        toast.success(`Patrocinado ${newStatus ? 'habilitado' : 'deshabilitado'} exitosamente`)
      }
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error(error.response?.data?.error || 'Error al cambiar estado')
    } finally {
      setStatusLoading(false)
      setConfirmToggleOpen(false)
    }
  }

  // Abre el croquis del Patrocinado dentro del modal.
  const handleViewCroquis = () => {
    if (!beneficiary?.croquis_file) return
    setPreviewDialog({
      open: true,
      type: beneficiary.croquis_file.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
      // croquis_file ya es la URL completa de Cloudinary.
      src: beneficiary.croquis_file,
      name: 'Croquis de Domicilio'
    })
  }

  // Abre el horario de un estudio dentro del modal.
  const handleViewSchedule = (education) => {
    if (!education?.schedule_file) return
    setPreviewDialog({
      open: true,
      type: education.schedule_file.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
      // schedule_file ya es la URL completa de Cloudinary.
      src: education.schedule_file,
      name: `Horario — ${education.career_name || 'Estudio'}`
    })
  }

  const closePreview = () => setPreviewDialog({ open: false })

  // Modal de vista previa, compartido por el croquis y los horarios.
  const previewModal = (
    <Dialog
      open={Boolean(previewDialog.open)}
      onClose={closePreview}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          border: { xs: 'none', sm: '3px solid #1a1a1a' },
          borderRadius: { xs: 0, sm: 3 },
          boxShadow: { xs: 'none', sm: '5px 5px 0px rgba(26,26,26,0.2)' },
          bgcolor: '#fffdf9'
        }
      }}
    >
      <DialogTitle sx={{
        fontFamily: 'Playfair Display',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1
      }}>
        <Box component="span" sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {previewDialog.name || 'Vista previa'}
        </Box>
        <IconButton onClick={closePreview} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: '#faf8f3', p: { xs: 1.5, sm: 2 } }}>
        {previewDialog.type === 'pdf' ? (
          <Box
            component="iframe"
            src={previewDialog.src}
            title={previewDialog.name || 'Documento'}
            sx={{
              width: '100%',
              height: { xs: 'calc(100vh - 180px)', sm: '70vh' },
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
                maxHeight: { xs: 'calc(100vh - 180px)', sm: '70vh' },
                borderRadius: 2,
                border: '2px solid #1a1a1a'
              }}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )

  const InfoItem = ({ icon, label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
      {icon}
      <Box sx={{ ml: 2, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
          {value || 'No especificado'}
        </Typography>
      </Box>
    </Box>
  )

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        bgcolor: '#f5f0e8'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#1a237e', mb: 2 }} />
          <Typography variant="h6" sx={{ fontFamily: 'Playfair Display' }}>
            Cargando información...
          </Typography>
        </Box>
      </Box>
    )
  }

  if (error || !beneficiary) {
    return (
      <Box sx={{
        minHeight: '100vh',
        bgcolor: '#f5f0e8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3
      }}>
        <Paper sx={{
          p: { xs: 3, sm: 5 },
          textAlign: 'center',
          border: '3px solid #1a1a1a',
          borderRadius: 4,
          boxShadow: '5px 5px 0px rgba(26,26,26,0.2)',
          maxWidth: 400
        }}>
          <Typography variant="h5" sx={{ mb: 2, fontFamily: 'Playfair Display' }}>
            {error || 'Patrocinado no encontrado'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{
              bgcolor: '#1a237e',
              border: '2px solid #1a1a1a',
              boxShadow: '3px 3px 0px rgba(26,26,26,0.2)'
            }}
          >
            Volver al inicio
          </Button>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f0e8', minHeight: '100vh' }}>
      <AppBar
        position="static"
        sx={{
          bgcolor: '#1a237e',
          borderBottom: '3px solid #1a1a1a',
          boxShadow: 'none'
        }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: { xs: 0.5, sm: 2 } }}
          >
            <ArrowBack />
          </IconButton>
          <FolderOpen sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }} />
          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              fontFamily: 'Playfair Display',
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Perfil del Patrocinado
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 3 } }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header del perfil */}
          <Paper sx={{
            p: { xs: 2, sm: 3 },
            mb: { xs: 2, sm: 3 },
            border: '3px solid #1a1a1a',
            borderRadius: 4,
            boxShadow: '5px 5px 0px rgba(26,26,26,0.2)',
            bgcolor: '#fffdf9'
          }}>
            <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
              <Grid item xs={12} sm="auto" sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                <Avatar
                  sx={{
                    width: { xs: 64, sm: 80 },
                    height: { xs: 64, sm: 80 },
                    backgroundColor: '#1a237e',
                    fontSize: { xs: 24, sm: 32 },
                    fontWeight: 700,
                    border: '3px solid #1a1a1a',
                    fontFamily: 'Playfair Display'
                  }}
                >
                  {getInitials(beneficiary.first_name, beneficiary.last_name)}
                </Avatar>
              </Grid>
              <Grid item xs={12} sm>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  flexWrap: 'wrap',
                  gap: 1,
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  textAlign: { xs: 'center', sm: 'left' }
                }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      fontFamily: 'Playfair Display',
                      color: '#1a237e',
                      fontSize: { xs: '1.5rem', sm: '2.125rem' }
                    }}
                  >
                    {beneficiary.first_name} {beneficiary.last_name}
                  </Typography>
                  <Chip
                    label={`Código: ${beneficiary.code}`}
                    sx={{
                      bgcolor: '#fffdf9',
                      border: '2px solid #1a237e',
                      fontWeight: 600,
                      fontFamily: 'Playfair Display'
                    }}
                  />

                  {/* Chip de estado */}
                  <Chip
                    icon={beneficiary.is_active !== false ? <CheckCircle sx={{ fontSize: 16 }} /> : <Cancel sx={{ fontSize: 16 }} />}
                    label={beneficiary.is_active !== false ? 'ACTIVO' : 'DESHABILITADO'}
                    sx={{
                      bgcolor: beneficiary.is_active !== false ? '#00c853' : '#ff1744',
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
              </Grid>

              {/* Botón de habilitar/deshabilitar */}
              <Grid item xs={12} sm="auto">
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={beneficiary.is_active !== false ? <Cancel /> : <CheckCircle />}
                  onClick={handleToggleStatus}
                  sx={{
                    bgcolor: beneficiary.is_active !== false ? '#ff1744' : '#00c853',
                    border: '2px solid #1a1a1a',
                    boxShadow: '3px 3px 0px rgba(26,26,26,0.2)',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: beneficiary.is_active !== false ? '#d50000' : '#00a844',
                      transform: 'translate(1px, 1px)',
                      boxShadow: '2px 2px 0px rgba(26,26,26,0.2)'
                    }
                  }}
                >
                  {beneficiary.is_active !== false ? 'Deshabilitar' : 'Habilitar'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Tabs */}
          <Paper sx={{
            mb: { xs: 2, sm: 3 },
            border: '2px solid #1a1a1a',
            borderRadius: 3,
            bgcolor: '#fffdf9',
            overflow: 'hidden'
          }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant={isMobile ? 'scrollable' : 'fullWidth'}
              scrollButtons={isMobile ? 'auto' : false}
              allowScrollButtonsMobile
              sx={{
                '& .MuiTab-root': {
                  fontFamily: 'Playfair Display',
                  fontWeight: 600,
                  minWidth: { xs: 100, sm: 'auto' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1.5, sm: 2 }
                }
              }}
            >
              <Tab icon={<Person />} label="Personal" />
              <Tab icon={<School />} label="Estudios" />
              <Tab icon={<FamilyRestroom />} label="Familia" />
              <Tab icon={<Church />} label="Iglesia" />
              <Tab icon={<Work />} label="Trabajo" />
            </Tabs>
          </Paper>

          {/* Contenido */}
          <Paper sx={{
            p: { xs: 2, sm: 3 },
            border: '2px solid #1a1a1a',
            borderRadius: 3,
            minHeight: 300,
            bgcolor: '#fffdf9'
          }}>
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Playfair Display', fontWeight: 700, color: '#1a237e' }}>
                    Información Personal
                  </Typography>
                  <InfoItem
                    icon={<Phone sx={{ color: '#1a237e' }} />}
                    label="Teléfono"
                    value={beneficiary.phone}
                  />
                  <InfoItem
                    icon={<LocationOn sx={{ color: '#1a237e' }} />}
                    label="Dirección"
                    value={beneficiary.address}
                  />
                  {beneficiary.email && (
                    <InfoItem
                      icon={<Person sx={{ color: '#1a237e' }} />}
                      label="Email"
                      value={beneficiary.email}
                    />
                  )}
                  {beneficiary.map_link && (
                    <Button
                      variant="outlined"
                      size="small"
                      href={beneficiary.map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ mt: 1 }}
                    >
                      Ver en Google Maps
                    </Button>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Playfair Display', fontWeight: 700, color: '#1a237e' }}>
                    Croquis de Domicilio
                  </Typography>

                  {beneficiary.croquis_file ? (
                    <Box sx={{ mt: 2 }}>
                      {beneficiary.croquis_file.toLowerCase().endsWith('.pdf') ? (
                        <Button
                          variant="outlined"
                          startIcon={<Description />}
                          onClick={handleViewCroquis}
                          sx={{
                            border: '2px solid #1a1a1a',
                            boxShadow: '3px 3px 0px rgba(26,26,26,0.2)'
                          }}
                        >
                          Ver PDF
                        </Button>
                      ) : (
                        <Box
                          component="img"
                          src={beneficiary.croquis_file}
                          alt="Croquis"
                          sx={{
                            maxWidth: { xs: 180, sm: 250 },
                            maxHeight: { xs: 180, sm: 250 },
                            width: '100%',
                            objectFit: 'contain',
                            borderRadius: 2,
                            border: '2px solid #1a1a1a',
                            cursor: 'pointer',
                            boxShadow: '3px 3px 0px rgba(26,26,26,0.2)'
                          }}
                          onClick={handleViewCroquis}
                        />
                      )}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">
                      No se ha subido croquis
                    </Typography>
                  )}
                </Grid>
              </Grid>
            )}

            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{
                  fontFamily: 'Playfair Display',
                  fontWeight: 700,
                  color: '#1a237e',
                  mb: 3
                }}>
                  <School sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Estudios Superiores
                </Typography>

                {beneficiary.educationProfiles?.length > 0 ? (
                  <Grid container spacing={3}>
                    {beneficiary.educationProfiles.map((education, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                          sx={{
                            height: '100%',
                            borderRadius: 3,
                            border: '2px solid #1a1a1a',
                            boxShadow: '3px 3px 0px rgba(26,26,26,0.15)',
                            bgcolor: '#fffdf9',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '5px 5px 0px rgba(26,26,26,0.2)'
                            }
                          }}
                        >
                          <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar
                                sx={{
                                  width: 44,
                                  height: 44,
                                  bgcolor: '#1a237e',
                                  mr: 1.5,
                                  border: '2px solid #1a1a1a',
                                  fontFamily: 'Playfair Display'
                                }}
                              >
                                <School sx={{ fontSize: 22 }} />
                              </Avatar>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: 700,
                                    color: '#1a237e',
                                    fontFamily: 'Playfair Display',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                  title={education.career_name}
                                >
                                  {education.career_name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: 'block',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                  title={education.institution}
                                >
                                  {education.institution}
                                </Typography>
                              </Box>
                            </Box>

                            {education.year_semester && (
                              <Typography
                                variant="caption"
                                sx={{
                                  display: 'inline-block',
                                  bgcolor: '#f0f7ff',
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 2,
                                  border: '1px solid #1a237e',
                                  fontWeight: 600,
                                  mb: 1.5,
                                  fontSize: '0.75rem'
                                }}
                              >
                                {education.year_semester}
                              </Typography>
                            )}

                            {education.institution_address && (
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1, mb: 1 }}>
                                <LocationOn sx={{ fontSize: 16, mr: 0.5, color: '#1a237e', mt: 0.2 }} />
                                <Typography variant="caption" sx={{ lineHeight: 1.3 }}>
                                  {education.institution_address}
                                </Typography>
                              </Box>
                            )}

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                              {education.institution_map_link && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  href={education.institution_map_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  startIcon={<LocationOn sx={{ fontSize: 14 }} />}
                                  sx={{
                                    border: '2px solid #1a1a1a',
                                    boxShadow: '2px 2px 0px rgba(26,26,26,0.15)',
                                    color: '#1a237e',
                                    fontSize: '0.75rem',
                                    py: 0.5
                                  }}
                                >
                                  Ver Ubicación
                                </Button>
                              )}

                              {education.schedule_file && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={education.schedule_file.toLowerCase().endsWith('.pdf') ? <Description sx={{ fontSize: 14 }} /> : <Visibility sx={{ fontSize: 14 }} />}
                                  onClick={() => handleViewSchedule(education)}
                                  sx={{
                                    border: '2px solid #1a1a1a',
                                    boxShadow: '2px 2px 0px rgba(26,26,26,0.15)',
                                    color: '#1a237e',
                                    fontSize: '0.75rem',
                                    py: 0.5
                                  }}
                                >
                                  Ver Horario
                                </Button>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography color="text.secondary">
                    No hay información de estudios registrada
                  </Typography>
                )}
              </Box>
            )}

            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{
                  fontFamily: 'Playfair Display',
                  fontWeight: 700,
                  color: '#1a237e',
                  mb: 3
                }}>
                  <FamilyRestroom sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Miembros de la Familia
                </Typography>

                {beneficiary.familyMembers?.length > 0 ? (
                  <Box>
                    {beneficiary.familyMembers.map((member, index) => (
                      <Card
                        key={index}
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
                        <CardContent sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          flexWrap: { xs: 'wrap', sm: 'nowrap' }
                        }}>
                          <Avatar
                            sx={{
                              width: 50,
                              height: 50,
                              bgcolor: '#1a237e',
                              mr: 2,
                              border: '2px solid #1a1a1a',
                              fontFamily: 'Playfair Display',
                              fontWeight: 700
                            }}
                          >
                            {getInitials(member.full_name)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" sx={{
                              fontWeight: 600,
                              fontFamily: 'Playfair Display',
                              wordBreak: 'break-word'
                            }}>
                              {member.full_name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                              {member.relationship && (
                                <Typography variant="caption" sx={{
                                  bgcolor: '#f0f7ff',
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 2,
                                  border: '1px solid #1a237e',
                                  fontWeight: 600
                                }}>
                                  {member.relationship}
                                </Typography>
                              )}
                              {member.phone && (
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Phone sx={{ fontSize: 14, mr: 0.5, color: '#1a237e' }} />
                                  {member.phone}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    No hay familiares registrados
                  </Typography>
                )}
              </Box>
            )}

            {tabValue === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{
                  fontFamily: 'Playfair Display',
                  fontWeight: 700,
                  color: '#1a237e',
                  mb: 3
                }}>
                  <Church sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Información de la Iglesia
                </Typography>


                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
                  {beneficiary.church_attendance ? (
                    <CheckCircle sx={{ color: '#00c853', mr: 1 }} />
                  ) : (
                    <Cancel sx={{ color: '#ff1744', mr: 1 }} />
                  )}
                  <Typography sx={{ fontFamily: 'Playfair Display' }}>
                    {beneficiary.church_attendance ? 'Asiste a la iglesia' : 'No asiste a la iglesia'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {beneficiary.is_baptized ? (
                    <CheckCircle sx={{ color: '#00c853', mr: 1 }} />
                  ) : (
                    <Cancel sx={{ color: '#ff1744', mr: 1 }} />
                  )}
                  <Typography sx={{ fontFamily: 'Playfair Display' }}>
                    {beneficiary.is_baptized ? 'Está bautizado' : 'No está bautizado'}
                  </Typography>
                </Box>

                <InfoItem
                  icon={<Church sx={{ color: '#1a237e' }} />}
                  label="Nombre de la Iglesia"
                  value={beneficiary.church_name}
                />
                <InfoItem
                  icon={<Person sx={{ color: '#1a237e' }} />}
                  label="Pastor"
                  value={beneficiary.pastor_name}
                />
                <InfoItem
                  icon={<Phone sx={{ color: '#1a237e' }} />}
                  label="Contacto del Pastor"
                  value={beneficiary.pastor_phone}
                />
              </Box>
            )}

            {tabValue === 4 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{
                  fontFamily: 'Playfair Display',
                  fontWeight: 700,
                  color: '#1a237e',
                  mb: 3
                }}>
                  <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Información Laboral
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  {beneficiary.is_working ? (
                    <CheckCircle sx={{ color: '#00c853', mr: 1 }} />
                  ) : (
                    <Cancel sx={{ color: '#ff1744', mr: 1 }} />
                  )}
                  <Typography sx={{ fontFamily: 'Playfair Display' }}>
                    {beneficiary.is_working ? 'Actualmente trabaja' : 'No trabaja actualmente'}
                  </Typography>
                </Box>

                <InfoItem
                  icon={<Work sx={{ color: '#1a237e' }} />}
                  label="Lugar de Trabajo"
                  value={beneficiary.workplace}
                />
                <InfoItem
                  icon={<Phone sx={{ color: '#1a237e' }} />}
                  label="Contacto del Trabajo"
                  value={beneficiary.work_phone}
                />
              </Box>
            )}
          </Paper>
        </motion.div>
      </Container>

      <ConfirmDialog
        open={confirmToggleOpen}
        severity={beneficiary.is_active !== false ? 'disable' : 'success'}
        title={beneficiary.is_active !== false ? '¿Deshabilitar Patrocinado?' : '¿Habilitar Patrocinado?'}
        message={
          beneficiary.is_active !== false
            ? `${beneficiary.first_name} ${beneficiary.last_name} no podrá agregar, editar ni eliminar sus datos hasta que vuelvas a habilitarlo. Podrá seguir viendo su perfil normalmente.`
            : `${beneficiary.first_name} ${beneficiary.last_name} podrá volver a agregar, editar y eliminar sus datos.`
        }
        confirmLabel={beneficiary.is_active !== false ? 'Deshabilitar' : 'Habilitar'}
        loading={statusLoading}
        onConfirm={confirmToggleStatus}
        onClose={() => setConfirmToggleOpen(false)}
      />

      {previewModal}
    </Box>
  )
}

export default BeneficiaryDetail