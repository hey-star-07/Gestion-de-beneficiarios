import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e', // Azul oscuro profesional
      light: '#3949ab',
      dark: '#0d1442',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#ff6b00', // Naranja vibrante
      light: '#ff8c40',
      dark: '#cc5500',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f5f0e8', // Beige
      paper: '#fffdf9'
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#4a4a4a'
    }
  },
  typography: {
    fontFamily: "'Playfair Display', 'Georgia', serif",
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.5px'
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.5px'
    },
    h3: {
      fontWeight: 600
    },
    h4: {
      fontWeight: 600
    },
    h5: {
      fontWeight: 600
    },
    h6: {
      fontWeight: 600
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontFamily: "'Playfair Display', 'Georgia', serif"
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '2px solid #1a1a1a',
          boxShadow: '3px 3px 0px #1a1a1a',
          padding: '12px 24px',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            transform: 'translate(1px, 1px)',
            boxShadow: '2px 2px 0px #1a1a1a'
          },
          '&:active': {
            transform: 'translate(3px, 3px)',
            boxShadow: '0px 0px 0px #1a1a1a'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '2px solid #1a1a1a',
          boxShadow: '5px 5px 0px rgba(26,26,26,0.2)',
          backgroundColor: '#fffdf9',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '7px 7px 0px rgba(26,26,26,0.15)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '2px solid #1a1a1a',
          boxShadow: '4px 4px 0px rgba(26,26,26,0.1)',
          backgroundColor: '#fffdf9'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease-in-out',
            '& .MuiOutlinedInput-notchedOutline': {
              border: '2px solid #1a1a1a'
            },
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1a237e'
              }
            },
            '&.Mui-focused': {
              boxShadow: '2px 2px 0px rgba(26,35,126,0.2)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1a237e',
                borderWidth: 2
              }
            }
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a237e',
          borderBottom: '3px solid #1a1a1a',
          boxShadow: 'none'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #1a1a1a',
          fontWeight: 600
        }
      }
    }
  }
});

export default theme;