import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Toaster } from 'react-hot-toast'
import theme from './theme'

// Configuración personalizada para toast
const toastOptions = {
  duration: 3000,
  style: {
    background: '#fffdf9',
    color: '#1a1a1a',
    borderRadius: '12px',
    border: '2px solid #1a1a1a',
    boxShadow: '3px 3px 0px rgba(26,26,26,0.2)',
    fontFamily: "'Playfair Display', Georgia, serif",
    fontWeight: 600,
    padding: '16px'
  },
  success: {
    iconTheme: {
      primary: '#1a237e',
      secondary: '#fffdf9',
    },
    style: {
      borderColor: '#1a237e',
      boxShadow: '3px 3px 0px rgba(26,35,126,0.2)'
    }
  },
  error: {
    iconTheme: {
      primary: '#ff6b00',
      secondary: '#fffdf9',
    },
    style: {
      borderColor: '#ff6b00',
      boxShadow: '3px 3px 0px rgba(255,107,0,0.2)'
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <App />
          <Toaster 
            position="top-right"
            toastOptions={toastOptions}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)