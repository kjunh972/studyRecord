import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Card, CardContent, Typography, Avatar, Button, 
  Box, Tabs, Tab, LinearProgress, Container, CircularProgress,
  IconButton, Tooltip, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert
} from '@mui/material'
import { 
  UserCog, Trash2, LogOut, BookOpen, Clock, 
  Calendar, TrendingUp, Activity, FileX
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../contexts/AuthContext'
import { studyRecordApi, userApi } from '../../services/api'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { User, StudyRecord } from '../../types'

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

const textFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: 'hsl(var(--background))',
    '& fieldset': { borderColor: 'hsl(var(--border))' }
  },
  '& .MuiInputLabel-root': {
    color: 'hsl(var(--muted-foreground))',
    '&.MuiInputLabel-shrink': {
      bgcolor: 'hsl(var(--background))',
      padding: '0 8px',
      marginTop: '0'
    }
  },
  marginTop: '16px'
};

const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/[^\d]/g, '')
  
  const trimmed = numbers.slice(0, 11)
  
  if (trimmed.length >= 3) {
    if (trimmed.length >= 7) {
      return `${trimmed.slice(0, 3)}-${trimmed.slice(3, 7)}-${trimmed.slice(7)}`
    }
    return `${trimmed.slice(0, 3)}-${trimmed.slice(3)}`
  }
  return trimmed
}

