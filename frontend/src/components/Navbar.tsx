import { Link, useNavigate } from 'react-router-dom'
import { ModeToggle } from './mode-toggle'
import { AppBar, Toolbar, Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { BookOpen, LogIn, UserPlus, User, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
  }

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false)
    logout()
    navigate('/')
  }

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false)
  }

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
          {!isAuthenticated ? (
            <>
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
            </>
          ) : (
            <>
              <Button
                component={Link}
                to="/mypage"
                startIcon={<User size={18} />}
                sx={{
                  color: 'hsl(var(--foreground))',
                  '&:hover': {
                    color: 'hsl(var(--primary))',
                    bgcolor: 'hsl(var(--accent))'
                  }
                }}
              >
                마이페이지
              </Button>
              <Button
                onClick={handleLogoutClick}
                startIcon={<LogOut size={18} />}
                sx={{
                  color: 'hsl(var(--foreground))',
                  '&:hover': {
                    color: '#ef4444',
                    bgcolor: 'rgba(239, 68, 68, 0.15)'
                  }
                }}
              >
                로그아웃
              </Button>
            </>
          )}
          <ModeToggle />
        </Box>
      </Toolbar>
      <Dialog 
        open={showLogoutDialog} 
        onClose={handleLogoutCancel}
        PaperProps={{
          sx: {
            bgcolor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            minWidth: '320px'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'hsl(var(--foreground))',
          p: 2.5
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LogOut size={20} />
            로그아웃
          </Box>
        </DialogTitle>
        <DialogContent sx={{ 
          color: 'hsl(var(--foreground))',
          p: 2,
          pb: 3.5,
          textAlign: 'center',
          fontSize: '1rem'
        }}>
          정말 로그아웃 하시겠습니까?
        </DialogContent>
        <DialogActions sx={{ 
          p: 3,
          pt: 0,
          gap: 1,
          justifyContent: 'center'
        }}>
          <Button 
            onClick={handleLogoutCancel}
            variant="outlined"
            sx={{ 
              bgcolor: 'white',
              color: 'black',
              borderColor: '#e5e7eb',
              '&:hover': {
                bgcolor: '#e5e7eb',
                borderColor: '#e5e7eb'
              }
            }}
          >
            취소
          </Button>
          <Button 
            onClick={handleLogoutConfirm} 
            sx={{ 
              bgcolor: '#ef4444',
              color: 'white',
              '&:hover': { 
                bgcolor: '#ff6b6b'
              }
            }}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  )
}

