"use client"

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  TextField, Button, Card, CardContent, CardHeader, 
  Typography, Box, ToggleButtonGroup, ToggleButton,
  Tooltip, IconButton
} from '@mui/material'
import MDEditor from '@uiw/react-md-editor'
import { Eye, EyeOff } from 'lucide-react'
import { studyRecordApi } from '../../../services/api'
import { useTheme } from '../../../hooks/useTheme'
import { MarkdownRenderer } from '../../../components/markdown/MarkdownRenderer'

type EditorMode = 'basic' | 'markdown'

export default function NewStudyRecord() {
  const { theme } = useTheme()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [editorMode, setEditorMode] = useState<EditorMode>('basic')
  const [showPreview, setShowPreview] = useState(true)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세���.')
      return
    }

    setLoading(true)
    try {
      const newRecord = {
        title: title.trim(),
        content: content.trim(),
        editorMode,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        references: [],
        isPublic: true,
        user: { id: 1, email: '', username: '' }
      }
      
      await studyRecordApi.create(newRecord)
      
      navigate('/')
    } catch (error) {
      console.error('학습 기록 생성 실패:', error)
      alert('학습 기록 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const renderEditor = () => {
    switch (editorMode) {
      case 'basic':
        return (
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
                  bgcolor: 'hsl(var(--background))',
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
        )
      case 'markdown':
        return (
          <Box sx={{ flex: 1 }}>
            <div 
              data-color-mode={theme === 'dark' ? 'dark' : 'light'} 
              style={{ 
                display: 'flex'
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
                  border: '1px solid hsl(var(--border))',
                  height: '400px',
                  overflow: 'auto'
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

  const renderPreview = () => {
    if (!showPreview || editorMode === 'markdown') return null;
    
    return (
      <Box sx={{ flex: '0 0 50%' }}>
        <div 
          className="prose dark:prose-invert h-[400px] overflow-y-auto"
          style={{
            backgroundColor: 'hsl(var(--background))',
            borderLeft: '1px solid hsl(var(--border))',
            padding: '16px'
          }}
        >
          <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
        </div>
      </Box>
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
              새 학습 기록 작성
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
                {editorMode === 'basic' && renderPreview()}
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

