export interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  phone: string | null;
  birthdate: string | null;
}

export interface StudyRecord {
  id: number;
  title: string;
  content: string;
  editorMode: 'basic' | 'markdown';
  tags: string[];
  references: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
}

export interface Todo {
  id: number;
  title: string;
  dueDate: string | null;
  startDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  period?: TodoPeriod;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  location?: string | null;
  tags: string[];
}

export interface TodoRequest {
  title: string;
  dueDate?: string | null;
  startDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  tags?: string[];
}

export type TodoPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY'; 