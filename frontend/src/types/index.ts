export interface User {
  id: number;
  email: string;
  username: string;
}

export interface StudyRecord {
  id: number;
  title: string;
  content: string;
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
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  completed: boolean;
  user: User;
} 