export default function MyPage() {
  const { user, logout } = useAuth()
  const { theme } = useTheme() || { theme: 'light' }
  const [userInfo, setUserInfo] = useState<User | null>(null)
  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [tabValue, setTabValue] = useState(0)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editMode, setEditMode] = useState<'none' | 'password' | 'name' | 'phone' | 'birthdate'>('none')
  const [editValue, setEditValue] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const navigate = useNavigate()
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    title: string;
    onConfirm: () => void;
  }>({
    open: false,
    message: '',
    title: '',
    onConfirm: () => {}
  });
  const [passwordError, setPasswordError] = useState<string>('');
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await userApi.getMyInfo()
        setUserInfo(response.data)
      } catch (error) {
        setUserInfo(null)
      }
    }
    
    if (user) {
      fetchUserInfo()
    }
  }, [user])

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

  const handleEditClick = () => {
    setShowEditDialog(true)
  }

  const handleEditClose = () => {
    setShowEditDialog(false)
    setEditMode('none')
    setEditValue('')
    setCurrentPassword('')
    setNewPasswordConfirm('')
  }

  const handleEditModeSelect = (mode: 'password' | 'name' | 'phone' | 'birthdate') => {
    setEditMode(mode);
    setPasswordError('');
    if (mode === 'password') {
      setEditValue('');
    } else if (mode === 'name') {
      setEditValue(user?.name || '');
    } else if (mode === 'phone') {
      setEditValue(formatPhoneNumber(user?.phone || ''));
    } else if (mode === 'birthdate') {
      setEditValue(user?.birthdate || '');
    }
    setCurrentPassword('');
    setNewPasswordConfirm('');
  }

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) {
      return '비밀번호는 8자 이상이어야 합니다.';
    }
    if (!hasLowerCase || !hasNumber || !hasSpecialChar) {
      return '비밀번호는 소문자, 숫자, 특수문자를 모두 포함해야 합니다.';
    }
    return '';
  };

  const handleEditSubmit = async () => {
    if (editMode === 'password') {
      setErrors({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      if (!currentPassword) {
        setErrors(prev => ({ ...prev, currentPassword: '기존 비밀번호를 입력해주세요.' }));
        return;
      }

      const passwordError = validatePassword(editValue);
      if (passwordError) {
        setErrors(prev => ({ ...prev, newPassword: passwordError }));
        return;
      }

      if (!newPasswordConfirm) {
        setErrors(prev => ({ ...prev, confirmPassword: '새 비밀번호 확인을 입력해주세요.' }));
        return;
      }

      if (editValue !== newPasswordConfirm) {
        setErrors(prev => ({ ...prev, confirmPassword: '새 비밀번호가 일치하지 않습니다.' }));
        return;
      }

      if (currentPassword === editValue) {
        setErrors(prev => ({ ...prev, newPassword: '새 비밀번호는 기존 비밀번호와 같을 수 없습니다.' }));
        return;
      }

      try {
        await userApi.updatePassword({
          currentPassword,
          newPassword: editValue
        });
        setAlert({
          open: true,
          title: '비밀번호 변경 완료',
          message: '비밀번호가 성공적으로 변경되었습니다.\n다시 로그인해주세요.',
          onConfirm: () => {
            handleEditClose();
            logout();
            navigate('/login');
          }
        });
        handleEditClose();
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 1500);
      } catch (error: any) {
        if (error.response?.status === 400) {
          setErrors(prev => ({ ...prev, currentPassword: error.response.data.message }));
        } else {
          setErrors(prev => ({ ...prev, currentPassword: '비밀번호 변경에 실패했습니다.' }));
        }
      }
    } else {
      try {
        const updateData = {
          name: editMode === 'name' ? editValue : userInfo?.name || '',
          phone: editMode === 'phone' ? editValue : userInfo?.phone || '',
          birthdate: editMode === 'birthdate' ? editValue : userInfo?.birthdate || ''
        };
        
        const response = await userApi.updateProfile(updateData);
        setUserInfo(response.data);
        setAlert({
          open: true,
          title: '회원정보 수정 완료',
          message: '회원정보가 성공적으로 수정되었습니다.\n다시 로그인해주세요.',
          onConfirm: () => {
            handleEditClose();
            logout();
            navigate('/login');
          }
        });
        handleEditClose();
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 1500);
      } catch {
        setErrors(prev => ({ ...prev, currentPassword: '처리 중 오류가 발생했습니다.' }));
      }
    }
  };

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

  const handleDeleteAccount = async () => {
    try {
      await userApi.deleteAccount();
      setAlert({
        open: true,
        title: '회원 탈퇴 완료',
        message: '회원 탈퇴가 완료되었습니다.\n이용해 주셔서 감사합니다.',
        onConfirm: () => {
          logout();
          navigate('/');
        }
      });
    } catch (error) {
      setAlert({
        open: true,
        title: '오류',
        message: '회원 탈퇴 처리 중 오류가 발생했습니다.',
        onConfirm: () => setAlert(prev => ({ ...prev, open: false }))
      });
    }
  };

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
              elevation={1}
              sx={{ 
                width: { xs: '100%', md: '30%' },
                bgcolor: 'background.paper',
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
                  <Tooltip title="정보수정">
                    <IconButton 
                      onClick={handleEditClick}
                      sx={{ 
                        border: 1, 
                        borderColor: 'divider',
                        '&:hover': {
                          color: 'hsl(var(--destructive))',
                          borderColor: 'hsl(var(--destructive))'
                        }
                      }}
                    >
                      <UserCog size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="회원탈퇴">
                    <IconButton 
                      onClick={() => setShowDeleteDialog(true)}
                      sx={{ 
                        border: 1, 
                        borderColor: 'divider',
                        '&:hover': {
                          color: 'hsl(var(--destructive))',
                          borderColor: 'hsl(var(--destructive))'
                        }
                      }}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="로그아웃">
                    <IconButton 
                      onClick={handleLogoutClick}
                      sx={{ 
                        border: 1, 
                        borderColor: 'divider',
                        '&:hover': {
                          color: 'hsl(var(--destructive))',
                          borderColor: 'hsl(var(--destructive))'
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
      <Dialog
        open={showEditDialog}
        onClose={handleEditClose}
        PaperProps={{
          sx: {
            bgcolor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            minWidth: { xs: '90%', sm: '500px' }
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'hsl(var(--foreground))',
          p: 2.5
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UserCog size={20} />
            회원정보 수정
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {editMode === 'none' ? (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box 
                  onClick={() => handleEditModeSelect('password')}
                  sx={{ 
                    p: 2, 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'hsl(var(--accent))' }
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>비밀번호</Typography>
                  <Typography variant="body2" color="text.secondary">********</Typography>
                </Box>
                <Box 
                  onClick={() => handleEditModeSelect('name')}
                  sx={{ 
                    p: 2, 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'hsl(var(--accent))' }
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>이름</Typography>
                  <Typography variant="body2" color="text.secondary">{user?.name}</Typography>
                </Box>
                <Box 
                  onClick={() => handleEditModeSelect('phone')}
                  sx={{ 
                    p: 2, 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'hsl(var(--accent))' }
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>전화번호</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userInfo?.phone || '등록된 전화번호가 없습니다'}
                  </Typography>
                </Box>
                <Box 
                  onClick={() => handleEditModeSelect('birthdate')}
                  sx={{ 
                    p: 2, 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'hsl(var(--accent))' }
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>생년월일</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userInfo?.birthdate || '등록된 생년월일이 없습니다'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  onClick={handleEditClose}
                  variant="contained"
                  sx={{ 
                    bgcolor: theme === 'dark' ? 'white' : 'black',
                    color: theme === 'dark' ? 'black' : 'white',
                    '&:hover': {
                      bgcolor: theme === 'dark' ? '#e5e7eb' : 'rgba(0, 0, 0, 0.8)'
                    }
                  }}
                >
                  닫기
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {editMode === 'password' && (
                <>
                  <TextField
                    label="기존 비밀번호"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    fullWidth
                    error={!!errors.currentPassword}
                    helperText={errors.currentPassword}
                    sx={textFieldSx}
                  />
                  <TextField
                    label="새 비밀번호"
                    type="password"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    fullWidth
                    error={!!errors.newPassword}
                    helperText={errors.newPassword}
                    sx={textFieldSx}
                  />
                  <TextField
                    label="새 비밀번호 확인"
                    type="password"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    fullWidth
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    sx={textFieldSx}
                  />
                </>
              )}
              {editMode === 'name' && (
                <TextField
                  label="이름"
                  value={editValue || user?.name || ''}
                  onChange={(e) => setEditValue(e.target.value)}
                  fullWidth
                  sx={textFieldSx}
                />
              )}
              {editMode === 'phone' && (
                <TextField
                  label="전화번호"
                  value={editValue}
                  onChange={(e) => setEditValue(formatPhoneNumber(e.target.value))}
                  fullWidth
                  placeholder="01012345678"
                  inputProps={{
                    maxLength: 13
                  }}
                  sx={textFieldSx}
                />
              )}
              {editMode === 'birthdate' && (
                <TextField
                  label="생년월일"
                  type="date"
                  value={editValue || user?.birthdate || ''}
                  onChange={(e) => setEditValue(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    ...textFieldSx,
                    '& input': {
                      color: 'hsl(var(--foreground))',
                      '&::-webkit-calendar-picker-indicator': {
                        filter: theme === 'dark' ? 'invert(1)' : 'none'
                      }
                    }
                  }}
                />
              )}
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  onClick={() => setEditMode('none')}
                  variant="outlined"
                  sx={{ 
                    color: 'hsl(var(--foreground))',
                    borderColor: 'hsl(var(--border))',
                    '&:hover': {
                      borderColor: 'hsl(var(--border))',
                      bgcolor: 'hsl(var(--accent))'
                    }
                  }}
                >
                  취소
                </Button>
                <Button
                  onClick={handleEditSubmit}
                  variant="contained"
                  sx={{ 
                    bgcolor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    '&:hover': {
                      bgcolor: 'hsl(var(--primary) / 0.9)'
                    }
                  }}
                >
                  수정
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={alert.open}
        onClose={() => setAlert({ ...alert, open: false })}
        PaperProps={{
          sx: {
            bgcolor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            minWidth: { xs: '300px', sm: '400px' }
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'hsl(var(--foreground))',
          p: 2.5,
          pb: 1
        }}>
          {alert.title}
        </DialogTitle>
        <DialogContent sx={{ 
          color: 'hsl(var(--foreground))',
          p: 2.5,
          pt: 1
        }}>
          <Typography>
            {alert.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            onClick={alert.onConfirm}
            variant="contained"
            sx={{ 
              bgcolor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              '&:hover': {
                bgcolor: 'hsl(var(--primary) / 0.9)'
              }
            }}
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            minWidth: { xs: '300px', sm: '400px' }
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'hsl(var(--foreground))',
          p: 2.5,
          pb: 1
        }}>
          회원 탈퇴
        </DialogTitle>
        <DialogContent sx={{ 
          color: 'hsl(var(--foreground))',
          p: 2.5,
          pt: 1
        }}>
          <Typography>
            회원 탈퇴 시 모든 학습 기록과 할 일 목록이 삭제되며, 이 작업은 되돌릴 수 없습니다.
            정말 탈퇴하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
          <Button
            onClick={() => setShowDeleteDialog(false)}
            variant="outlined"
            sx={{ 
              color: 'hsl(var(--foreground))',
              borderColor: 'hsl(var(--border))',
              '&:hover': {
                borderColor: 'hsl(var(--border))',
                bgcolor: 'hsl(var(--accent))'
              }
            }}
          >
            취소
          </Button>
          <Button
            onClick={handleDeleteAccount}
            variant="contained"
            sx={{ 
              bgcolor: '#ef4444',
              color: 'white',
              '&:hover': { 
                bgcolor: '#dc2626'
              }
            }}
          >
            탈퇴
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

