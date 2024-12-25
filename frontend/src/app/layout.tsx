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
  },
})

export default function RootLayout() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Outlet />
        </main>
        <footer className="py-6 text-center text-sm text-gray-400">
          © 2024. kjunh972. All rights reserved.
        </footer>
      </div>
    </ThemeProvider>
  )
}


