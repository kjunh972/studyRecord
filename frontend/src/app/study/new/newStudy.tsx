"use client"

import { useState, useEffect, useRef } from 'react'
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
import { usePrompt } from '../../../hooks/usePrompt'
import { NavigationPrompt } from '../../../components/NavigationPrompt'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

type EditorMode = 'basic' | 'markdown'

export default function NewStudyRecord() {
  const { theme = 'light' } = useTheme() || {}
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [isModified, setIsModified] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editorMode, setEditorMode] = useState<EditorMode>('basic')
  const [showPreview, setShowPreview] = useState<Record<string, boolean>>({
    basic: false,
    markdown: true
  })
  const navigate = useNavigate()
  const quillRef = useRef<ReactQuill>(null);

  const { showDialog, handleCancel, handleConfirm, message } = usePrompt(
    '작성중인 내용이 있습니다. 저장하지 않고 나가시겠습니까?',
    isModified
  )

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    setIsModified(true)
  }

  const handleContentChange = (value: string) => {
    setContent(value)
    setIsModified(true)
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value)
    setIsModified(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.')
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
        user: { id: 1, email: '', username: '', name: '', phone: '', birthdate: '' }
      }
      
      setIsModified(false)
      await studyRecordApi.create(newRecord)
      navigate('/')
    } catch (error) {
      console.error('학습 기록 생성 실패:', error)
      alert('학습 기록 생성에 실패했습니다.')
      setIsModified(true)
    } finally {
      setLoading(false)
    }
  }

  const renderEditor = () => {
    switch (editorMode) {
      case 'basic':
        return (
          <Box sx={{ display: 'flex', width: '100%' }}>
            <Box sx={{ 
              flex: showPreview[editorMode] ? '1 1 50%' : '1 1 100%',
              height: '400px',
              '& .ql-container': {
                height: 'calc(400px - 42px)',
                bgcolor: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: 'none'
              },
              '& .ql-toolbar': {
                bgcolor: 'hsl(var(--accent))',
                borderBottom: '1px solid hsl(var(--border))',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                '& button, & .ql-picker-label, & .ql-picker-item': {
                  position: 'relative',
                  '&[title]:hover::before': {
                    content: 'attr(title)',
                    position: 'absolute',
                    top: '-24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '4px 8px',
                    backgroundColor: 'hsl(var(--popover))',
                    color: 'hsl(var(--popover-foreground))',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    zIndex: 1000
                  }
                },
                '& .ql-picker': {
                  color: 'hsl(var(--foreground))',
                  '& .ql-picker-label': {
                    color: 'hsl(var(--foreground))',
                    '&:hover': {
                      color: 'hsl(var(--primary))'
                    },
                    '& .ql-stroke': {
                      stroke: 'currentColor'
                    }
                  },
                  '& .ql-picker-options': {
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    '& .ql-picker-item': {
                      color: 'hsl(var(--foreground))',
                      '&:hover': {
                        color: 'hsl(var(--primary))',
                        backgroundColor: 'hsl(var(--accent))'
                      }
                    }
                  }
                },
                '& .ql-stroke': {
                  stroke: 'hsl(var(--foreground))'
                },
                '& .ql-fill': {
                  fill: 'hsl(var(--foreground))'
                },
                '& button:hover .ql-stroke': {
                  stroke: 'hsl(var(--primary))'
                },
                '& button:hover .ql-fill': {
                  fill: 'hsl(var(--primary))'
                }
              },
              '& .ql-editor': {
                height: '100%',
                color: 'hsl(var(--foreground))'
              }
            }}>
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={handleContentChange}
                modules={modules}
                formats={formats}
                placeholder="내용을 입력하세요..."
                preserveWhitespace
              />
            </Box>
            {showPreview[editorMode] && (
              <Box sx={{ 
                flex: '0 0 50%',
                height: '400px',
                overflow: 'auto',
                borderLeft: '1px solid hsl(var(--border))',
                bgcolor: theme === 'dark' ? '#000000' : '#ffffff',
                padding: '1rem',
                '& .ql-editor': {
                  padding: 0,
                  '& > *': { marginBottom: '1em' },
                  '& h1': { 
                    fontSize: '2em',
                    marginBottom: '0.5em',
                    fontWeight: 'bold'
                  },
                  '& h2': { 
                    fontSize: '1.5em',
                    marginBottom: '0.5em',
                    fontWeight: 'bold'
                  },
                  '& h3': { 
                    fontSize: '1.17em',
                    marginBottom: '0.5em',
                    fontWeight: 'bold'
                  },
                  '& pre.ql-syntax': {
                    backgroundColor: 'hsl(var(--accent))',
                    color: 'hsl(var(--accent-foreground))',
                    padding: '1em',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    marginBottom: '1em',
                    display: 'block'
                  },
                  '& a': {
                    color: '#0066cc',
                    textDecoration: 'underline',
                    '&:hover': {
                      color: '#0052a3'
                    }
                  },
                  '& ul, & ol': {
                    paddingLeft: '2em',
                    marginBottom: '1em'
                  },
                  '& li': {
                    marginBottom: '0.5em'
                  },
                  '& blockquote': {
                    borderLeft: '4px solid hsl(var(--border))',
                    paddingLeft: '1em',
                    marginLeft: '0',
                    marginBottom: '1em',
                    color: 'hsl(var(--muted-foreground))'
                  },
                  '& code': {
                    backgroundColor: 'hsl(var(--accent))',
                    padding: '0.2em 0.4em',
                    borderRadius: '3px',
                    fontFamily: 'monospace'
                  },
                  '& img': {
                    maxWidth: '100%',
                    height: 'auto'
                  },
                  '& *:last-child': {
                    marginBottom: 0
                  }
                }
              }}>
                <div 
                  className="ql-editor"
                  dangerouslySetInnerHTML={{ __html: content }}
                  style={{ color: 'hsl(var(--foreground))' }}
                />
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
                onChange={(value) => value !== undefined && handleContentChange(value)}
                height={400}
                visibleDragbar={false}
                preview="edit"
                extraCommands={[]}
                style={{
                  width: showPreview[editorMode] ? '50%' : '100%',
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
              {showPreview[editorMode] && (
                <Box sx={{ 
                  width: '50%',
                  border: '1px solid hsl(var(--border))',
                  height: '400px',
                  overflow: 'auto',
                  '& .markdown-body': {
                    minHeight: '400px',
                    padding: '1rem'
                  }
                }}>
                  <div data-color-mode={theme === 'dark' ? 'dark' : 'light'}>
                    <MarkdownRenderer content={content || ''} />
                  </div>
                </Box>
              )}
            </div>
          </Box>
        )
    }
  }

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'blockquote', 'code-block',
    'align',
    'link'
  ];

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered'}, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      [{ align: [] }],
      ['link'],
      ['clean']
    ]
  };

  useEffect(() => {
    const addTooltips = () => {
      const tooltips = {
        '.ql-picker.ql-header .ql-picker-label': '제목',
        '.ql-bold': '굵게',
        '.ql-italic': '기울임',
        '.ql-underline': '밑줄',
        '.ql-strike': '취소선',
        '.ql-picker.ql-color .ql-picker-label': '글자 색상',
        '.ql-picker.ql-background .ql-picker-label': '배경 색상',
        '.ql-list[value="ordered"]': '번호 목록',
        '.ql-list[value="bullet"]': '글머리 기호',
        '.ql-blockquote': '인용구',
        '.ql-code-block': '코드 블록',
        '.ql-picker.ql-align .ql-picker-label': '정렬',
        '.ql-link': '링크',
        '.ql-clean': '서식 지우기'
      };

      const headerOptions = {
        'h1': '제목 1',
        'h2': '제목 2',
        'h3': '제목 3',
        'p': '본문'
      };

      Object.entries(tooltips).forEach(([selector, title]) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            element.setAttribute('title', title);
          }
        });
      });

      Object.entries(headerOptions).forEach(([tag, title]) => {
        const option = document.querySelector(`.ql-picker-item[data-value="${tag}"]`);
        if (option instanceof HTMLElement) {
          option.setAttribute('title', title);
        }
      });
    };

    const timers = [100, 300, 500].map(delay => 
      setTimeout(addTooltips, delay)
    );

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [editorMode]);

  const toolbarTitles = {
    'header': '제목',
    'bold': '굵게',
    'italic': '기울임',
    'underline': '밑줄',
    'strike': '취소선',
    'color': '글자 색상',
    'background': '배경 색상',
    'list': '목록',
    'blockquote': '인용구',
    'code-block': '코드 블록',
    'align': '정렬',
    'link': '링크',
    'clean': '서식 지우기'
  };

  return (
    <div className="container mx-auto p-4" role="main">
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
              onChange={handleTitleChange}
              required
              aria-label="제목 입력"
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
                <Tooltip title={showPreview[editorMode] ? "프리뷰 숨기기" : "프리뷰 보기"}>
                  <IconButton 
                    onClick={() => setShowPreview({
                      ...showPreview,
                      [editorMode]: !showPreview[editorMode]
                    })}
                    sx={{ 
                      color: 'hsl(var(--muted-foreground))',
                      '&:hover': {
                        color: 'hsl(var(--foreground))'
                      }
                    }}
                  >
                    {showPreview[editorMode] ? <EyeOff size={20} /> : <Eye size={20} />}
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
              onChange={handleTagsChange}
              placeholder="예: Spring Boot, java, React, Typescript, web"
              aria-label="태그 입력"
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
        aria-modal="true"
      />
    </div>
  )
}