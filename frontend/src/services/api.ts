import axios from 'axios'
import { StudyRecord, Todo, TodoRequest } from '../types'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
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
  response => response,
  error => {
    // URL에서 /api 접두사 제거
    const path = error.config.url?.replace('/api', '') || '';
    
    // 로그인 실패는 조용히 처리
    if (path === '/auth/login') {
      return Promise.reject(error);
    }
    
    // 401 에러 처리
    if (error.response?.status === 401 && path !== '/auth/login') {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.replace('/login');
      }
    }
    
    // 비밀번호 변경 엔드포인트에 대한 400 에러는 조용히 처리
    if (error.config.url === '/api/users/password' && error.response?.status === 400) {
      return Promise.reject(error);
    }
    
    // 다른 에러는 콘솔에 표시
    console.error('API Error:', error);
    return Promise.reject(error);
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