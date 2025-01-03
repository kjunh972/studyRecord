import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './app/page';
import NewStudyRecordPage from './app/study/new/newStudy';
import StudyRecordDetailPage from './app/study/id/studyRecord';
import EditStudyRecord from './app/study/edit/id/editStudy';
import RootLayout from './app/layout';

// 라우터 설정
const router = createBrowserRouter([
  {
    path: "/",                    // 루트 경로
    element: <RootLayout />,      // 모든 페이지의 공통 레이아웃
    children: [                   // 중첩 라우트 설정
      {
        path: "/",                // 홈페이지
        element: <HomePage />
      },
      {
        path: "/study/new",       // 새 학습 기록 작성 페이지
        element: <NewStudyRecordPage />
      },
      {
        path: "/study/:id",       // 학습 기록 상세 페이지 (:id는 동적 파라미터)
        element: <StudyRecordDetailPage />
      },
      {
        path: "/study/edit/:id",  // 학습 기록 수정 페이지
        element: <EditStudyRecord />
      }
    ]
  }
])

// 앱의 메인 컴포넌트
export default function App() {
  return (
    <RouterProvider router={router} />  // 라우터 적용
  );
} 