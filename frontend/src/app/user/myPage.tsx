import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Card, CardContent, Typography, Avatar, Button, 
  Box, Tabs, Tab, LinearProgress, Container, CircularProgress,
  IconButton, Tooltip, Divider
} from '@mui/material'
import { 
  Bell, Settings, LogOut, BookOpen, Clock, 
  Calendar, TrendingUp, Activity, FileX
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import { studyRecordApi } from '../../services/api'
import { Link } from 'react-router-dom'

interface StudyRecord {
  id: number
  title: string
  content: string
  createdAt: string
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function MyPage() {
  const { user, logout } = useAuth()
  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    const fetchStudyRecords = async () => {
      try {
        const response = await studyRecordApi.getAll()
        setStudyRecords(response.data)
      } catch {
        setStudyRecords([])
      } finally {
        setLoading(false)
      }
    }
    fetchStudyRecords()
  }, [])

  const weeklyStudyData = studyRecords.reduce((acc, record) => {
    const date = new Date(record.createdAt)
    const day = date.toLocaleDateString('ko-KR', { weekday: 'short' })
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(weeklyStudyData).map(([name, hours]) => ({
    name,
    hours
  }))

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh' 
        }}>
          <CircularProgress />
        </Box>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Card 
              elevation={0}
              sx={{ 
                width: { xs: '100%', md: '30%' },
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                p: 4 
              }}>
                <Avatar 
                  sx={{ 
                    width: 120, 
                    height: 120,
                    bgcolor: 'primary.main',
                    fontSize: '2.5rem',
                    mb: 2,
                    border: '4px solid',
                    borderColor: 'background.paper',
                    boxShadow: 2
                  }}
                >
                  {user?.name?.charAt(0) || '?'}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {user?.name}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  {user?.username}
                </Typography>
                <Divider sx={{ width: '100%', mb: 3 }} />
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: 2, 
                  width: '100%',
                  mb: 3
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {studyRecords.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      학습기록
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {Object.keys(weeklyStudyData).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      학습일수
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {Math.round(studyRecords.length / (Object.keys(weeklyStudyData).length || 1) * 10) / 10}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      일평균
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="알림">
                    <IconButton sx={{ border: 1, borderColor: 'divider' }}>
                      <Bell size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="설정">
                    <IconButton sx={{ border: 1, borderColor: 'divider' }}>
                      <Settings size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="로그아웃">
                    <IconButton 
                      onClick={logout}
                      sx={{ 
                        border: 1, 
                        borderColor: 'divider',
                        '&:hover': {
                          color: 'error.main',
                          borderColor: 'error.main'
                        }
                      }}
                    >
                      <LogOut size={18} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>

            <Box sx={{ width: { xs: '100%', md: '70%' } }}>
              <Card 
                elevation={0}
                sx={{ 
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2
                }}
              >
                <Tabs 
                  value={tabValue} 
                  onChange={(_, newValue) => setTabValue(newValue)}
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    px: 2,
                    '& .MuiTab-root': {
                      minHeight: 64,
                      fontSize: '0.875rem'
                    }
                  }}
                >
                  <Tab 
                    icon={<Activity size={18} />} 
                    iconPosition="start" 
                    label="활동 개요" 
                  />
                  <Tab 
                    icon={<TrendingUp size={18} />} 
                    iconPosition="start" 
                    label="학습 통계" 
                  />
                  <Tab 
                    icon={<Clock size={18} />} 
                    iconPosition="start" 
                    label="최근 활동" 
                  />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      학습 현황
                    </Typography>
                    {studyRecords.length === 0 ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        py: 8,
                        color: 'text.secondary'
                      }}>
                        <FileX size={48} strokeWidth={1.5} />
                        <Typography sx={{ mt: 2, mb: 1 }}>
                          아직 학습 기록이 없습니다
                        </Typography>
                        <Button
                          component={Link}
                          to="/study/new"
                          variant="outlined"
                          size="small"
                          sx={{ mt: 2 }}
                        >
                          첫 학습 기록 작성하기
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>총 학습 기록</Typography>
                          <Typography fontWeight={500}>{studyRecords.length}개</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={studyRecords.length > 0 ? 100 : 0}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    )}
                  </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      주간 학습 통계
                    </Typography>
                    {studyRecords.length === 0 ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        py: 8,
                        color: 'text.secondary'
                      }}>
                        <FileX size={48} strokeWidth={1.5} />
                        <Typography sx={{ mt: 2 }}>
                          통계를 표시할 데이터가 없습니다
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ height: 300, p: 2 }}>
                        <ResponsiveContainer>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Bar 
                              dataKey="hours" 
                              fill="hsl(var(--primary))" 
                              name="학습 기록 수"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      최근 학습 기록
                    </Typography>
                    {studyRecords.length === 0 ? (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        py: 8,
                        color: 'text.secondary'
                      }}>
                        <FileX size={48} strokeWidth={1.5} />
                        <Typography sx={{ mt: 2 }}>
                          최근 활동 내역이 없습니다
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {studyRecords.slice(0, 5).map((record) => (
                          <Card
                            key={record.id}
                            elevation={0}
                            sx={{ 
                              p: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2,
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: 'action.hover',
                                transform: 'translateY(-2px)',
                                boxShadow: 1
                              }
                            }}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <BookOpen size={20} />
                                <Typography>{record.title}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Calendar size={16} />
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(record.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Card>
                        ))}
                      </Box>
                    )}
                  </Box>
                </TabPanel>
              </Card>
            </Box>
          </Box>
        </motion.div>
      )}
    </Container>
  )
}

