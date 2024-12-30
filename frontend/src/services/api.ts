import axios from 'axios'
import { StudyRecord, Todo, TodoRequest } from '../types'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
})

// 요청 인터셉터 수정
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`  // 헤더 형식 수정
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// 응답 인터셉터 수정
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response)  // 에러 로깅 추가
    if (error.response?.status === 403 || error.response?.status === 401) {
      localStorage.removeItem('token')  // 토큰 제거
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const studyRecordApi = {
  getAll: () => api.get<StudyRecord[]>('/study-records'),
  getById: (id: number) => api.get<StudyRecord>(`/study-records/${id}`),
  create: async (data: Omit<StudyRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('API call data:', data)
    const response = await api.post<StudyRecord>('/study-records', data)
    console.log('API response:', response.data)
    return response
  },
  update: (id: number, record: Partial<StudyRecord>) => 
    api.put<StudyRecord>(`/study-records/${id}`, record),
  delete: (id: number) => api.delete(`/study-records/${id}`),
}

export const todoApi = {
  getAll: () => api.get<Todo[]>('/todos'),
  create: (todo: TodoRequest) => api.post<Todo>('/todos', todo),
  update: (id: number, todo: Partial<Todo>) => api.put<Todo>(`/todos/${id}`, todo),
  delete: (id: number) => api.delete(`/todos/${id}`),
}

export default api 