import { 
  createBrowserRouter, 
  RouterProvider
} from 'react-router-dom';
import RootLayout from './app/layout';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import StudyRoutes from './app/study/StudyRoutes';
import HomePage from './app/page';
import LoginPage from './app/user/login';
import SignUpPage from './app/user/signup';
import TermsOfServicePage from './app/user/terms';
import PrivacyPolicyPage from './app/user/privacy';
import MyPage from './app/user/myPage';

// 앱의 메인 컴포넌트
export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={createBrowserRouter([
        {
          path: "/",
          element: <RootLayout />,
          children: [
            { index: true, element: <HomePage /> },
            { path: "login", element: <LoginPage /> },
            { path: "signup", element: <SignUpPage /> },
            { path: "terms", element: <TermsOfServicePage /> },
            { path: "privacy", element: <PrivacyPolicyPage /> },
            { 
              path: "mypage", 
              element: (
                <ProtectedRoute>
                  <MyPage />
                </ProtectedRoute>
              )
            },
            {
              path: "study/*",
              element: (
                <ProtectedRoute>
                  <StudyRoutes />
                </ProtectedRoute>
              )
            }
          ]
        }
      ])} />
    </AuthProvider>
  );
} 