"use client"

import { useState, useEffect, useRef } from 'react'
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
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
  const [showPreview, setShowPreview] = useState<Record<string, boolean>>({
    basic: false,
    markdown: true
  })

  const { showDialog, handleCancel, handleConfirm, message } = usePrompt(
    '수정된 내용이 있습니다. 저장하지 않고 나가시겠습니까?',
    isModified
  )

  const quillRef = useRef<ReactQuill>(null);

  useEffect(() => {
    const fetchStudyRecord = async () => {
      try {
        if (!id) {
          navigate('/')
          return
        }
        setLoading(true)
        const response = await studyRecordApi.getById(Number(id))

        if (!response || !response.data) {
          alert('학습 기록을 찾을 수 없습니다.')
          navigate('/')
          return
        }

        setFormData({
          title: response.data.title,
          content: response.data.content,
          tags: response.data.tags?.join(', ') || '',
          editorMode: response.data.editorMode || 'basic',
          isPublic: response.data.isPublic ?? true
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
        alert('학습 기록 수정에 실패했습니다.')
        setIsModified(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTextFieldChange = (value: string) => {
    setFormData({ ...formData, content: value })
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

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'blockquote', 'code-block',
    'align',
    'link'
  ];

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
  }, [formData.editorMode]);

  const renderEditor = () => {
    switch (formData.editorMode) {
      case 'basic':
        return (
          <Box sx={{ display: 'flex', width: '100%' }}>
            <Box sx={{ 
              flex: showPreview[formData.editorMode] ? '0 0 50%' : '1 1 100%',
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
                value={formData.content}
                onChange={handleTextFieldChange}
                modules={modules}
                formats={formats}
                placeholder="내용을 입력하세요..."
                preserveWhitespace
              />
            </Box>
            {showPreview[formData.editorMode] && (
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
                    marginBottom: '1em'
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
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                  style={{ color: 'hsl(var(--foreground))' }}
                />
              </Box>
            )}
          </Box>
        );
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
                  width: showPreview.markdown ? '50%' : '100%',
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
              {showPreview.markdown && (
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
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!formData.title && !loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <p>학습 기록을 찾을 수 없습니다.</p>
        </div>
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
                <Tooltip title={showPreview.basic ? "프리뷰 숨기기" : "프리뷰 보기"}>
                  <IconButton 
                    onClick={() => setShowPreview({ ...showPreview, basic: !showPreview.basic })}
                    sx={{ 
                      color: 'hsl(var(--muted-foreground))',
                      '&:hover': {
                        color: 'hsl(var(--foreground))'
                      }
                    }}
                  >
                    {showPreview.basic ? <EyeOff size={20} /> : <Eye size={20} />}
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