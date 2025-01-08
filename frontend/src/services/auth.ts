import api from './api'
import { SignUpRequest, LoginRequest, AuthResponse } from '../types/auth'

export const authService = {
  async signup(data: SignUpRequest): Promise<void> {
    await api.post('/auth/signup', data)
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token')
  }
} 