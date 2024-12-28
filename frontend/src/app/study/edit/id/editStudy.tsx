"use client"

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  TextField, Button, Card, CardContent, CardHeader, 
  Typography, Box, ToggleButtonGroup, ToggleButton,
  Tooltip, IconButton
} from '@mui/material'
import MDEditor from '@uiw/react-md-editor'
import { Eye, EyeOff } from 'lucide-react'
import { studyRecordApi } from '../../../../services/api'
import { useTheme } from '../../../../hooks/useTheme'
import { MarkdownRenderer } from '../../../../components/markdown/MarkdownRenderer'

type EditorMode = 'basic' | 'markdown'

export default function EditStudyRecord() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { theme = 'light' } = useTheme() || {}
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(true)
  const [editorMode, setEditorMode] = useState<EditorMode>('basic')
  const [showPreview, setShowPreview] = useState(true)

  useEffect(() => {
    const fetchStudyRecord = async () => {
      try {
        if (!id) return
        const response = await studyRecordApi.getById(Number(id))
        const record = response.data
        setTitle(record.title)
        setContent(record.content)
        setTags(record.tags.join(', '))
        setEditorMode(record.editorMode)
        setLoading(false)
      } catch (error) {
        console.error('학습 기록 로딩 실패:', error)
        navigate('/')
      }
    }
    fetchStudyRecord()
  }, [id, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const updatedRecord = {
        title: title.trim(),
        content: content.trim(),
        editorMode,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        references: [],
        isPublic: true
      }
      
      await studyRecordApi.update(Number(id), updatedRecord)
      navigate(`/study/${id}`)
    } catch (error) {
      console.error('학습 기록 수정 실패:', error)
      alert('학습 기록 수정에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const renderEditor = () => {
    switch (editorMode) {
      case 'basic':
        return (
          <Box sx={{ display: 'flex', width: '100%' }}>
            <Box sx={{ flex: '0 0 50%' }}>
              <TextField
                multiline
                rows={17}
                fullWidth
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요..."
                sx={{
                  height: '400px',
                  '& .MuiOutlinedInput-root': {
                    height: '100%',
                    bgcolor: theme === 'dark' ? '#000000' : '#ffffff',
                    '& fieldset': {
                      borderColor: 'transparent',
                      borderRadius: 0
                    },
                    '& textarea': {
                      height: '100% !important',
                      color: 'hsl(var(--foreground))'
                    }
                  }
                }}
              />
            </Box>
            {showPreview && (
              <Box sx={{ 
                flex: '0 0 50%',
                height: '400px',
                overflow: 'auto',
                borderLeft: '1px solid hsl(var(--border))',
                bgcolor: theme === 'dark' ? '#000000' : '#ffffff'
              }}>
                <div style={{ 
                  padding: '1rem',
                  color: theme === 'dark' ? 'hsl(var(--foreground))' : '#000000'
                }}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
                </div>
              </Box>
            )}
          </Box>
        )
      case 'markdown':
        return (
          <Box sx={{ flex: 1 }}>
            <div 
              data-color-mode={theme === 'dark' ? 'dark' : 'light'} 
              style={{ 
                display: 'flex',
                height: '400px'
              }}
            >
              <MDEditor
                value={content}
                onChange={(value) => setContent(value || '')}
                height={400}
                visibleDragbar={false}
                preview="edit"
                extraCommands={[]}
                style={{
                  width: showPreview ? '50%' : '100%',
                  backgroundColor: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))'
                }}
                textareaProps={{
                  style: {
                    color: theme === 'dark' ? 'hsl(var(--foreground))' : '#000000',
                    caretColor: theme === 'dark' ? 'hsl(var(--foreground))' : '#000000'
                  }
                }}
                className="custom-markdown-editor-dark"
              />
              {showPreview && (
                <Box sx={{ 
                  width: '50%',
                  borderLeft: '1px solid hsl(var(--border))',
                  height: '400px',
                  overflow: 'auto',
                  minHeight: '400px',
                  '& .markdown-body': {
                    minHeight: '400px'
                  }
                }}>
                  <div data-color-mode={theme === 'dark' ? 'dark' : 'light'}>
                    <MarkdownRenderer content={content} />
                  </div>
                </Box>
              )}
            </div>
          </Box>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Card sx={{ 
        bgcolor: 'hsl(var(--card))',
        color: 'hsl(var(--card-foreground))',
        border: '1px solid hsl(var(--border))'
      }}>
        <CardHeader 
          title={
            <Typography variant="h4" sx={{ color: 'hsl(var(--foreground))' }}>
              학습 기록 수정
            </Typography>
          } 
        />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
              fullWidth
              label="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
            <Box>
              <Box sx={{ 
                mb: 2, 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <ToggleButtonGroup
                  value={editorMode}
                  exclusive
                  onChange={(_, newMode) => newMode && setEditorMode(newMode)}
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      color: 'hsl(var(--muted-foreground))',
                      borderColor: 'hsl(var(--border))',
                      '&.Mui-selected': {
                        color: 'hsl(var(--primary))',
                        backgroundColor: 'hsl(var(--primary) / 0.1)'
                      }
                    }
                  }}
                >
                  <ToggleButton value="basic">기본</ToggleButton>
                  <ToggleButton value="markdown">마크다운</ToggleButton>
                </ToggleButtonGroup>
                <Tooltip title={showPreview ? "프리뷰 숨기기" : "프리뷰 보기"}>
                  <IconButton 
                    onClick={() => setShowPreview(!showPreview)}
                    sx={{ 
                      color: 'hsl(var(--muted-foreground))',
                      '&:hover': {
                        color: 'hsl(var(--foreground))'
                      }
                    }}
                  >
                    {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '4px'
              }}>
                {renderEditor()}
              </Box>
            </Box>
            <TextField
              fullWidth
              label="태그 (쉼표로 구분)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="예: Spring Boot, java, React, Typescript, web"
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
              type="submit"
              disabled={loading}
              sx={{ 
                bgcolor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                '&:hover': {
                  bgcolor: 'hsl(var(--primary) / 0.9)'
                }
              }}
            >
              {loading ? '저장 중...' : '저장'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 