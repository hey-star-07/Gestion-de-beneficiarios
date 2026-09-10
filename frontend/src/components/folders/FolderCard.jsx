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
    >
      <Card
        sx={{
          cursor: 'pointer',
          height: '100%',
          textAlign: 'center',
          p: 3,
          border: '3px solid #1a1a1a',
          borderRadius: 4,
          boxShadow: '5px 5px 0px rgba(26,26,26,0.2)',
          bgcolor: '#fffdf9',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '7px 7px 0px rgba(26,26,26,0.15)'
          }
        }}
        onClick={handleClick}
      >
        <CardContent>
          {isHovered ? (
            <FolderOpen sx={{ fontSize: 80, color: '#ff6b00' }} />
          ) : (
            <Folder sx={{ fontSize: 80, color: '#1a237e' }} />
          )}
          
          <Typography 
            variant="h6" 
            sx={{ 
              mt: 2, 
              fontWeight: 700,
              fontFamily: 'Playfair Display',
              color: '#1a237e'
            }}
          >
            {beneficiary?.code || 'N/A'}
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              mt: 1,
              fontFamily: 'Playfair Display',
              color: '#333'
            }}
          >
            {beneficiary?.first_name || ''} {beneficiary?.last_name || ''}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default FolderCard