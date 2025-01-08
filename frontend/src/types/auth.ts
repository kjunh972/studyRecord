export interface SignUpRequest {
  username: string
  password: string
  name: string
  phone: string
  birthdate: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: number
    username: string
    name: string
    phone: string
    birthdate: string
  }
} 