import { Routes, Route } from 'react-router-dom'
import NewStudy from './new/newStudy'
import StudyRecord from './id/studyRecord'

export default function StudyRoutes() {
  return (
    <Routes>
      <Route path="new" element={<NewStudy />} />
      <Route path=":id" element={<StudyRecord />} />
    </Routes>
  )
} 