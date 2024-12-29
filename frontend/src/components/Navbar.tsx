import { Link } from 'react-router-dom'
import { ModeToggle } from './mode-toggle'
import { AppBar, Toolbar, Box, Typography, Button } from '@mui/material'
import { BookOpen, LogIn, UserPlus } from 'lucide-react'

export default function Navbar() {
  return (
    <AppBar 
      position="static" 
      sx={{ 
        bgcolor: 'hsl(var(--background))',
        borderBottom: '1px solid hsl(var(--border))'
      }}
    >
      <Toolbar className="container mx-auto">
        <Link to="/" className="flex items-center no-underline text-foreground">
          <BookOpen className="h-6 w-6 mr-2" />
          <Typography 
            variant="h6" 
            component="span" 
            sx={{ 
              fontWeight: 600,
              color: 'hsl(var(--foreground))'
            }}
          >
            Study Record
          </Typography>
        </Link>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2 
        }}>
          <Button
            component={Link}
            to="/login"
            startIcon={<LogIn size={18} />}
            sx={{
              color: 'hsl(var(--foreground))',
              '&:hover': {
                color: 'hsl(var(--primary))',
                bgcolor: 'hsl(var(--accent))'
              }
            }}
          >
            로그인
          </Button>
          <Button
            component={Link}
            to="/signup"
            startIcon={<UserPlus size={18} />}
            variant="contained"
            sx={{
              bgcolor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              '&:hover': {
                bgcolor: 'hsl(var(--primary) / 0.9)'
              }
            }}
          >
            회원가입
          </Button>
          <ModeToggle />
        </Box>
      </Toolbar>
    </AppBar>
  )
}

