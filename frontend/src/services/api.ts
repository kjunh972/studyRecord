import axios from 'axios'
import { StudyRecord, Todo, TodoRequest } from '../types'

const API_URL = 'http://localhost:8057/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
})

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