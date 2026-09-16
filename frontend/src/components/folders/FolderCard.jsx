import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  Typography,
  Box
} from '@mui/material'
import {
  Folder,
  FolderOpen
} from '@mui/icons-material'
import { motion } from 'framer-motion'

const FolderCard = ({ beneficiary }) => {
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()

  const handleClick = () => {
    if (beneficiary?.code) {
      navigate(`/beneficiary/${beneficiary.code}`)
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ height: '100%' }}
    >
      <Card
        sx={{
          cursor: 'pointer',
          height: '100%',
          textAlign: 'center',
          border: '3px solid #1a1a1a',
          borderRadius: 3,
          boxShadow: '4px 4px 0px rgba(26,26,26,0.2)',
          bgcolor: '#fffdf9',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '6px 6px 0px rgba(26,26,26,0.15)'
          }
        }}
        onClick={handleClick}
      >
        <CardContent
          sx={{
            p: 1.5,
            '&:last-child': { pb: 1.5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {isHovered ? (
            <FolderOpen sx={{ fontSize: { xs: 48, lg: 52 }, color: '#ff6b00' }} />
          ) : (
            <Folder sx={{ fontSize: { xs: 48, lg: 52 }, color: '#1a237e' }} />
          )}

          <Typography
            sx={{
              mt: 0.5,
              fontWeight: 700,
              fontSize: '0.95rem',
              fontFamily: 'Playfair Display',
              color: '#1a237e',
              lineHeight: 1.2
            }}
          >
            {beneficiary?.code || 'N/A'}
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: '0.75rem',
              fontFamily: 'Playfair Display',
              color: '#333',
              lineHeight: 1.25,
              // Evita que un nombre largo desalinee las tarjetas
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
            title={`${beneficiary?.first_name || ''} ${beneficiary?.last_name || ''}`.trim()}
          >
            {beneficiary?.first_name || ''} {beneficiary?.last_name || ''}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default FolderCard