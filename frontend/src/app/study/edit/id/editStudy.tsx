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
import { usePrompt } from '../../../../hooks/usePrompt'
import { NavigationPrompt } from '../../../../components/NavigationPrompt'

type EditorMode = 'basic' | 'markdown'

export default function EditStudyRecord() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { theme = 'light' } = useTheme() || {}
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    editorMode: 'basic' as EditorMode,
    isPublic: true
  })
  const [isModified, setIsModified] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(true)

  const { showDialog, handleCancel, handleConfirm, message } = usePrompt(
    '수정된 내용이 있습니다. 저장하지 않고 나가시겠습니까?',
    isModified
  )

  useEffect(() => {
    const fetchStudyRecord = async () => {
      try {
        if (!id) {
          navigate('/')
          return
        }
        const response = await studyRecordApi.getById(Number(id))
        setFormData({
          title: response.data.title,
          content: response.data.content,
          tags: response.data.tags.join(', '),
          editorMode: response.data.editorMode,
          isPublic: response.data.isPublic
        })
        setIsModified(false)
      } catch (error: any) {
        if (error.response?.status === 403 || error.response?.status === 401) {
          navigate('/login')
        } else {
          alert('학습 기록을 불러오는데 실패했습니다.')
          navigate('/')
        }
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchStudyRecord()
    }
  }, [id, navigate])

  useEffect(() => {
    const handleBeforeUnload = (e: Event) => {
      if (isModified) {
        e.preventDefault()
        return ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isModified])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    setLoading(true)
    setIsModified(false)
    try {
      await studyRecordApi.update(Number(id), {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      })
      navigate(`/study/${id}`, { replace: true })
    } catch (error: any) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        navigate('/login')
      } else {
        console.error('학습 기록 수정 실패:', error)
        alert('학습 기록 수정에 실패했습니다.')
        setIsModified(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, content: e.target.value })
    setIsModified(true)
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFormData({ ...formData, content: value })
      setIsModified(true)
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, title: e.target.value })
    setIsModified(true)
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, tags: e.target.value })
    setIsModified(true)
  }

  const renderEditor = () => {
    switch (formData.editorMode) {
      case 'basic':
        return (
          <Box sx={{ display: 'flex', width: '100%' }}>
            <Box sx={{ flex: showPreview ? '0 0 50%' : '1 1 100%' }}>
              <TextField
                multiline
                rows={17}
                fullWidth
                value={formData.content}
                onChange={handleTextFieldChange}
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
                  <div style={{ whiteSpace: 'pre-wrap' }}>{formData.content}</div>
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
                value={formData.content}
                onChange={handleEditorChange}
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
                    <MarkdownRenderer content={formData.content} />
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
              value={formData.title}
              onChange={handleTitleChange}
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
                  value={formData.editorMode}
                  exclusive
                  onChange={(_, newMode) => newMode && setFormData({ ...formData, editorMode: newMode })}
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
              value={formData.tags}
              onChange={handleTagsChange}
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
      <NavigationPrompt
        open={showDialog}
        message={message}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </div>
  )
} 