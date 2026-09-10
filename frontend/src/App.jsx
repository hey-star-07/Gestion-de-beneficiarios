import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import BeneficiaryDetail from './pages/BeneficiaryDetail'
import ResetPassword from './pages/ResetPassword'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f5f0e8'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Playfair Display', color: '#1a237e' }}>
            Cargando...
          </h2>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
      <Route path="/verify-email" element={!user ? <VerifyEmail /> : <Navigate to="/" replace />} />
      
      {/* Rutas protegidas */}
      <Route 
        path="/" 
        element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/profile" 
        element={user ? <Profile /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/beneficiary/:code" 
        element={user && user.role === 'ADMIN' ? <BeneficiaryDetail /> : <Navigate to="/" replace />} 
      />
      <Route 
        path="/reset-password" 
        element={!user ? <ResetPassword /> : <Navigate to="/" replace />} 
      />
      
      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App