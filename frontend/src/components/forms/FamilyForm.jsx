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
  InputAdornment
} from '@mui/material'
import {
  Add,
  Person,
  Phone,
  FamilyRestroom,
  Save,
  Delete
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { beneficiaryService } from '../../services/beneficiary.service'
import { RELATIONSHIP_OPTIONS } from '../../utils/constants'

const FamilyForm = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [familyMembers, setFamilyMembers] = useState(
    profile?.familyMembers || []
  )
  const [newMember, setNewMember] = useState({
    full_name: '',
    phone: '',
    relationship: ''
  })
  const [loading, setLoading] = useState(false)

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
    console.log('📤 Datos del nuevo familiar:', newMember)
    
    if (!newMember.full_name || !newMember.relationship) {
      toast.error('Nombre y relación son requeridos', {
        style: {
          border: '2px solid #ff6b00',
          boxShadow: '3px 3px 0px rgba(255,107,0,0.3)'
        }
      })
      return
    }

    setLoading(true)
    try {
      console.log('📤 Enviando familiar...')
      
      const response = await beneficiaryService.addFamilyMember(profile.id, {
        full_name: newMember.full_name,
        phone: newMember.phone,
        relationship: newMember.relationship
      })
      
      console.log('✅ Respuesta del servidor:', response)
      
      toast.success(`¡${newMember.full_name} agregado a la familia! 👨‍👩‍👧‍👦`, {
        style: {
          border: '2px solid #1a237e',
          boxShadow: '3px 3px 0px rgba(26,35,126,0.3)'
        }
      })
      
      // Limpiar formulario
      setNewMember({
        full_name: '',
        phone: '',
        relationship: ''
      })
      
      // Recargar perfil
      if (onUpdate) {
        await onUpdate()
      }
      
      // Actualizar lista local
      const updatedProfile = await beneficiaryService.getMyProfile()
      console.log('📋 Perfil actualizado:', updatedProfile)
      setFamilyMembers(updatedProfile?.familyMembers || [])
      setIsEditing(false)
      
    } catch (error) {
      console.error('❌ Error completo:', error)
      console.error('❌ Respuesta del error:', error.response?.data)
      toast.error(error.response?.data?.error || 'Error al agregar familiar')
    } finally {
      setLoading(false)
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
        
        <Box sx={{ mt: 3 }}>
          <AnimatePresence>
            {familyMembers.map((member, index) => (
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
                    <Box sx={{ flex: 1 }}>
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
          Agregar Familiar
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
        <FamilyRestroom sx={{ mr: 1, verticalAlign: 'middle' }} />
        {familyMembers.length > 0 ? 'Agregar Familiar' : 'Registrar Familia'}
      </Typography>

      {familyMembers.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, fontFamily: 'Playfair Display' }}>
            Familiares registrados:
          </Typography>
          {familyMembers.map((member, index) => (
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
                  {getInitials(member.full_name)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {member.full_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {member.relationship}
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
          Nuevo Familiar
        </Typography>
        
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
            {loading ? 'Guardando...' : 'Guardar Familiar'}
          </Button>
          {familyMembers.length > 0 && (
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

export default FamilyForm