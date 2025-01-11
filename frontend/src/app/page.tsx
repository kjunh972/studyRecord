"use client"

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { StudyRecord, Todo } from '../types'
import TodoList from '../components/TodoList'
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material'
import { studyRecordApi, todoApi } from '../services/api'
import { useTheme } from '../hooks/useTheme'
import { FileX, PlusCircle, LogIn, ChevronDown, ChevronUp, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function HomePage() {
  const { theme } = useTheme()
  const { isAuthenticated } = useAuth()
  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [showAllRecords, setShowAllRecords] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
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
                            {record.tags.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {record.tags.map((tag) => (
                                  <Chip
                                    key={tag}
                                    label={`#${tag}`}
                                    onClick={() => handleTagClick(tag)}
                                    sx={{
                                      bgcolor: selectedTag === tag ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.1)',
                                      color: selectedTag === tag ? '#ffffff' : 'hsl(var(--primary))',
                                      border: '1px solid hsl(var(--primary) / 0.2)',
                                      cursor: 'pointer',
                                      '&:hover': { transform: 'scale(1.05)' },
                                      transition: 'all 0.2s'
                                    }}
                                  />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{ color: 'hsl(var(--muted-foreground))' }}>
                                태그 없음
                              </Typography>
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
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                    '&:hover': {
                      borderColor: 'hsl(var(--border))',
                      bgcolor: 'hsl(var(--accent))'
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
    </div>
  )
}

