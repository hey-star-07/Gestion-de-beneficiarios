import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button
} from '@mui/material'
import { Warning, Delete, Block, CheckCircle } from '@mui/icons-material'

const ICONS = {
  warning: <Warning sx={{ fontSize: 30, color: '#ff6b00' }} />,
  delete: <Delete sx={{ fontSize: 30, color: '#ff1744' }} />,
  disable: <Block sx={{ fontSize: 30, color: '#ff1744' }} />,
  success: <CheckCircle sx={{ fontSize: 30, color: '#00c853' }} />
}

const COLORS = {
  warning: { bg: '#ff6b00', hover: '#e05f00' },
  delete: { bg: '#ff1744', hover: '#d50000' },
  disable: { bg: '#ff1744', hover: '#d50000' },
  success: { bg: '#00c853', hover: '#00a844' }
}

/**
 * Modal de confirmación con el estilo del sistema (bordes gruesos,
 * sombra "offset" y tipografía Playfair Display), para reemplazar
 * los window.confirm() nativos del navegador.
 *
 * Uso:
 * <ConfirmDialog
 *   open={open}
 *   severity="delete" // 'warning' | 'delete' | 'disable' | 'success'
 *   title="¿Eliminar estudio?"
 *   message="Esta acción no se puede deshacer."
 *   confirmLabel="Eliminar"
 *   loading={loading}
 *   onConfirm={handleConfirm}
 *   onClose={() => setOpen(false)}
 * />
 */
const ConfirmDialog = ({
  open,
  title = '¿Estás seguro?',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  severity = 'warning',
  loading = false,
  onConfirm,
  onClose
}) => {
  const colors = COLORS[severity] || COLORS.warning

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      PaperProps={{
        sx: {
          border: '3px solid #1a1a1a',
          borderRadius: 3,
          boxShadow: '5px 5px 0px rgba(26,26,26,0.2)',
          bgcolor: '#fffdf9',
          maxWidth: 440
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        fontFamily: 'Playfair Display',
        fontWeight: 700,
        color: '#1a1a1a'
      }}>
        {ICONS[severity] || ICONS.warning}
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: '#1a1a1a' }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            border: '2px solid #1a1a1a',
            color: '#1a1a1a',
            '&:hover': { bgcolor: '#f0f0f0' }
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: colors.bg,
            border: '2px solid #1a1a1a',
            boxShadow: '2px 2px 0px rgba(26,26,26,0.2)',
            '&:hover': {
              bgcolor: colors.hover,
              transform: 'translate(1px, 1px)',
              boxShadow: '1px 1px 0px rgba(26,26,26,0.2)'
            }
          }}
        >
          {loading ? 'Procesando...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDialog