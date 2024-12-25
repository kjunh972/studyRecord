"use client"

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { StudyRecord } from '../../../types'
import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardHeader, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { studyRecordApi } from '../../../services/api'

export default function StudyRecordPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState<StudyRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    const fetchStudyRecord = async () => {
      try {
        if (!id) return
        const response = await studyRecordApi.getById(Number(id))
        setRecord(response.data)
      } catch (error) {
        console.error('학습 기록 로딩 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudyRecord()
  }, [id])

  const handleDelete = async () => {
    try {
      if (!id) return
      await studyRecordApi.delete(Number(id))
      navigate('/')
    } catch (error) {
      console.error('학습 기록 삭제 실패:', error)
    }
  }

  if (loading || !record) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader
          title={<Typography variant="h4">{record.title}</Typography>}
          action={
            <IconButton onClick={() => setOpenDialog(true)} color="error">
              <DeleteIcon />
            </IconButton>
          }
          subheader={
            <>
              <Typography variant="body2" color="text.secondary">
                작성일: {new Date(record.createdAt).toLocaleDateString()}
              </Typography>
              <div className="flex flex-wrap gap-2 mt-2">
                {record.tags.map((tag) => (
                  <span key={tag} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </>
          }
        />
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{record.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>학습 기록 삭제</DialogTitle>
        <DialogContent>
          <Typography>이 학습 기록을 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

