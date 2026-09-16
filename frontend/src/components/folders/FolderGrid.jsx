import React from 'react'
import { Box } from '@mui/material'
import FolderCard from './FolderCard'

const FolderGrid = ({ beneficiaries }) => {
  // Asegurarse de que beneficiaries sea un array
  const beneficiariesList = Array.isArray(beneficiaries) 
    ? beneficiaries 
    : beneficiaries?.data || []

  if (beneficiariesList.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        fontFamily: 'Playfair Display',
        color: '#666'
      }}>
        <p>No hay beneficiarios para mostrar</p>
      </div>
    )
  }

  // Se usa CSS Grid en vez de <Grid> de MUI porque su sistema de 12
  // columnas no permite 7 columnas exactas (12 no es divisible entre 7).
  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 2, md: 2.5 },
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          md: 'repeat(5, 1fr)',
          lg: 'repeat(6, 1fr)',
          xl: 'repeat(7, 1fr)'
        }
      }}
    >
      {beneficiariesList.map((beneficiary, index) => (
        <FolderCard 
          beneficiary={beneficiary} 
          key={beneficiary?.id || index} 
        />
      ))}
    </Box>
  )
}

export default FolderGrid