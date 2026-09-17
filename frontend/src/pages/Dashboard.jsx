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
  Tooltip,
  useMediaQuery,
  useTheme
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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

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
      console.log('Cargando Patrocinados...')
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

      console.log('Patrocinados procesados:', beneficiariesList)

      setBeneficiaries(beneficiariesList)
      setFilteredBeneficiaries(beneficiariesList)
    } catch (error) {
      console.error('Error al cargar Patrocinados:', error)
      toast.error('Error al cargar Patrocinados')
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
      // Se busca palabra por palabra: así "esther flores" encuentra a
      // "Esther Analuz Flores Perez" aunque se omita el segundo nombre.
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
        <Toolbar sx={{ px: { xs: 1.5, sm: 2 }, gap: { xs: 0.5, sm: 1 } }}>
          <Home sx={{ fontSize: { xs: 24, sm: 30 }, color: 'white', mr: { xs: 1, sm: 2 } }} />

          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              fontFamily: 'Playfair Display',
              fontWeight: 700,
              color: 'white',
              fontSize: { xs: '0.95rem', sm: '1.25rem' },
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {isMobile ? 'Patrocinados' : 'Gestión de Patrocinados'}
          </Typography>

          {/* Botón de Configuración (solo admin) */}
          {user?.role === 'ADMIN' && (
            <Tooltip title="Configuración">
              <IconButton
                color="inherit"
                onClick={handleSettings}
                sx={{
                  mr: { xs: 0.5, sm: 2 },
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
              width: { xs: 34, sm: 40 },
              height: { xs: 34, sm: 40 },
              bgcolor: '#ff6b00',
              border: '2px solid white',
              mr: { xs: 1, sm: 2 },
              fontFamily: 'Playfair Display'
            }}
          >
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </Avatar>

          {isMobile ? (
            <Tooltip title="Salir">
              <IconButton
                onClick={handleLogout}
                sx={{
                  color: 'white',
                  border: '1px solid white',
                  '&:hover': {
                    borderColor: '#ff6b00',
                    color: '#ff6b00',
                    bgcolor: 'rgba(255,107,0,0.1)'
                  }
                }}
              >
                <Logout fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              variant="outlined"
              onClick={handleLogout}
              sx={{
                color: 'white',
                borderColor: 'white',
                whiteSpace: 'nowrap',
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
          )}
        </Toolbar>
      </AppBar>

      {/* Contenido */}
      <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 3 }, flex: 1 }}>
        <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: '#1a237e',
              fontFamily: 'Playfair Display',
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '3rem' }
            }}
          >
            Patronicinados
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {filteredBeneficiaries.length} Patronicinados registrados
          </Typography>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por código o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            mb: { xs: 3, sm: 4 },
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
              Cargando Patrocinados...
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