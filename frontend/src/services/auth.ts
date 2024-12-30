import axiosInstance from './axios'
import { SignUpRequest, LoginRequest, AuthResponse } from '../types/auth'

export const authService = {
  async signup(data: SignUpRequest): Promise<void> {
    await axiosInstance.post('/auth/signup', data)
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data)
    localStorage.setItem('token', response.data.token)
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
  }
} 