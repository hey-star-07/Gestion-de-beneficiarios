import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { beneficiaryService } from '../services/beneficiary.service'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Box,
  Paper,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme
} from '@mui/material'
import {
  Person,
  School,
  FamilyRestroom,
  Church,
  Work,
  Logout,
  Menu as MenuIcon,
  Close
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import PersonalForm from '../components/forms/PersonalForm'
import StudyForm from '../components/forms/StudyForm'
import FamilyForm from '../components/forms/FamilyForm'
import ChurchForm from '../components/forms/ChurchForm'
import WorkForm from '../components/forms/WorkForm'

const menuItems = [
  { id: 'personal', label: 'Personal', icon: <Person /> },
  { id: 'studies', label: 'Estudios', icon: <School /> },
  { id: 'family', label: 'Familia', icon: <FamilyRestroom /> },
  { id: 'church', label: 'Iglesia', icon: <Church /> },
  { id: 'work', label: 'Trabajo', icon: <Work /> }
]

const Profile = () => {
  const [activeSection, setActiveSection] = useState('personal')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      const response = await beneficiaryService.getMyProfile()
      console.log('📋 Perfil cargado:', response)
      
      // Manejar diferentes formatos de respuesta
      if (response?.data) {
        setProfile(response.data)
      } else if (response?.beneficiary) {
        setProfile(response.beneficiary)
      } else {
        setProfile(response)
      }
    } catch (error) {
      console.error('❌ Error al cargar perfil:', error)
      toast.error('Error al cargar tu perfil')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleMenuSelect = (sectionId) => {
    setActiveSection(sectionId)
    setMobileMenuOpen(false)
  }

  const renderSection = () => {
    if (!profile) return null
    
    switch(activeSection) {
      case 'personal':
        return <PersonalForm profile={profile} onUpdate={loadProfile} />
      case 'studies':
        return <StudyForm profile={profile} onUpdate={loadProfile} />
      case 'family':
        return <FamilyForm profile={profile} onUpdate={loadProfile} />
      case 'church':
        return <ChurchForm profile={profile} onUpdate={loadProfile} />
      case 'work':
        return <WorkForm profile={profile} onUpdate={loadProfile} />
      default:
        return <PersonalForm profile={profile} onUpdate={loadProfile} />
    }
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <Box sx={{ 
        p: 3, 
        textAlign: 'center', 
        borderBottom: '2px solid #1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a237e', fontFamily: 'Playfair Display' }}>
          Mi Panel
        </Typography>
        {isMobile && (
          <IconButton onClick={() => setMobileMenuOpen(false)}>
            <Close />
          </IconButton>
        )}
      </Box>

      {/* Menú */}
      <List sx={{ flex: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.id}
            button
            onClick={() => handleMenuSelect(item.id)}
            sx={{
              mb: 1,
              mx: 1,
              borderRadius: 2,
              border: '2px solid transparent',
              transition: 'all 0.2s ease',
              bgcolor: activeSection === item.id ? '#f0f7ff' : 'transparent',
              '&:hover': {
                bgcolor: '#f0f7ff',
                border: '2px solid #1a237e'
              }
            }}
          >
            <ListItemIcon sx={{ color: activeSection === item.id ? '#1a237e' : '#4a4a4a' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              sx={{
                '& .MuiListItemText-primary': {
                  fontWeight: 600,
                  color: activeSection === item.id ? '#1a237e' : '#1a1a1a',
                  fontFamily: 'Playfair Display'
                }
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Usuario y logout */}
      <Box sx={{ p: 2, borderTop: '2px solid #1a1a1a' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#1a237e',
              mr: 2,
              border: '2px solid #1a1a1a',
              fontFamily: 'Playfair Display'
            }}
          >
            {profile?.first_name?.[0] || user?.username?.[0] || 'U'}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'Playfair Display' }}>
              {profile?.first_name} {profile?.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {profile?.code || user?.beneficiaryCode}
            </Typography>
          </Box>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
          sx={{
            borderColor: '#1a1a1a',
            color: '#1a1a1a',
            '&:hover': {
              borderColor: '#ff6b00',
              color: '#ff6b00',
              bgcolor: '#fff5f0'
            }
          }}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </>
  )

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      bgcolor: '#f5f0e8',
      flexDirection: { xs: 'column', md: 'row' }
    }}>
      {/* Header móvil */}
      {isMobile && (
        <Box sx={{ 
          p: 2, 
          bgcolor: '#1a237e',
          borderBottom: '3px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <IconButton onClick={() => setMobileMenuOpen(true)} sx={{ color: 'white' }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ color: 'white', fontFamily: 'Playfair Display', fontWeight: 700 }}>
            Mi Panel
          </Typography>
          <Avatar sx={{ 
            width: 35, 
            height: 35, 
            bgcolor: '#ff6b00',
            border: '2px solid white',
            fontFamily: 'Playfair Display'
          }}>
            {profile?.first_name?.[0] || 'U'}
          </Avatar>
        </Box>
      )}

      {/* Sidebar para desktop */}
      {!isMobile && (
        <Paper
          sx={{
            width: 250,
            minHeight: '100vh',
            borderRadius: 0,
            border: 'none',
            borderRight: '3px solid #1a1a1a',
            bgcolor: '#fffdf9',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 0
          }}
        >
          {sidebarContent}
        </Paper>
      )}

      {/* Drawer para móvil */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: '#fffdf9',
            borderRight: '3px solid #1a1a1a'
          }
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Contenido principal */}
      <Box sx={{ 
        flex: 1, 
        p: { xs: 2, sm: 3, md: 4 }, 
        overflow: 'auto',
        width: '100%'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ 
            maxWidth: 800,
            margin: '0 auto',
            width: '100%'
          }}
        >
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" sx={{ fontFamily: 'Playfair Display' }}>
                Cargando...
              </Typography>
            </Box>
          ) : (
            renderSection()
          )}
        </motion.div>
      </Box>
    </Box>
  )
}

export default Profile