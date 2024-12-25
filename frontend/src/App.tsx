import { Routes, Route } from 'react-router-dom';
import HomePage from './app/page';
import NewStudyRecordPage from './app/study/page';
import StudyRecordDetailPage from './app/new/id/page';
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