import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { AuthResponse } from '../types/auth'
import { userApi } from '../services/api'
import { authService } from '../services/auth'

interface AuthContextType {
  isAuthenticated: boolean
  user: AuthResponse['user'] | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const validateToken = useCallback(async () => {
    const token = localStorage.getItem('token')
    
    try {
      if (!token) {
        setUser(null)
        setIsAuthenticated(false)
        setLoading(false)
        if (!window.location.pathname.includes('/login')) {
          window.location.replace('/login')
        }
        return
      }

      const response = await userApi.getMyInfo()
      setUser(response.data)
      setIsAuthenticated(true)
      setLoading(false)
    } catch (error) {
      localStorage.removeItem('token')
      setUser(null)
      setIsAuthenticated(false)
      setLoading(false)
      if (!window.location.pathname.includes('/login')) {
        window.location.replace('/login')
      }
    }
  }, [])

  useEffect(() => {
    validateToken()
  }, [validateToken])

  const login = useCallback(async (username: string, password: string) => {
    try {
      setLoading(true)
      const response = await authService.login({ username, password });
      localStorage.setItem('token', response.token);
      
      const userResponse = await userApi.getMyInfo();
      setUser(userResponse.data);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false)
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
    window.location.replace('/login')
  }, [])

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 