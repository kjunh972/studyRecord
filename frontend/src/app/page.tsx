"use client"

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { StudyRecord, Todo } from '../types'
import TodoList from '../components/TodoList'
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material'
import { studyRecordApi, todoApi } from '../services/api'
import { useTheme } from '../hooks/useTheme'

export default function HomePage() {
  const { theme } = useTheme()
  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordsRes, todosRes] = await Promise.all([
          studyRecordApi.getAll(),
          todoApi.getAll()
        ])
        setStudyRecords(recordsRes.data)
        setTodos(todosRes.data)
      } catch (error) {
        console.error('데이터 로딩 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // 날짜별로 레코드 그룹화하는 함수
  const groupRecordsByDate = (records: StudyRecord[]) => {
    const groups = records.reduce((acc, record) => {
      const date = new Date(record.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    }, {} as Record<string, StudyRecord[]>);
    
    // 날짜 기준 내림차순 정렬
    return Object.entries(groups).sort((a, b) => 
      new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  };

  // 선택된 태그에 따라 레코드 필터링
  const filteredRecords = selectedTag
    ? studyRecords.filter(record => record.tags.includes(selectedTag))
    : studyRecords

  const groupedRecords = groupRecordsByDate(filteredRecords);

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="space-y-16">
      <section>
        <div className="flex justify-between items-center mb-6">
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            color: theme === 'dark' ? '#FFFFFF' : '#000000' 
          }}>
            Recent Study Records
          </Typography>
          <Button
            component={Link}
            to="/study/new"
            variant="contained"
            sx={{
              bgcolor: 'white',
              color: '#000000',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)'
              }
            }}
          >
            NEW RECORD
          </Button>
        </div>
        <div className="space-y-8">
          {groupedRecords.map(([date, records]) => (
            <div key={date}>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {records.map((record) => (
                  <Card 
                    key={record.id} 
                    className="card-hover"
                    sx={{ 
                      bgcolor: 'hsl(var(--card))',
                      color: 'hsl(var(--card-foreground))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'hsl(var(--foreground))' }}>
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
      </section>

      <section>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: 'hsl(var(--foreground))' }}>
          To-Do List
        </Typography>
        <Card sx={{ 
          bgcolor: 'hsl(var(--background))', 
          borderRadius: 'var(--radius)',
          border: '1px solid hsl(var(--border))',
          p: 3 
        }}>
          <TodoList todos={todos} setTodos={setTodos} />
        </Card>
      </section>
    </div>
  )
}

