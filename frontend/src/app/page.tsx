"use client"

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { StudyRecord, Todo } from '../types'
import TodoList from '../components/TodoList'
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material'
import { studyRecordApi, todoApi } from '../services/api'

export default function HomePage() {
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

  // 선택된 태그에 따라 레코드 필터링
  const filteredRecords = selectedTag
    ? studyRecords.filter(record => record.tags.includes(selectedTag))
    : studyRecords

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
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
            Recent Study Records
          </Typography>
          <Button
            component={Link}
            to="/study/new"
            variant="contained"
            sx={{
              backgroundColor: '#3B82F6',
              '&:hover': { backgroundColor: '#2563EB' },
              borderRadius: '0.5rem',
            }}
          >
            New Record
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecords.map((record) => (
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
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {record.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onClick={() => handleTagClick(tag)}
                      sx={{
                        bgcolor: selectedTag === tag 
                          ? 'hsl(var(--primary))' 
                          : 'hsl(var(--primary) / 0.1)',
                        color: selectedTag === tag 
                          ? 'hsl(var(--primary-foreground))' 
                          : 'hsl(var(--primary))',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: selectedTag === tag 
                            ? 'hsl(var(--primary) / 0.9)' 
                            : 'hsl(var(--primary) / 0.2)'
                        }
                      }}
                    />
                  ))}
                </Box>
                <Button
                  component={Link}
                  to={`/study/${record.id}`}
                  sx={{
                    color: '#3B82F6',
                    '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
                    width: '100%',
                    textAlign: 'center',
                  }}
                >
                  Read more
                </Button>
              </CardContent>
            </Card>
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

