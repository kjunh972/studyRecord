import { Routes, Route } from 'react-router-dom'
import NewStudy from './new/newStudy'
import StudyRecord from './id/studyRecord'
import EditStudyRecord from './edit/id/editStudy'

export default function StudyRoutes() {
  return (
    <Routes>
      <Route path="new" element={<NewStudy />} />
      <Route path="edit/:id" element={<EditStudyRecord />} />
      <Route path=":id" element={<StudyRecord />} />
    </Routes>
  )
} 