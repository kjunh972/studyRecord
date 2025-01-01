import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  TextField, Button, Card, CardContent, Typography,
  CircularProgress
} from '@mui/material'
import { motion } from "framer-motion"
import { useTheme } from '../../hooks/useTheme'
import { authService } from '../../services/auth'

export default function SignUpPage() {
  const { theme } = useTheme()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
    birthdate: '',
  })
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    passwordConfirm: '',
    phone: ''
  })
  const navigate = useNavigate()

  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '')
    
    // 11자리로 제한
    const trimmed = numbers.slice(0, 11)
    
    // xxx-xxxx-xxxx 형식으로 포맷팅
    if (trimmed.length >= 3) {
      if (trimmed.length >= 7) {
        return `${trimmed.slice(0, 3)}-${trimmed.slice(3, 7)}-${trimmed.slice(7)}`
      }
      return `${trimmed.slice(0, 3)}-${trimmed.slice(3)}`
    }
    return trimmed
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'phone') {
      // 전화번호 입력 시 포맷팅 적용
      const formatted = formatPhoneNumber(e.target.value)
      setFormData(prev => ({
        ...prev,
        [e.target.name]: formatted
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {
      username: '',
      password: '',
      passwordConfirm: '',
      phone: ''
    }

    if (formData.username.length < 4) {
      newErrors.username = '아이디는 4자 이상이어야 합니다'
    }

    if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다'
    }

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다'
    }

    if (!/^\d{3}-\d{4}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = '올바른 전화번호 형식을 입력해주세요 (예: 010-1234-5678)'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await authService.signup({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        birthdate: formData.birthdate
      })
      navigate('/login')
    } catch (error) {
      console.error('회원가입 실패:', error)
      // TODO: 에러 처리
    } finally {
      setIsLoading(false)
    }
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
              회원가입
            </Typography>
            <Typography sx={{ 
              mb: 4,
              color: 'hsl(var(--muted-foreground))'
            }}>
              아래 정보를 입력하여 계정을 만드세요
            </Typography>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                fullWidth
                label="아이디"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'hsl(var(--background))',
                    '& fieldset': {
                      borderColor: 'hsl(var(--input))'
                    }
                  }
                }}
              />
              <TextField
                fullWidth
                label="비밀번호"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'hsl(var(--background))'
                  }
                }}
              />
              <TextField
                fullWidth
                label="비밀번호 확인"
                name="passwordConfirm"
                type="password"
                value={formData.passwordConfirm}
                onChange={handleChange}
                error={!!errors.passwordConfirm}
                helperText={errors.passwordConfirm}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'hsl(var(--background))'
                  }
                }}
              />
              <TextField
                fullWidth
                label="이름"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'hsl(var(--background))'
                  }
                }}
              />
              <TextField
                name="phone"
                label="전화번호"
                value={formData.phone}
                onChange={handleChange}
                placeholder="01012345678"
                inputProps={{
                  maxLength: 13  // 하이픈 포함 최대 길이
                }}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="생년월일"
                name="birthdate"
                type="date"
                value={formData.birthdate}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'hsl(var(--background))',
                    '& input': {
                      color: 'hsl(var(--foreground))',
                      '&::-webkit-calendar-picker-indicator': {
                        filter: theme === 'dark' ? 'invert(100%)' : 'none',
                        cursor: 'pointer'
                      }
                    },
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

            <Typography sx={{ 
              mt: 3,
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'hsl(var(--muted-foreground))'
            }}>
              이미 계정이 있으신가요?{' '}
              <Link
                to="/login"
                className="text-primary hover:underline"
              >
                로그인
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

