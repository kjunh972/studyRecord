import { Link } from 'react-router-dom'
import { ModeToggle } from './mode-toggle'
import { AppBar, Toolbar, Box, Typography } from '@mui/material'
import { BookOpen } from 'lucide-react'

export default function Navbar() {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#1A1A1A', borderBottom: '1px solid #27272A' }}>
      <Toolbar className="container mx-auto">
        <Link to="/" className="flex items-center no-underline text-white">
          <BookOpen className="h-6 w-6 mr-2" />
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            Study Record
          </Typography>
        </Link>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ModeToggle />
        </Box>
      </Toolbar>
    </AppBar>
  )
}

