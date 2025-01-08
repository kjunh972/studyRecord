"use client"

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { StudyRecord } from '../../../types'
import { 
  Card, CardContent, CardHeader, Typography, IconButton, 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box,
  Tooltip
} from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import { Trash2 } from 'lucide-react'
import { studyRecordApi } from '../../../services/api'
import { MarkdownRenderer } from '../../../components/markdown/MarkdownRenderer'

export default function StudyRecordPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState<StudyRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)

  const handleEditClick = () => {
    navigate(`/study/edit/${id}`)
  }

  useEffect(() => {
    const fetchStudyRecord = async () => {
      try {
        if (!id) return
        const response = await studyRecordApi.getById(Number(id))
        setRecord(response.data)
      } catch {
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetchStudyRecord()
  }, [id, navigate])

  const handleDelete = async () => {
    try {
      if (!id) return
      await studyRecordApi.delete(Number(id))
      navigate('/')
    } catch (error) {
    }
  }

  const renderContent = () => {
    if (!record) return null;
    
    if (record.editorMode === 'markdown') {
      return <MarkdownRenderer content={record.content} />
    } else {
      return (
        <div style={{ 
          whiteSpace: 'pre-wrap',
          padding: '1rem',
          lineHeight: '1.7'
        }}>
          {record.content}
        </div>
      )
    }
  }

  if (loading || !record) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="card-hover" sx={{ 
        bgcolor: 'hsl(var(--card))',
        color: 'hsl(var(--card-foreground))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '12px'
      }}>
        <CardHeader
          title={
            <Typography variant="h4" sx={{ 
              color: 'hsl(var(--foreground))',
              fontWeight: 600,
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}>
              {record.title}
            </Typography>
          }
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="수정">
                <IconButton 
                  onClick={handleEditClick}
                  sx={{ 
                    color: 'hsl(var(--muted-foreground))',
                    '&:hover': {
                      color: 'hsl(var(--primary))'
                    }
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="삭제">
                <IconButton onClick={() => setOpenDialog(true)} sx={{ 
                  color: '#ff6b6b',
                  '&:hover': {
                    bgcolor: 'rgba(255, 107, 107, 0.1)'
                  }
                }}>
                  <Trash2 />
                </IconButton>
              </Tooltip>
            </Box>
          }
          subheader={
            <>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'hsl(var(--muted-foreground))',
                  marginTop: 1
                }}
              >
                작성일: {new Date(record.createdAt).toLocaleDateString()}
              </Typography>
              {record.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {record.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-3 py-1 rounded-full text-sm transition-all hover:scale-105"
                      style={{
                        backgroundColor: 'hsl(var(--primary) / 0.1)',
                        color: 'hsl(var(--primary))',
                        border: '1px solid hsl(var(--primary) / 0.2)'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          }
        />
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            {renderContent()}
          </div>
        </CardContent>
      </Card>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
            padding: '1rem'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'hsl(var(--foreground))',
          fontSize: '1.5rem',
          fontWeight: 600
        }}>
          학습 기록 삭제
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'hsl(var(--foreground))' }}>
            이 학습 기록을 삭제하시겠습니까?
            <br />
            삭제된 기록은 복구할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '1rem' }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            sx={{ 
              color: 'hsl(var(--muted-foreground))',
              borderColor: 'hsl(var(--border))',
              '&:hover': {
                borderColor: 'hsl(var(--muted-foreground))',
                backgroundColor: 'hsl(var(--muted) / 0.1)'
              }
            }}
          >
            취소
          </Button>
          <Button 
            onClick={handleDelete}
            variant="contained"
            sx={{ 
              bgcolor: '#fa5252',
              color: 'hsl(var(--destructive-foreground))',
              '&:hover': { 
                bgcolor: '#ff6b6b'
              }
            }}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
