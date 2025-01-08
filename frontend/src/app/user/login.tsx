import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { 
  TextField, Button, Card, CardContent, Typography, Box,
  CircularProgress, Divider, Alert
} from '@mui/material'
import { GitHub } from '@mui/icons-material'
import { motion } from "framer-motion"
import { useAuth } from '../../contexts/AuthContext'

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    
    const formElement = event.currentTarget;
    const username = formElement.username.value;
    const password = formElement.password.value;
    
    try {
      await login(username, password);
      const params = new URLSearchParams(location.search);
      const redirectTo = params.get('redirect') || '/';
      navigate(redirectTo, { state: { from: 'login' } });
    } catch (err: any) {
      setError('아이디 또는 비밀번호가 일치하지 않습니다.');
      formElement.password.value = '';
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-120px)] bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ 
          width: 400,
          bgcolor: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)'
        }}>
          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 2 }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}
            
            <Typography variant="h4" sx={{ 
              mb: 1,
              color: 'hsl(var(--foreground))',
              fontWeight: 600
            }}>
              로그인
            </Typography>
            <Typography sx={{ 
              mb: 4,
              color: 'hsl(var(--muted-foreground))'
            }}>
              아이디와 비밀번호를 입력하여 로그인하세요
            </Typography>

            <form 
              onSubmit={handleSubmit} 
              className="space-y-4"
              noValidate
            >
              <TextField
                fullWidth
                label="아이디"
                type="text"
                name="username"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'hsl(var(--background))',
                    '& fieldset': {
                      borderColor: 'hsl(var(--input))'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'hsl(var(--muted-foreground))'
                  }
                }}
              />
              <TextField
                fullWidth
                label="비밀번호"
                type="password"
                name="password"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'hsl(var(--background))',
                    '& fieldset': {
                      borderColor: 'hsl(var(--input))'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'hsl(var(--muted-foreground))'
                  }
                }}
              />
              <Button
                fullWidth
                type="submit"
                disabled={isLoading}
                sx={{ 
                  mt: 2,
                  bgcolor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  '&:hover': {
                    bgcolor: 'hsl(var(--primary) / 0.9)'
                  }
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : '로그인'}
              </Button>
            </form>

            <Box sx={{ my: 3, position: 'relative' }}>
              <Divider>
                <Typography sx={{ 
                  px: 2,
                  color: 'hsl(var(--muted-foreground))',
                  bgcolor: 'hsl(var(--card))'
                }}>
                  또는
                </Typography>
              </Divider>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GitHub />}
              disabled={isLoading}
              sx={{
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--foreground))',
                '&:hover': {
                  borderColor: 'hsl(var(--border))',
                  bgcolor: 'hsl(var(--accent))'
                }
              }}
            >
              Github로 계속하기
            </Button>

            <Typography sx={{ 
              mt: 3,
              textAlign: 'center',
              color: 'hsl(var(--muted-foreground))'
            }}>
              계정이 없으신가요?{' '}
              <Link
                to="/signup"
                className="text-primary hover:underline"
              >
                회원가입
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

