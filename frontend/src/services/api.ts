import axios from 'axios'
import { StudyRecord, Todo, TodoRequest } from '../types'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
})

// 토큰 만료 시간 확인
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

// 요청 인터셉터 수정
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && !isTokenExpired(token)) {
    config.headers['Authorization'] = `Bearer ${token}`
  } else if (token) {
    // 토큰이 만료되었으면 로그아웃 처리
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.setItem('redirectUrl', window.location.pathname)
    window.location.href = '/login'
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// 응답 인터셉터 수정
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 || error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.setItem('redirectUrl', window.location.pathname)
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      return Promise.reject(new Error('로그인이 필요합니다.'))
    }
    return Promise.reject(error)
  }
)

export const studyRecordApi = {
  getAll: () => api.get<StudyRecord[]>('/study-records'),
  getById: async (id: number) => {
    if (!id || isNaN(id)) {
      throw new Error('유효하지 않은 ID입니다.');
    }
    return api.get<StudyRecord>(`/study-records/${id}`)
  },
  create: async (data: Omit<StudyRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post<StudyRecord>('/study-records', data)
    return response
  },
  update: (id: number, record: Partial<StudyRecord>) => {
    if (!id || isNaN(id)) {
      throw new Error('유효하지 않은 ID입니다.');
    }
    return api.put<StudyRecord>(`/study-records/${id}`, record)
  },
  delete: (id: number) => {
    if (!id || isNaN(id)) {
      throw new Error('유효하지 않은 ID입니다.');
    }
    return api.delete(`/study-records/${id}`)
  }
}

export const todoApi = {
  getAll: () => api.get<Todo[]>('/todos'),
  create: (todo: TodoRequest) => api.post<Todo>('/todos', todo),
  update: (id: number, todo: Partial<Todo>) => api.put<Todo>(`/todos/${id}`, todo),
  delete: (id: number) => api.delete(`/todos/${id}`),
}

export default api 