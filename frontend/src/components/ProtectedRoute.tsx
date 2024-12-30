import type { ReactNode, ReactElement } from 'react';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }: { children: ReactNode }): ReactElement => {
  const isAuthenticated = !!localStorage.getItem('token'); // 토큰 존재 여부로 인증 확인

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}; 