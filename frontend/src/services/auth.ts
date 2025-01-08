import { LoginRequest, AuthResponse, SignUpRequest } from '../types/auth'
import api from './api'

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    return response.data
  },
  
  async signup(data: SignUpRequest): Promise<void> {
    await api.post('/auth/signup', data)
  }
}