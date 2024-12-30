import { Routes, Route } from 'react-router-dom'
import HomePage from './page'
import LoginPage from './user/login'
import SignupPage from './user/signup'
import MyPage from './user/myPage'
import StudyRoutes from './study/StudyRoutes'
import { PrivateRoute } from '@/components/PrivateRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/study/*" element={<StudyRoutes />} />
      <Route
        path="/mypage"
        element={
          <PrivateRoute>
            <MyPage />
          </PrivateRoute>
        }
      />
    </Routes>
  )
} 