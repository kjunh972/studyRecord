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
  task: string;
  dueDate: string;
  period: TodoPeriod;
  completed: boolean;
}

export type TodoRequest = Omit<Todo, 'id' | 'user'>;

export type TodoPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY'; 