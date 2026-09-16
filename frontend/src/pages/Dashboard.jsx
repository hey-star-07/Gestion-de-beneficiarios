import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { beneficiaryService } from '../services/beneficiary.service'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Container,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Button,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Logout,
  Search,
  Home,
  Settings
} from '@mui/icons-material'
import FolderGrid from '../components/folders/FolderGrid'

const Dashboard = () => {
  const [beneficiaries, setBeneficiaries] = useState([])
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('Dashboard - Usuario:', user)
    
    if (user?.role === 'USER') {
      navigate('/profile', { replace: true })
      return
    }
    
    if (user?.role === 'ADMIN') {
      loadBeneficiaries()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadBeneficiaries = async () => {
    try {
      console.log('Cargando beneficiarios...')
      const response = await beneficiaryService.getAll()
      console.log('Respuesta completa:', response)
      
      let beneficiariesList = []
      
      if (Array.isArray(response.data)) {
        beneficiariesList = response.data
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        beneficiariesList = response.data.data
      } else if (response.data?.beneficiaries && Array.isArray(response.data.beneficiaries)) {
        beneficiariesList = response.data.beneficiaries
      } else {
        console.warn('Formato de respuesta no reconocido:', response.data)
        beneficiariesList = []
      }
      
      console.log('Beneficiarios procesados:', beneficiariesList)
      
      setBeneficiaries(beneficiariesList)
      setFilteredBeneficiaries(beneficiariesList)
    } catch (error) {
      console.error('Error al cargar beneficiarios:', error)
      toast.error('Error al cargar beneficiarios')
      setBeneficiaries([])
      setFilteredBeneficiaries([])
    } finally {
      setLoading(false)
    }
  }

  // Quita tildes/diacríticos y pasa a minúsculas para que la búsqueda
  // funcione igual escribiendo "Martinez" o "Martínez".
  const normalize = (text) =>
    (text || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()

  useEffect(() => {
    if (searchTerm && Array.isArray(beneficiaries)) {
      // Se busca palabra por palabra: así "esther carvajal" encuentra a
      // "Esther Mayerly Carvajal Quispe" aunque se omita el segundo nombre.
      const words = normalize(searchTerm).split(/\s+/).filter(Boolean)

      const filtered = beneficiaries.filter(b => {
        const haystack = normalize(
          `${b?.code || ''} ${b?.first_name || ''} ${b?.last_name || ''}`
        )

        return words.every(word => haystack.includes(word))
      })

      setFilteredBeneficiaries(filtered)
    } else {
      setFilteredBeneficiaries(beneficiaries)
    }
  }, [searchTerm, beneficiaries])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSettings = () => {
    navigate('/admin/settings')
  }

  console.log('Estado actual:', { 
    loading, 
    beneficiariesCount: beneficiaries.length,
    filteredCount: filteredBeneficiaries.length 
  })

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f5f0e8',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <AppBar 
        position="static" 
        sx={{ 
          bgcolor: '#1a237e', 
          borderBottom: '3px solid #1a1a1a',
          boxShadow: 'none'
        }}
      >
        <Toolbar>
          <Home sx={{ fontSize: 30, color: 'white', mr: 2 }} />
          
          <Typography 
            variant="h6" 
            sx={{ 
              flexGrow: 1, 
              fontFamily: 'Playfair Display', 
              fontWeight: 700,
              color: 'white'
            }}
          >
            Gestión de Beneficiarios
          </Typography>
          
          {/* Botón de Configuración (solo admin) */}
          {user?.role === 'ADMIN' && (
            <Tooltip title="Configuración">
              <IconButton
                color="inherit"
                onClick={handleSettings}
                sx={{ 
                  mr: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <Settings />
              </IconButton>
            </Tooltip>
          )}
          
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#ff6b00',
              border: '2px solid white',
              mr: 2,
              fontFamily: 'Playfair Display'
            }}
          >
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </Avatar>
          
          <Button
            variant="outlined"
            onClick={handleLogout}
            sx={{
              color: 'white',
              borderColor: 'white',
              '&:hover': {
                borderColor: '#ff6b00',
                color: '#ff6b00',
                bgcolor: 'rgba(255,107,0,0.1)'
              }
            }}
          >
            <Logout sx={{ mr: 1 }} />
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      {/* Contenido */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              color: '#1a237e',
              fontFamily: 'Playfair Display',
              mb: 1
            }}
          >
            Beneficiarios
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {filteredBeneficiaries.length} beneficiarios registrados
          </Typography>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por código o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ 
            mb: 4,
            maxWidth: 500,
            mx: 'auto',
            display: 'block',
            '& .MuiOutlinedInput-root': {
              bgcolor: '#fffdf9',
              border: '2px solid #1a1a1a',
              borderRadius: 4,
              boxShadow: '3px 3px 0px rgba(26,26,26,0.15)'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#1a237e' }} />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#1a237e', mb: 2 }} />
            <Typography variant="h6" sx={{ fontFamily: 'Playfair Display' }}>
              Cargando beneficiarios...
            </Typography>
          </Box>
        ) : (
          <FolderGrid beneficiaries={filteredBeneficiaries} />
        )}
      </Container>
    </Box>
  )
}

export default Dashboard