import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  TextField, Button, Card, CardContent, Typography,
  CircularProgress
} from '@mui/material'
import { motion } from "framer-motion"

export default function SignUpPage() {
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
      navigate('/login')
    }, 1000)
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-180px)] bg-background">
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
              계정 만들기
            </Typography>
            <Typography sx={{ 
              mb: 4,
              color: 'hsl(var(--muted-foreground))'
            }}>
              아래에 이메일을 입력하여 계정을 만드세요
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
                {isLoading ? <CircularProgress size={24} color="inherit" /> : '회원가입'}
              </Button>
            </form>

            <Typography sx={{ 
              mt: 3,
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'hsl(var(--muted-foreground))'
            }}>
              계속 진행함으로써, 귀하는 우리의{' '}
              <Link
                to="/terms"
                className="text-primary hover:underline"
              >
                서비스 약관
              </Link>
              {' '}및{' '}
              <Link
                to="/privacy"
                className="text-primary hover:underline"
              >
                개인정보 처리방침
              </Link>
              에 동의하게 됩니다.
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

