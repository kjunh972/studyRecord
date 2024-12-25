import axios from 'axios'
import { StudyRecord, Todo } from '../types'

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
  create: (record: Omit<StudyRecord, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<StudyRecord>('/study-records', record),
  update: (id: number, record: Partial<StudyRecord>) => 
    api.put<StudyRecord>(`/study-records/${id}`, record),
  delete: (id: number) => api.delete(`/study-records/${id}`),
}

export const todoApi = {
  getAll: () => api.get<Todo[]>('/todos'),
  create: (todo: Omit<Todo, 'id'>) => api.post<Todo>('/todos', todo),
  update: (id: number, todo: Partial<Todo>) => api.put<Todo>(`/todos/${id}`, todo),
  delete: (id: number) => api.delete(`/todos/${id}`),
} 