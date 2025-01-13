import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { StudyRecord, Todo } from '../types'
import TodoList from '../components/TodoList'
import { Card, CardContent, Typography, Button, Box, Chip, Alert } from '@mui/material'
import { studyRecordApi, todoApi } from '../services/api'
import { useTheme } from '../hooks/useTheme'
import { FileX, PlusCircle, LogIn, ChevronDown, ChevronUp, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';  // 한국어 로케일

export default function HomePage() {
  const { theme } = useTheme()
  const { isAuthenticated } = useAuth()
  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [showAllRecords, setShowAllRecords] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studyResponse, todoResponse] = await Promise.all([
          studyRecordApi.getAll(),
          todoApi.getAll()
        ])
        setStudyRecords(studyResponse.data)
        setTodos(todoResponse.data)
      } finally {
        setLoading(false)
      }
    }
    if (isAuthenticated) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  // 데이터 가져오기
  const fetchTodos = async () => {
    try {
      const response = await todoApi.getAll();
      setTodos(response.data);
    } catch (error) {
      setErrorMessage('할 일 목록을 불러오는 중 오류가 발생했습니다.');
    }
  };

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    if (isAuthenticated) {
      fetchTodos();
    }
  }, [isAuthenticated]);

  // 날짜별로 레코드 그룹화하는 함수 수정
  const groupRecordsByDate = (records: StudyRecord[], showAll = false) => {
    if (!showAll) {
      // 오늘 날짜 기준으로 5일 전까지만 필터링
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      fiveDaysAgo.setHours(0, 0, 0, 0);

      // 5일 이내의 레코드만 필터링
      records = records.filter(record => {
        const recordDate = new Date(record.createdAt);
        return recordDate >= fiveDaysAgo;
      });
    }

    const groups = records.reduce((acc, record) => {
      const date = new Date(record.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    }, {} as Record<string, StudyRecord[]>);
    
    return Object.entries(groups)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  };

  // 선택된 태그에 따라 레코드 필터링
  const filteredRecords = selectedTag
    ? studyRecords.filter(record => record.tags.includes(selectedTag))
    : studyRecords;

  // 5일치와 전 레코드를 각각 그룹화
  const recentGroupedRecords = groupRecordsByDate(filteredRecords);
  const allGroupedRecords = groupRecordsByDate(filteredRecords, true);

  // 선택된 날짜의 데이터를 필터링하는 함수들 추가
  const getFilteredRecordsByDate = (date: Date | null) => {
    if (!date) return [];
    
    // 선택된 날짜의 시작과 끝 설정
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return studyRecords.filter(record => {
      const recordDate = new Date(record.createdAt);
      return recordDate >= startOfDay && recordDate <= endOfDay;
    });
  };

  const getFilteredTodosByDate = (date: Date | null) => {
    if (!date) return [];
    
    // 선택된 날짜의 시작과 끝 설정
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return todos.filter(todo => {
      if (!todo.dueDate) return false;
      const todoDueDate = new Date(todo.dueDate);
      // 시간대를 고려하여 날짜 비교
      return todoDueDate >= startOfDay && todoDueDate <= endOfDay;
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <section>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: 'hsl(var(--foreground))',
          mb: 4 
        }}>
          STUDY CALENDAR
        </Typography>
        <Card sx={{ 
          bgcolor: 'hsl(var(--background))',
          borderRadius: '12px',
          border: '1px solid hsl(var(--border))',
          mb: 8,
          overflow: 'hidden',
          boxShadow: 'none',
          pb: 6,
          display: 'flex'
        }}>
          <Box sx={{ 
            width: '300px',
            borderRight: '1px solid hsl(var(--border))',
            p: 3,
            maxHeight: '600px',  
            overflow: 'auto',    
            '&::-webkit-scrollbar': {  
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'hsl(var(--muted-foreground) / 0.2)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'hsl(var(--muted-foreground) / 0.3)',
            }
          }}>
            {selectedDate && (
              <>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  color: 'hsl(var(--foreground))',
                  pb: 2,
                  borderBottom: '1px solid hsl(var(--border))'
                }}>
                  {selectedDate.toLocaleDateString()}
                </Typography>
                
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle2" sx={{ 
                    color: 'hsl(var(--foreground))',
                    mb: 2,
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}>
                    학습 기록
                  </Typography>
                  {getFilteredRecordsByDate(selectedDate).length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {getFilteredRecordsByDate(selectedDate).map(record => (
                        <Link 
                          key={record.id} 
                          to={`/study/${record.id}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <Box
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              color: 'hsl(var(--foreground))'
                            }}
                          >
                            <Box sx={{ 
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              bgcolor: '#3B82F6'
                            }} />
                            {record.title}
                          </Box>
                        </Link>
                      ))}
                    </Box>
                  ) : (
                    <Typography sx={{ 
                      color: 'hsl(var(--muted-foreground))',
                      fontSize: '0.875rem'
                    }}>
                      학습 기록이 없습니다.
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ 
                    color: 'hsl(var(--foreground))',
                    mb: 2,
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}>
                    할 일
                  </Typography>
                  {getFilteredTodosByDate(selectedDate).length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {getFilteredTodosByDate(selectedDate).map(todo => {
                        const isOverdue = !todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date();
                        
                        return (
                          <Box
                            key={todo.id} 
                            component="div"
                            onClick={() => {
                              const todoSection = document.getElementById('todo-section');
                              if (todoSection) {
                                todoSection.scrollIntoView({ behavior: 'smooth' });
                                // 약간의 지연 후 탭 변경
                                setTimeout(() => {
                                  // TodoList 컴포넌트의 탭 상태를 변경하는 이벤트 발생
                                  const event = new CustomEvent('switchTab', { 
                                    detail: { tab: todo.completed ? 1 : 0 } 
                                  });
                                  window.dispatchEvent(event);
                                }, 500);
                              }
                            }}
                            sx={{ 
                              color: 'hsl(var(--foreground))',
                              fontSize: '0.92rem',
                              p: 1,
                              borderRadius: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.5,
                              position: 'relative',
                              textDecoration: todo.completed ? 'line-through' : 'none',
                              opacity: todo.completed ? 0.7 : 1,
                              border: isOverdue ? '1px solid #EF4444' : 'none',
                              bgcolor: isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: 'hsl(var(--accent))',
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ 
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                bgcolor: todo.completed ? '#94A3B8' : '#EF4444'
                              }} />
                              <Box
                                sx={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  color: 'hsl(var(--foreground))'
                                }}
                              >
                                {todo.title}
                              </Box>
                            </Box>
                            {(todo.startDate || todo.startTime || todo.endTime) && (
                              <Box sx={{ 
                                pl: 2,
                                fontSize: '0.75rem',
                                color: 'hsl(var(--muted-foreground))'
                              }}>
                                {todo.startDate && (
                                  <span>
                                    {new Date(todo.startDate).toLocaleDateString('ko-KR', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit'
                                    }).replace(/\. /g, '/')}
                                    {todo.startTime && ` ${todo.startTime.slice(0, 5)}`}
                                  </span>
                                )}
                                {(todo.startDate || todo.startTime) && todo.endTime && (
                                  <span> ~ </span>
                                )}
                                {todo.dueDate && todo.endTime && (
                                  <span>
                                    {todo.dueDate !== todo.startDate ? 
                                      new Date(todo.dueDate).toLocaleDateString('ko-KR', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit'
                                      }).replace(/\. /g, '/') + ' ' : ''
                                    }
                                    {todo.endTime.slice(0, 5)}
                                  </span>
                                )}
                              </Box>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography sx={{ 
                      color: 'hsl(var(--muted-foreground))',
                      fontSize: '0.875rem'
                    }}>
                      할 일이 없습니다.
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Box>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              gap: 3,
              borderBottom: '1px solid hsl(var(--border))',
              color: 'hsl(var(--muted-foreground))',
              fontSize: '0.875rem'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  bgcolor: '#3B82F6' 
                }} />
                <span>학습 기록</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  bgcolor: '#EF4444' 
                }} />
                <span>할 일 마감일</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  bgcolor: '#94A3B8'  // 회색으로 변경
                }} />
                <span>완료된 할 일</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: '24px', 
                  height: '24px', 
                  border: '2px solid #EF4444',
                  borderRadius: '4px',
                  opacity: 0.5
                }} />
                <span>기한 지난 할 일</span>
              </Box>
            </Box>
            <CardContent sx={{ p: '0 !important' }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                <DateCalendar 
                  value={selectedDate}
                  onChange={(newDate) => {
                    if (newDate) {
                      const date = new Date(newDate);
                      date.setHours(12, 0, 0, 0);
                      setSelectedDate(date);
                    }
                  }}
                  slots={{
                    day: (props) => {
                      const date = props.day;
                      // 해당 날짜의 시작과 끝 설정
                      const startOfDay = new Date(date);
                      startOfDay.setHours(0, 0, 0, 0);
                      const endOfDay = new Date(date);
                      endOfDay.setHours(23, 59, 59, 999);

                      // 학습 기록 확인
                      const hasRecord = studyRecords.some(record => {
                        const recordDate = new Date(record.createdAt);
                        return recordDate >= startOfDay && recordDate <= endOfDay;
                      });

                      // 할 일 마감일 확인
                      const hasTodo = todos.some(todo => {
                        if (!todo.dueDate) return false;
                        const todoDueDate = new Date(todo.dueDate);
                        const startOfDay = new Date(date);
                        startOfDay.setHours(0, 0, 0, 0);
                        const endOfDay = new Date(date);
                        endOfDay.setHours(23, 59, 59, 999);
                        return todoDueDate >= startOfDay && todoDueDate <= endOfDay;
                      });

                      // 기한이 지난 미완료 할 일 확인
                      const hasOverdueTodo = todos.some(todo => {
                        if (!todo.dueDate || todo.completed) return false;
                        const todoDueDate = new Date(todo.dueDate);
                        const today = new Date();
                        const dateToCheck = new Date(date);
                        
                        // 시간을 00:00:00으로 설정하여 날짜만 비교
                        todoDueDate.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);
                        dateToCheck.setHours(0, 0, 0, 0);
                        
                        // 해당 날짜가 마감일이고, 오늘보다 이전인 경우
                        return todoDueDate.getTime() === dateToCheck.getTime() && 
                               todoDueDate.getTime() < today.getTime();
                      });

                      const isToday = props.day.toDateString() === new Date().toDateString();
                      
                      return (
                        <Box
                          component="button"
                          onClick={(e) => {
                            e.preventDefault();  // 기본 이벤트 방지
                            if (props.onClick) {
                              props.onClick(e);  // 기존 onClick 호출
                            }
                            // 직접 날짜 설정
                            const date = new Date(props.day);
                            date.setHours(12, 0, 0, 0);
                            setSelectedDate(date);
                          }}
                          sx={{
                            position: 'relative',
                            width: '48px',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            border: isToday ? '2px solid #3B82F6' : 'none',
                            padding: 0,
                            background: 'none',
                            borderRadius: '8px',
                            backgroundColor: props.selected ? '#3B82F6' : 'transparent',
                            color: props.selected ? 'white' : 'hsl(var(--foreground))',
                            opacity: props.outsideCurrentMonth ? 0.5 : 1,
                            fontWeight: isToday ? 600 : 400,
                            '&:hover': {
                              backgroundColor: props.selected ? '#2563EB' : 'rgba(59, 130, 246, 0.1)',
                            },
                            // 기한이 지난 날짜 표시 (테두리)
                            ...(hasOverdueTodo && {
                              border: '2px solid #EF4444',
                              opacity: 0.8
                            }),
                            // 학습 기록 표시 (파란 점)
                            '&::after': hasRecord ? {
                              content: '""',
                              position: 'absolute',
                              bottom: 4,
                              left: hasTodo ? '40%' : '50%',
                              transform: 'translateX(-50%)',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              bgcolor: props.selected ? 'white' : '#3B82F6',
                              zIndex: 1
                            } : {},
                            // 할 일 마감일 표시 (빨간 점)
                            '&::before': hasTodo ? {
                              content: '""',
                              position: 'absolute',
                              bottom: 4,
                              left: hasRecord ? '60%' : '50%',
                              transform: 'translateX(-50%)',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              bgcolor: props.selected 
                                ? 'white' 
                                : (todos.filter(todo => {
                                    if (!todo.dueDate) return false;
                                    const todoDueDate = new Date(todo.dueDate);
                                    const dateToCheck = new Date(date);
                                    todoDueDate.setHours(0, 0, 0, 0);
                                    dateToCheck.setHours(0, 0, 0, 0);
                                    return todoDueDate.getTime() === dateToCheck.getTime();
                                  }).every(todo => todo.completed)  // 해당 날짜의 모든 할 일이 완료되었는지 확인
                                    ? '#94A3B8'  // 모든 할 일이 완료됨 -> 회색
                                    : '#EF4444'  // 미완료된 할 일이 있음 -> 빨간색
                                ),
                              zIndex: 1
                            } : {}
                          }}
                        >
                          {props.day.getDate()}
                        </Box>
                      );
                    }
                  }}
                  sx={{
                    width: '100%',
                    p: 2,
                    pb: 6,
                    overflow: 'hidden',
                    '& .MuiPickersCalendarHeader-root': {
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      overflow: 'hidden'
                    },
                    '& .MuiDayCalendar-monthContainer': {
                      overflow: 'hidden'
                    },
                    '& .MuiDayCalendar-slideTransition': {
                      overflow: 'hidden'
                    },
                    '& .MuiDayCalendar-weekDayLabel': {
                      color: 'hsl(var(--muted-foreground))',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      width: '48px',
                      height: '48px',
                      margin: '4px 0'
                    },
                    '& .MuiPickersCalendarHeader-label': {
                      color: 'hsl(var(--foreground))',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none'
                    },
                    '& .MuiPickersCalendarHeader-switchViewButton': {
                      display: 'none'
                    },
                    '& .MuiPickersArrowSwitcher-button': {
                      color: 'hsl(var(--foreground))',
                      '&:hover': {
                        bgcolor: 'rgba(59, 130, 246, 0.1)'
                      }
                    },
                    '& .MuiDayCalendar-header': {
                      borderBottom: 'none',
                      marginBottom: '8px'
                    }
                  }}
                />
              </LocalizationProvider>
            </CardContent>
          </Box>
        </Card>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'hsl(var(--foreground))' }}>
            RECENT STUDY RECORDS
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {isAuthenticated && (
              <>
                <Button
                  onClick={() => document.getElementById('todo-section')?.scrollIntoView({ behavior: 'smooth' })}
                  variant="outlined"
                  startIcon={<ArrowDownCircle size={18} />}
                  sx={{ 
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                    bgcolor: 'hsl(var(--background))',
                    display: 'flex',
                    alignItems: 'center',
                    height: 40,
                    minWidth: 160,
                    px: 2,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    '&:hover': {
                      borderColor: 'hsl(var(--primary))',
                      bgcolor: 'hsl(var(--primary) / 0.1)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Todo List
                  </Box>
                </Button>
                <Button
                  component={Link}
                  to="/study/new"
                  startIcon={<PlusCircle size={18} />}
                  sx={{ 
                    bgcolor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    height: 40,
                    minWidth: 160,
                    px: 2,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    '&:hover': {
                      bgcolor: 'hsl(var(--primary) / 0.9)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  New Record
                </Button>
              </>
            )}
          </Box>
        </div>
        {!isAuthenticated ? (
          <Card sx={{ 
            bgcolor: 'hsl(var(--background))', 
            borderRadius: 'var(--radius)',
            border: '1px solid hsl(var(--border))'
          }}>
            <CardContent sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              py: 8
            }}>
              <LogIn size={48} strokeWidth={1.5} color="hsl(var(--muted-foreground))" />
              <Typography sx={{ 
                mt: 2, 
                mb: 1,
                color: 'hsl(var(--muted-foreground))'
              }}>
                로그인하여 학습 기록을 시작하세요
              </Typography>
              <Typography sx={{ 
                mb: 2,
                color: 'hsl(var(--muted-foreground))'
              }}>
                로그인 후 학습 기록과 할 일 목록을 관리할 수 있습니다.
              </Typography>
              <Button
                component={Link}
                to="/login"
                variant="outlined"
                startIcon={<LogIn size={18} />}
                sx={{ 
                  mt: 2,
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                  '&:hover': {
                    borderColor: 'hsl(var(--primary))',
                    bgcolor: 'hsl(var(--primary) / 0.1)'
                  }
                }}
              >
                로그인하기
              </Button>
            </CardContent>
          </Card>
        ) : studyRecords.length === 0 ? (
          <Card sx={{ 
            bgcolor: 'hsl(var(--background))', 
            borderRadius: 'var(--radius)',
            border: '1px solid hsl(var(--border))'
          }}>
            <CardContent sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              py: 8
            }}>
              <FileX size={48} strokeWidth={1.5} color="hsl(var(--muted-foreground))" />
              <Typography sx={{ mt: 2, mb: 1, color: 'hsl(var(--muted-foreground))' }}>
                아직 작성된 학습 기록이 없습니다
              </Typography>
              <Button
                component={Link}
                to="/study/new"
                variant="outlined"
                startIcon={<PlusCircle size={18} />}
                sx={{ mt: 2 }}
              >
                새 학습 기록 작성하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div>
              {(showAllRecords ? allGroupedRecords : recentGroupedRecords).map(([date, records]) => (
                <div key={date} className="mb-12">
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: theme === 'dark' ? '#FFFFFF' : '#000000',
                      mb: 3,
                      pb: 1,
                      borderBottom: '1px solid hsl(var(--border))'
                    }}
                  >
                    {date}
                  </Typography>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {records.map((record) => (
                      <Card 
                        key={record.id} 
                        className="card-hover"
                        sx={{ 
                          bgcolor: 'hsl(var(--card))',
                          color: 'hsl(var(--card-foreground))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                          maxWidth: '100%'
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            mb: 1, 
                            color: 'hsl(var(--foreground))',
                            fontSize: '1.2rem'
                          }}>
                            {record.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))', mb: 2 }}>
                            {new Date(record.createdAt).toLocaleDateString()}
                          </Typography>
                          <Box sx={{ minHeight: '32px', mb: 2 }}>
                            {record.tags.length > 0 && (
                              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {record.tags.map((tag, index) => (
                                  <Chip
                                    key={index}
                                    label={`#${tag}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTag(selectedTag === tag ? null : tag);
                                    }}
                                    sx={{ 
                                      bgcolor: selectedTag === tag ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
                                      color: selectedTag === tag ? 'hsl(var(--primary-foreground))' : 'hsl(var(--secondary-foreground))',
                                      borderRadius: 'var(--radius)',
                                      height: '24px',
                                      fontSize: '0.875rem',
                                      cursor: 'pointer',
                                      '&:hover': {
                                        bgcolor: selectedTag === tag 
                                          ? 'hsl(var(--primary) / 0.9)'
                                          : 'hsl(var(--secondary) / 0.9)'
                                      }
                                    }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button
                              component={Link}
                              to={`/study/${record.id}`}
                              sx={{
                                color: '#3B82F6',
                                width: '100%',
                                textAlign: 'center',
                                '&:hover': { 
                                  backgroundColor: 'rgba(59, 130, 246, 0.1)'
                                }
                              }}
                            >
                              READ MORE
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {allGroupedRecords.length > recentGroupedRecords.length && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 4 }}>
                <Button
                  onClick={() => setShowAllRecords(!showAllRecords)}
                  variant="outlined"
                  size="small"
                  endIcon={showAllRecords ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  sx={{
                    borderColor: '#3B82F6',
                    color: '#3B82F6',
                    '&:hover': { 
                      borderColor: '#3B82F6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)'
                    }
                  }}
                >
                  {showAllRecords ? '최근 기록만 보기' : `이전 기록 보기 (${allGroupedRecords.length - recentGroupedRecords.length}일)`}
                </Button>
              </Box>
            )}
          </>
        )}
      </section>

      <section id="todo-section">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'hsl(var(--foreground))' }}>
            To-Do List
          </Typography>
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            variant="outlined"
            startIcon={<ArrowUpCircle size={18} />}
            sx={{ 
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))',
              bgcolor: 'hsl(var(--background))',
              display: 'flex',
              alignItems: 'center',
              height: 40,
              minWidth: 160,
              px: 2,
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              '&:hover': {
                borderColor: 'hsl(var(--primary))',
                bgcolor: 'hsl(var(--primary) / 0.1)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }
            }}
          >
            Study Records
          </Button>
        </Box>
        {!isAuthenticated ? (
          <Card sx={{ 
            bgcolor: 'hsl(var(--background))', 
            borderRadius: 'var(--radius)',
            border: '1px solid hsl(var(--border))'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                로그인 후 할 일 목록을 관리할 수 있습니다.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ 
            bgcolor: 'hsl(var(--background))', 
            borderRadius: 'var(--radius)',
            border: '1px solid hsl(var(--border))',
            p: 3 
          }}>
            <TodoList todos={todos} setTodos={setTodos} />
          </Card>
        )}
      </section>
      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      )}
    </div>
  )
}

