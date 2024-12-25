import { useState } from 'react'
import { Todo } from '../types'
import { format } from 'date-fns'
import { Button, TextField, Checkbox, FormControlLabel } from '@mui/material'
import { todoApi } from '../services/api'

interface TodoListProps {
  todos: Todo[]
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
}

export default function TodoList({ todos, setTodos }: TodoListProps) {
  const [newTodo, setNewTodo] = useState('')
  const [dueDate, setDueDate] = useState('')

  const addTodo = async () => {
    if (newTodo.trim() !== '' && dueDate) {
      try {
        const newTodoItem = {
          task: newTodo,
          completed: false,
          dueDate: dueDate,
          period: 'DAILY' as const,
          user: { id: 1, email: '', username: '' }
        }
        const response = await todoApi.create(newTodoItem)
        setTodos(prev => [...prev, response.data])
        setNewTodo('')
        setDueDate('')
      } catch (error) {
        console.error('Todo 생성 실패:', error)
      }
    }
  }

  const toggleTodo = async (id: number) => {
    try {
      const todo = todos.find(t => t.id === id)
      if (todo) {
        await todoApi.update(id, { completed: !todo.completed })
        setTodos(prev => prev.map(t => 
          t.id === id ? { ...t, completed: !t.completed } : t
        ))
      }
    } catch (error) {
      console.error('Todo 상태 변경 실패:', error)
    }
  }

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); addTodo(); }}>
        <div>
          <TextField
            label="New Task"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            type="date"
            label="Due Date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </div>
        <Button variant="contained" type="submit">Add Task</Button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
              }
              label={todo.task}
            />
            <span>{format(new Date(todo.dueDate), 'yyyy-MM-dd')}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

