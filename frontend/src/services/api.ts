import axios from 'axios'
import { StudyRecord, Todo, TodoRequest } from '../types'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  withCredentials: true
})

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized 에러 처리
    if (error.response?.status === 401) {
      // 로컬 스토리지의 토큰 제거
      localStorage.removeItem('token')
      // ��재 페이지가 로그인 페이지가 아닐 경우에만 리다이렉트
      if (!window.location.pathname.includes('/login')) {
        // 강제 새로고침으로 상태 초기화 및 리다이렉트
        window.location.replace('/login')
      }
    }
    return Promise.reject(error)
  }
);

export const studyRecordApi = {
  getAll: () => api.get<StudyRecord[]>('/study-records'),
  getById: async (id: number) => {
    if (!id || isNaN(id)) {
      throw new Error('유효하지 않은 ID입니다.');
    }
    try {
      const url = `/study-records/${id}`;
      const response = await api.get<StudyRecord>(url);
      if (!response.data) {
        throw new Error('데이터가 없습니다.');
      }
      return response;
    } catch (error) {
      throw error;
    }
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

export const userApi = {
  getMyInfo: () => api.get('/users/me'),
  updatePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.patch('/users/password', data),
  updateProfile: (data: { name: string; phone: string; birthdate: string }) =>
    api.patch('/users/profile', data),
  deleteAccount: () => api.delete('/users/me')
}

export default api 