import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, Typography, Button, Box, List, ListItem } from '@mui/material'

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ 
          bgcolor: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 'var(--radius)',
          maxWidth: '800px',
          mx: 'auto'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" sx={{ 
              mb: 4,
              color: 'hsl(var(--foreground))',
              fontWeight: 600,
              textAlign: 'center'
            }}>
              서비스 이용약관
            </Typography>

            <Box sx={{ color: 'hsl(var(--foreground))' }}>
              <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                1. 서비스 이용 약관 동의
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                본 약관은 Study Record (이하 "회사")가 제공하는 모든 서비스(이하 "서비스")의 이용 조건 및 절차, 이용자와 회사의 권리, 의무, 책임사항 등을 규정하는 것을 목적으로 합니다.
              </Typography>

              <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                2. 서비스 이용
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                회원은 회사가 정한 가입 양식에 따라 아이디, 비밀번호 등 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.
              </Typography>

              <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                3. 개인정보보호
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                회사는 관련법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련법령 및 회사의 개인정보처리방침이 적용됩니다.
              </Typography>

              <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                4. 회원의 의무
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                회원은 서비스를 이용할 때 다음 행위를 하지 않아야 합니다:
              </Typography>
              <List sx={{ pl: 4, mb: 2 }}>
                <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                  다른 회원의 ID를 부정 사용하는 행위
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                  서비스에서 얻은 정보를 회사의 사전 승낙 없이 상업적으로 이용하는 행위
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                  회사 및 기타 제3자의 저작권 등 지적재산권을 침해하는 행위
                </ListItem>
              </List>

              <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                5. 서비스 제공의 중지
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                회사는 다음 경우에 서비스 제공을 중지할 수 있습니다:
              </Typography>
              <List sx={{ pl: 4, mb: 2 }}>
                <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                  서비스용 설비의 보수 등 공사로 인한 부득이한 경우
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                  전기통신사업법에 규정된 기간통신사업자가 전기통신 서비스를 중지했을 경우
                </ListItem>
              </List>

              <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                6. 약관의 개정
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                회사는 필요한 경우 약관을 개정할 수 있으며, 개정된 약관은 웹사이트에 공지함으로써 효력이 발생합니다.
              </Typography>
            </Box>
          </CardContent>
        </Card>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            component={Link}
            to="/"
            variant="contained"
            sx={{ 
              bgcolor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              '&:hover': {
                bgcolor: 'hsl(var(--primary) / 0.9)'
              }
            }}
          >
            홈으로 돌아가기
          </Button>
        </Box>
      </motion.div>
    </div>
  )
} 