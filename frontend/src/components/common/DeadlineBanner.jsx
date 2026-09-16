import React from 'react'
import { Box, Typography, Chip } from '@mui/material'
import { 
  AccessTime, 
  CheckCircle, 
  Cancel,
  Warning,
  EventAvailable,
  Block
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useDeadline } from '../../context/DeadlineContext'

const DeadlineBanner = () => {
  const { deadlineInfo, isAccountDisabled } = useDeadline()

  if (isAccountDisabled) {
    return (
      <Box sx={{
        p: 2,
        mb: 3,
        bgcolor: '#ffebee',
        border: '2px solid #1a1a1a',
        borderRadius: 3,
        boxShadow: '3px 3px 0px rgba(26,26,26,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Block sx={{ color: '#ff1744', fontSize: 28 }} />
        <Box>
          <Typography sx={{ fontFamily: 'Playfair Display', fontWeight: 700, color: '#1a1a1a' }}>
            {deadlineInfo.isExpired
              ? 'El plazo para modificar datos ha terminado'
              : 'Tu cuenta está deshabilitada para edición'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Puedes ver todos tus datos y documentos, pero no puedes agregar, editar ni eliminar información. Si necesitas hacer un cambio, contacta al administrador.
          </Typography>
        </Box>
      </Box>
    )
  }

  if (!deadlineInfo.isActive) {
    return (
      <Box sx={{
        p: 2,
        mb: 3,
        bgcolor: '#e8f5e9',
        border: '2px solid #1a1a1a',
        borderRadius: 3,
        boxShadow: '3px 3px 0px rgba(26,26,26,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <CheckCircle sx={{ color: '#00c853', fontSize: 28 }} />
        <Typography sx={{ fontFamily: 'Playfair Display', fontWeight: 600, color: '#1a1a1a' }}>
          No hay fecha límite establecida. Puedes actualizar tus datos cuando quieras.
        </Typography>
      </Box>
    )
  }

  if (deadlineInfo.isExpired) {
    return (
      <Box sx={{
        p: 2,
        mb: 3,
        bgcolor: '#ffebee',
        border: '2px solid #1a1a1a',
        borderRadius: 3,
        boxShadow: '3px 3px 0px rgba(26,26,26,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <Cancel sx={{ color: '#ff1744', fontSize: 28 }} />
        <Box>
          <Typography sx={{ fontFamily: 'Playfair Display', fontWeight: 700, color: '#1a1a1a' }}>
            El plazo ha expirado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            La fecha límite fue el {formatDate(deadlineInfo.deadline)}
          </Typography>
        </Box>
      </Box>
    )
  }

  const isUrgent = deadlineInfo.daysRemaining < 2
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{
        p: 2,
        mb: 3,
        bgcolor: isUrgent ? '#fff3e0' : '#e3f2fd',
        border: '2px solid #1a1a1a',
        borderRadius: 3,
        boxShadow: '3px 3px 0px rgba(26,26,26,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap'
      }}>
        {isUrgent ? (
          <Warning sx={{ color: '#ff6b00', fontSize: 28 }} />
        ) : (
          <AccessTime sx={{ color: '#1a237e', fontSize: 28 }} />
        )}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontFamily: 'Playfair Display', fontWeight: 700, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 1 }}>
            {isUrgent ? (
              <>
                <Warning sx={{ fontSize: 20, color: '#ff6b00' }} />
                ¡Plazo casi vencido!
              </>
            ) : (
              <>
                <EventAvailable sx={{ fontSize: 20, color: '#1a237e' }} />
                Fecha límite para actualizar datos
              </>
            )}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tienes hasta el {formatDate(deadlineInfo.deadline)}
          </Typography>
        </Box>
        <Chip
          icon={<AccessTime sx={{ fontSize: 16 }} />}
          label={deadlineInfo.daysRemaining > 0 
            ? `${deadlineInfo.daysRemaining} días, ${deadlineInfo.hoursRemaining} hrs`
            : `${deadlineInfo.hoursRemaining} horas`
          }
          sx={{
            bgcolor: isUrgent ? '#ff6b00' : '#1a237e',
            color: 'white',
            fontWeight: 700,
            fontFamily: 'Playfair Display',
            border: '2px solid #1a1a1a',
            fontSize: '0.85rem',
            '& .MuiChip-icon': {
              color: 'white'
            }
          }}
        />
      </Box>
    </motion.div>
  )
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default DeadlineBanner