import api from '../services/api'
import * as React from 'react'
import { User } from '../types'

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = React.createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post<{ token: string; user: User }>('/auth/login', { username, password })
      const { token, user } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      setIsAuthenticated(true)
      const redirectUrl = sessionStorage.getItem('redirectUrl')
      if (redirectUrl) {
        sessionStorage.removeItem('redirectUrl')
        window.location.href = redirectUrl
      }
      return true
    } catch (error) {
      setIsAuthenticated(false)
      throw error
    }
  }

  const logout = (): void => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    window.location.href = '/login'
  }

  const value = React.useMemo(
    () => ({
      user,
      isAuthenticated,
      login,
      logout
    }),
    [user, isAuthenticated]
  )

  return React.createElement(AuthContext.Provider, { value }, children)
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 