import { Routes, Route } from 'react-router-dom';
import HomePage from './app/page';
import NewStudyRecordPage from './app/study/new/newStudy';
import StudyRecordDetailPage from './app/study/id/studyRecord';
import RootLayout from './app/layout';

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/study/new" element={<NewStudyRecordPage />} />
        <Route path="/study/:id" element={<StudyRecordDetailPage />} />
      </Route>
    </Routes>
  );
} 