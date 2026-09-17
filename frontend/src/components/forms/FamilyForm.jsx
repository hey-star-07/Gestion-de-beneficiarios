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
  Divider,
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
  Person,
  Phone,
  FamilyRestroom,
  Save,
  Edit,
  Delete,
  Close,
  Lock
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { beneficiaryService } from '../../services/beneficiary.service'
import { RELATIONSHIP_OPTIONS } from '../../utils/constants'
import { useDeadline } from '../../context/DeadlineContext'

const FamilyForm = ({ profile, onUpdate }) => {
  const { canEdit } = useDeadline()
  const [isEditing, setIsEditing] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [familyMembers, setFamilyMembers] = useState(
    profile?.familyMembers || []
  )
  const [newMember, setNewMember] = useState({
    full_name: '',
    phone: '',
    relationship: ''
  })
  const [loading, setLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState(null)

  useEffect(() => {
    if (profile?.familyMembers) {
      setFamilyMembers(profile.familyMembers)
    }
  }, [profile])

  const getInitials = (fullName) => {
    if (!fullName) return '?'
    const parts = fullName.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return parts[0][0]?.toUpperCase() || '?'
  }

  const handleAddMember = async () => {
    if (!canEdit) {
      toast.error('El plazo para modificar datos ha expirado')
      return
    }
    
    if (!newMember.full_name || !newMember.relationship) {
      toast.error('Nombre y relación son requeridos')
      return
    }

    setLoading(true)
    try {
      if (editingMember) {
        await beneficiaryService.updateFamilyMember(editingMember.id, {
          full_name: newMember.full_name,
          phone: newMember.phone,
          relationship: newMember.relationship
        })
        
        toast.success('¡Familiar actualizado exitosamente!')
      } else {
        await beneficiaryService.addFamilyMember(profile.id, {
          full_name: newMember.full_name,
          phone: newMember.phone,
          relationship: newMember.relationship
        })
        
        toast.success(`¡${newMember.full_name} agregado! 👨‍👩‍👧‍👦`)
      }

      const updatedProfile = await beneficiaryService.getMyProfile()

      // IMPORTANTE: setFamilyMembers y resetForm (que pone isEditing en
      // false) se llaman juntos, sin ningún await entre medio, para que
      // ambos se apliquen en el MISMO render. Antes resetForm() se
      // llamaba primero y esta actualización después: como la vista
      // estática solo se muestra cuando `!isEditing && familyMembers.length
      // > 0`, si familyMembers todavía estaba vacío en ese primer render
      // (por ejemplo al agregar el primer familiar), la condición fallaba
      // y el formulario — ya vacío por resetForm() — se quedaba abierto,
      // pareciendo "trabado" sin dejar ver la tarjeta ni cerrar.
      setFamilyMembers(updatedProfile?.familyMembers || [])
      resetForm()

      if (onUpdate) await onUpdate()
    } catch (error) {
      console.error('❌ Error:', error)
      toast.error(error.response?.data?.error || 'Error al guardar familiar')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setNewMember({
      full_name: '',
      phone: '',
      relationship: ''
    })
    setEditingMember(null)
    setIsEditing(false)
  }

  const handleEditClick = (member) => {
    if (!canEdit) {
      toast.error('El plazo para modificar datos ha expirado')
      return
    }
    
    setEditingMember(member)
    setNewMember({
      full_name: member.full_name || '',
      phone: member.phone || '',
      relationship: member.relationship || ''
    })
    setIsEditing(true)
  }

  const handleDeleteClick = (member) => {
    if (!canEdit) {
      toast.error('El plazo para modificar datos ha expirado')
      return
    }
    
    setMemberToDelete(member)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!memberToDelete || !canEdit) return
    
    try {
      await beneficiaryService.deleteFamilyMember(memberToDelete.id)
      
      toast.success('Familiar eliminado exitosamente')
      
      const updatedList = familyMembers.filter(m => m.id !== memberToDelete.id)
      setFamilyMembers(updatedList)
      
      if (onUpdate) await onUpdate()
    } catch (error) {
      console.error('❌ Error al eliminar:', error)
      toast.error('Error al eliminar el familiar')
    } finally {
      setDeleteDialogOpen(false)
      setMemberToDelete(null)
    }
  }

  // Vista estática
  if (!isEditing && familyMembers.length > 0) {
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
          <FamilyRestroom sx={{ mr: 1, verticalAlign: 'middle' }} />
          Miembros de la Familia
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
        
        <Box sx={{ mt: 3 }}>
          <AnimatePresence>
            {familyMembers.map((member, index) => (
              <motion.div
                key={member.id || index}
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
                          onClick={() => handleEditClick(member)}
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
                          onClick={() => handleDeleteClick(member)}
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

                  <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
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
                    <Box sx={{ flex: 1, pr: canEdit ? 8 : 0 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'Playfair Display' }}>
                        {member.full_name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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
          {canEdit ? 'Agregar Familiar' : 'Plazo Expirado'}
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
            ¿Eliminar familiar?
          </DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro de que deseas eliminar a <strong>{memberToDelete?.full_name}</strong>?
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
          <FamilyRestroom sx={{ mr: 1, verticalAlign: 'middle' }} />
          {editingMember ? 'Editar Familiar' : 'Agregar Familiar'}
        </Typography>
        <IconButton onClick={resetForm}>
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
              label="Nombre completo"
              value={newMember.full_name}
              onChange={(e) => setNewMember({...newMember, full_name: e.target.value})}
              required
              placeholder="Ej: María García Pérez"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: '#1a237e' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Teléfono"
              value={newMember.phone}
              onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
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
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Relación"
              value={newMember.relationship}
              onChange={(e) => setNewMember({...newMember, relationship: e.target.value})}
              SelectProps={{ native: true }}
              required
            >
              <option value="">Seleccionar relación...</option>
              {RELATIONSHIP_OPTIONS.map(rel => (
                <option key={rel} value={rel}>{rel}</option>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleAddMember}
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
            {loading ? 'Guardando...' : (editingMember ? 'Actualizar Familiar' : 'Guardar Familiar')}
          </Button>
          <Button
            variant="outlined"
            onClick={resetForm}
            sx={{
              border: '2px solid #1a1a1a',
              boxShadow: '2px 2px 0px rgba(26,26,26,0.2)'
            }}
          >
            Cancelar
          </Button>
        </Box>
      </Box>
    </Paper>
  )
}

export default FamilyForm