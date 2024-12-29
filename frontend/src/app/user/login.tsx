import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  TextField, Button, Card, CardContent, Typography, Box,
  CircularProgress, Divider
} from '@mui/material'
import { GitHub } from '@mui/icons-material'
import { motion } from "framer-motion"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const navigate = useNavigate()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const form = event.currentTarget
    const formData = new FormData(form)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const email = formData.get('email') as string
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const password = formData.get('password') as string

    // API 호출 시뮬레이션
    setTimeout(() => {
      setIsLoading(false)
      navigate('/')
    }, 1000)
  }

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
              이메일과 비밀번호를 입력하여 로그인하세요
            </Typography>

            <form onSubmit={onSubmit} className="space-y-4">
              <TextField
                fullWidth
                label="이메일"
                type="email"
                name="email"
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

