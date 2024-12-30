import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, Typography, Button, Box, List, ListItem } from '@mui/material'

export default function PrivacyPolicyPage() {
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
              개인정보 처리방침
            </Typography>

            <Box sx={{ color: 'hsl(var(--foreground))' }}>
              <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                1. 개인정보의 처리 목적
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Study Record는 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의 목적 이외의 용도로는 이용하지 않습니다.
              </Typography>
              <List sx={{ pl: 4, mb: 2 }}>
                <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                  고객 가입의사 확인, 고객에 대한 서비스 제공에 따른 본인 식별·인증
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                  회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                  마케팅 및 광고에의 활용, 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계
                </ListItem>
              </List>

              <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                2. 개인정보의 처리 및 보유 기간
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
              </Typography>

              <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                3. 정보주체의 권리·의무 및 행사방법
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다:
              </Typography>
              <List sx={{ pl: 4, mb: 2 }}>
                <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                  개인정보 열람요구
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                  오류 등이 있을 경우 정정 요구
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                  삭제요구
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                  처리정지 요구
                </ListItem>
              </List>

              <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                4. 처리하는 개인정보의 항목
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                회사는 다음의 개인정보 항목을 처리하고 있습니다:
              </Typography>
              <List sx={{ pl: 4, mb: 2 }}>
                <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                  아이디, 비밀번호, 이름, 전화번호, 생년월일
                </ListItem>
              </List>

              <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                5. 개인정보의 파기
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                회사는 원칙적으로 개인정보 처리목적이 달성된 경우에는 지체없이 해당 개인정보를 파기합니다. 파기의 절차, 기한 및 방법은 다음과 같습니다:
              </Typography>
              <List sx={{ pl: 4, mb: 2 }}>
                <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                  파기절차: 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                  파기기한: 이용자의 개인정보는 개인정보의 보유기간이 경과된 경우에는 보유기간의 종료일로부터 5일 이내에, 개인정보의 처리 목적 달성 등 그 개인정보가 불필요하게 되었을 때에는 개인정보의 처리가 불필요한 것으로 인정되는 날로부터 5일 이내에 그 개인정보를 파기합니다.
                </ListItem>
              </List>

              <Typography variant="h5" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                6. 개인정보 보호책임자
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:
              </Typography>
              <List sx={{ pl: 4, mb: 2 }}>
                <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                  개인정보 보호책임자: 김준형
                </ListItem>
                <ListItem sx={{ display: 'list-item', listStyleType: 'disc' }}>
                  연락처: kjunh972@gmail.com
                </ListItem>
              </List>
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