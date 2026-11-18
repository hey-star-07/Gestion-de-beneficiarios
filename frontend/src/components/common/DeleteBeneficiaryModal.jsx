import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  IconButton
} from '@mui/material'
import {
  Delete,
  Search,
  Close,
  Warning,
  Person
} from '@mui/icons-material'
import { toast } from 'react-hot-toast'
import { beneficiaryService } from '../../services/beneficiary.service'

const DeleteBeneficiaryModal = ({
  open,
  initialCode = '',
  onClose,
  onSuccess
}) => {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [beneficiary, setBeneficiary] = useState(null)
  const [searchError, setSearchError] = useState(null)

  useEffect(() => {
    if (open) {
      setCode(initialCode || '')
      setBeneficiary(null)
      setSearchError(null)
      if (initialCode) {
        searchBeneficiary(initialCode)
      }
    } else {
      setCode('')
      setBeneficiary(null)
      setSearchError(null)
    }
  }, [open, initialCode])

  const searchBeneficiary = async (codeToSearch) => {
    const trimmed = (codeToSearch || code).trim()
    if (!trimmed) {
      setSearchError('Ingresa un código de patrocinado')
      setBeneficiary(null)
      return
    }

    setLoading(true)
    setSearchError(null)
    setBeneficiary(null)

    try {
      const response = await beneficiaryService.getByCode(trimmed)
      let data = null

      if (response?.data?.success && response?.data?.data) {
        data = response.data.data
      } else if (response?.data?.id) {
        data = response.data
      } else if (Array.isArray(response?.data) && response.data.length > 0) {
        data = response.data[0]
      }

      if (!data) {
        setSearchError(`No se encontró ningún patrocinado con el código "${trimmed}"`)
      } else {
        setBeneficiary(data)
      }
    } catch (err) {
      console.error('Error buscando patrocinado:', err)
      setSearchError(
        err.response?.data?.error || `No se encontró ningún patrocinado con el código "${trimmed}"`
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!beneficiary?.code) return

    setDeleting(true)
    try {
      await beneficiaryService.deleteByCode(beneficiary.code)
      toast.success(`Patrocinado ${beneficiary.code} (${beneficiary.first_name} ${beneficiary.last_name}) eliminado exitosamente`)
      if (onSuccess) {
        onSuccess(beneficiary)
      }
      onClose()
    } catch (err) {
      console.error('Error al eliminar patrocinado:', err)
      toast.error(err.response?.data?.error || 'Error al eliminar el patrocinado')
    } finally {
      setDeleting(false)
    }
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?'
  }

  return (
    <Dialog
      open={open}
      onClose={deleting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          border: '3px solid #1a1a1a',
          borderRadius: 4,
          boxShadow: '6px 6px 0px rgba(26,26,26,0.2)',
          bgcolor: '#fffdf9'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'Playfair Display',
          fontWeight: 700,
          color: '#d32f2f',
          pb: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Delete sx={{ fontSize: 32, color: '#d32f2f' }} />
          <span>Eliminar Patrocinado</span>
        </Box>
        <IconButton onClick={onClose} disabled={deleting} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: '12px !important' }}>
        <Typography variant="body2" sx={{ color: '#555', mb: 2 }}>
          Ingresa el código del patrocinado para buscarlo y confirmar su eliminación permanente del sistema.
        </Typography>

        {/* Buscador de código */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Código del Patrocinado"
            placeholder="Ej. 2024-001"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setSearchError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                searchBeneficiary(code)
              }
            }}
            disabled={loading || deleting}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                border: '2px solid #1a1a1a',
                borderRadius: 2
              }
            }}
          />
          <Button
            variant="contained"
            onClick={() => searchBeneficiary(code)}
            disabled={!code.trim() || loading || deleting}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Search />}
            sx={{
              bgcolor: '#1a237e',
              color: 'white',
              border: '2px solid #1a1a1a',
              borderRadius: 2,
              boxShadow: '2px 2px 0px rgba(26,26,26,0.2)',
              whiteSpace: 'nowrap',
              fontFamily: 'Playfair Display',
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#0d1642'
              }
            }}
          >
            Buscar
          </Button>
        </Box>

        {/* Error en la búsqueda */}
        {searchError && (
          <Alert severity="error" sx={{ mb: 2, border: '2px solid #d32f2f', borderRadius: 2 }}>
            {searchError}
          </Alert>
        )}

        {/* Información del beneficiario encontrado */}
        {beneficiary && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              bgcolor: '#fff',
              border: '2px solid #1a1a1a',
              borderRadius: 3,
              boxShadow: '3px 3px 0px rgba(26,26,26,0.1)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
              <Avatar
                sx={{
                  width: 52,
                  height: 52,
                  bgcolor: '#1a237e',
                  border: '2px solid #1a1a1a',
                  fontFamily: 'Playfair Display',
                  fontWeight: 700
                }}
              >
                {getInitials(beneficiary.first_name, beneficiary.last_name)}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Playfair Display',
                    fontWeight: 700,
                    color: '#1a1a1a',
                    lineHeight: 1.2
                  }}
                >
                  {beneficiary.first_name} {beneficiary.last_name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
                  {beneficiary.email || 'Sin correo electrónico'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                label={`Código: ${beneficiary.code}`}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: '#fffdf9',
                  border: '1.5px solid #1a237e',
                  color: '#1a237e'
                }}
              />
              <Chip
                label={beneficiary.is_active !== false ? 'ACTIVO' : 'DESHABILITADO'}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: beneficiary.is_active !== false ? '#00c853' : '#ff1744',
                  color: 'white',
                  border: '1.5px solid #1a1a1a'
                }}
              />
            </Box>

            <Alert
              severity="warning"
              icon={<Warning sx={{ color: '#d32f2f' }} />}
              sx={{
                bgcolor: '#fff3e0',
                border: '2px solid #ff9800',
                borderRadius: 2,
                color: '#b71c1c',
                fontWeight: 500,
                fontSize: '0.85rem'
              }}
            >
              <strong>ADVERTENCIA:</strong> Esta acción no se puede deshacer. Se eliminarán permanentemente el perfil, historial de estudios, familiares registrados y el usuario de acceso.
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={deleting}
          sx={{
            border: '2px solid #1a1a1a',
            borderRadius: 2,
            color: '#1a1a1a',
            fontFamily: 'Playfair Display',
            fontWeight: 600,
            '&:hover': { bgcolor: '#f0f0f0' }
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          disabled={!beneficiary || deleting}
          startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : <Delete />}
          sx={{
            bgcolor: '#d32f2f',
            color: 'white',
            border: '2px solid #1a1a1a',
            borderRadius: 2,
            boxShadow: '3px 3px 0px rgba(26,26,26,0.2)',
            fontFamily: 'Playfair Display',
            fontWeight: 700,
            '&:hover': {
              bgcolor: '#b71c1c',
              transform: 'translate(1px, 1px)',
              boxShadow: '2px 2px 0px rgba(26,26,26,0.2)'
            },
            '&.Mui-disabled': {
              bgcolor: '#e0e0e0',
              color: '#9e9e9e',
              border: '2px solid #bdbdbd',
              boxShadow: 'none'
            }
          }}
        >
          {deleting ? 'Eliminando...' : 'Eliminar Patrocinado'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteBeneficiaryModal
