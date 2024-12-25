"use client"

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextField, Button, Card, CardContent, CardHeader, Typography, IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import MDEditor from '@uiw/react-md-editor'
import { studyRecordApi } from '../../services/api'

export default function NewStudyRecordPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newRecord = {
        title,
        content,
        tags: tags.split(',').map((tag) => tag.trim()),
        references: [],
        isPublic: true,
        user: { id: 1, email: '', username: '' }
      }
      await studyRecordApi.create(newRecord)
      navigate('/')
    } catch (error) {
      console.error('스터디 레코드 생성 실패:', error)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader title={<Typography variant="h4">새 학습 기록 작성</Typography>} />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              margin="normal"
            />
            <div className="my-4">
              <Typography variant="subtitle1" gutterBottom>내용</Typography>
              <MDEditor
                value={content}
                onChange={(value) => setContent(value || '')}
                preview="edit"
              />
            </div>
            <TextField
              fullWidth
              label="태그 (쉼표로 구분)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              margin="normal"
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              저장
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

