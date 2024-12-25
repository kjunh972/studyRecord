import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme } from '@mui/material/styles'
import Navbar from '../components/Navbar'
import './globals.css'
import { Outlet } from 'react-router-dom'

const theme = createTheme({
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#3B82F6',
    },
    background: {
      default: '#0A0A0A',
      paper: '#1A1A1A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A1A1AA',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A1A',
          borderRadius: '1rem',
          border: '1px solid #27272A',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.5rem',
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
})

export default function RootLayout() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="py-10">
          <main className="flex-1 container mx-auto px-4">
            <Outlet />
          </main>
        </div>
        <footer className="py-6 text-center text-sm text-gray-400 border-t border-gray-800">
          © 2024. kjunh972. All rights reserved.
        </footer>
      </div>
    </ThemeProvider>
  );
}

