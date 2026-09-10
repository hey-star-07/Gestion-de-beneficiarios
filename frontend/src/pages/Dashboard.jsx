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
  CircularProgress
} from '@mui/material'
import {
  Logout,
  Search,
  Home
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
      console.log('Respuesta data:', response.data)
      
      // Manejar diferentes formatos de respuesta
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

  useEffect(() => {
    if (searchTerm && Array.isArray(beneficiaries)) {
      const filtered = beneficiaries.filter(b => 
        b?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredBeneficiaries(filtered)
    } else {
      setFilteredBeneficiaries(beneficiaries)
    }
  }, [searchTerm, beneficiaries])

  const handleLogout = () => {
    logout()
    navigate('/login')
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