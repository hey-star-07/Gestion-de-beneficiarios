import React from 'react'
import { Grid } from '@mui/material'
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

  return (
    <Grid container spacing={4} justifyContent="center">
      {beneficiariesList.map((beneficiary, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={beneficiary?.id || index}>
          <FolderCard beneficiary={beneficiary} />
        </Grid>
      ))}
    </Grid>
  )
}

export default FolderGrid