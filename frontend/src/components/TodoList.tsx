import { useState } from 'react'
import { Todo, TodoPeriod } from '../types'
import { format } from 'date-fns'
import { 
  Button, TextField, Checkbox, Box, Typography, Tabs, Tab, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Collapse 
} from '@mui/material'
import { todoApi } from '../services/api'
import DeleteIcon from '@mui/icons-material/Delete'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

interface TodoListProps {
  todos: Todo[]
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
}

export default function TodoList({ todos, setTodos }: TodoListProps) {
  const [newTodo, setNewTodo] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [selectedTab, setSelectedTab] = useState(0)
  const [dateError, setDateError] = useState(false)
  const [todoToDelete, setTodoToDelete] = useState<number | null>(null)
  const [expandedDates, setExpandedDates] = useState<{ [key: string]: boolean }>({});

  const addTodo = () => {
    if (!dueDate) {
      setDateError(true)
      return
    }
    if (newTodo.trim() && dueDate) {
      setDateError(false)
      const todo = {
        id: Date.now(),
        task: newTodo.trim(),
        dueDate: `${dueDate}T00:00:00`,
        completed: false,
        period: 'DAILY' as TodoPeriod,
        user: { id: 1, email: '', username: '' }
      }
      setTodos([...todos, todo])
      setNewTodo('')
      setDueDate('')
      setSelectedTab(0)
    }
  }

  const toggleTodo = async (id: number) => {
    const todo = todos.find(t => t.id === id)
    if (todo) {
      const updatedTodo = {
        ...todo,
        completed: !todo.completed,
        dueDate: `${todo.dueDate.split('T')[0]}T00:00:00`
      }
      try {
        await todoApi.update(id, updatedTodo)
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
      } catch (error) {
        console.error('Failed to update todo:', error)
      }
    }
  }

  const filteredTodos = todos.filter(todo => 
    selectedTab === 0 ? !todo.completed : todo.completed
  );

  const completedCount = todos.filter(todo => todo.completed).length

  const handleDeleteClick = (id: number) => {
    setTodoToDelete(id)
  }

  const handleDeleteConfirm = async () => {
    if (todoToDelete) {
      try {
        await todoApi.delete(todoToDelete)
        setTodos(todos.filter(t => t.id !== todoToDelete))
      } catch (error) {
        console.error('Failed to delete todo:', error)
      }
      setTodoToDelete(null)
    }
  }

  const groupTodosByDate = (todos: Todo[]) => {
    return todos.reduce((groups: { [key: string]: Todo[] }, todo) => {
      const date = todo.dueDate.split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(todo);
      return groups;
    }, {});
  };

  const groupedTodos = groupTodosByDate(filteredTodos);

  const toggleDateExpand = (date: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  return (
    <div>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            placeholder="Enter a new task"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            required
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#1A1A1A',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: '#333'
                }
              }
            }}
          />
          <TextField
            type="date"
            value={dueDate}
            onChange={(e) => {
              setDateError(false)
              setDueDate(e.target.value)
            }}
            required
            error={dateError}
            helperText={dateError ? "날짜를 선택해주세요" : ""}
            sx={{
              width: '200px',
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#1A1A1A',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: dateError ? 'error.main' : '#333'
                }
              }
            }}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
        <Button 
          onClick={addTodo}
          variant="contained" 
          sx={{ 
            bgcolor: 'white', 
            color: 'black',
            '&:hover': {
              bgcolor: '#E5E5E5'
            },
            borderRadius: '20px',
            textTransform: 'none',
            mt: 1
          }}
        >
          Add Task
        </Button>
      </Box>

      <Tabs 
        value={selectedTab} 
        onChange={(_, newValue) => setSelectedTab(newValue)}
        sx={{ 
          mb: 2,
          '& .MuiTabs-indicator': {
            backgroundColor: '#3B82F6'
          }
        }}
      >
        <Tab 
          label="진행중" 
          sx={{ 
            color: selectedTab === 0 ? '#3B82F6' : '#666',
            '&.Mui-selected': {
              color: '#3B82F6'
            }
          }}
        />
        <Tab 
          label={`완료됨 (${completedCount})`}
          sx={{ 
            color: selectedTab === 1 ? '#3B82F6' : '#666',
            '&.Mui-selected': {
              color: '#3B82F6'
            }
          }}
        />
      </Tabs>

      <Box sx={{ mt: 1 }}>
        {Object.entries(groupedTodos)
          .sort(([dateA], [dateB]) => {
            return selectedTab === 0 
              ? new Date(dateA).getTime() - new Date(dateB).getTime()
              : new Date(dateB).getTime() - new Date(dateA).getTime();
          })
          .map(([date, dateTodos]) => (
            <Box key={date} sx={{ mb: 1 }}>
              <Box 
                onClick={() => toggleDateExpand(date)}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  p: 0.5,
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }
                }}
              >
                <IconButton 
                  size="small" 
                  sx={{ mr: 0.5 }}
                >
                  {expandedDates[date] ? (
                    <KeyboardArrowUpIcon fontSize="small" />
                  ) : (
                    <KeyboardArrowDownIcon fontSize="small" />
                  )}
                </IconButton>
                <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>
                  {format(new Date(date), 'yyyy. MM. dd.')}
                  <span style={{ marginLeft: '8px', color: '#888' }}>
                    ({dateTodos.length})
                  </span>
                </Typography>
              </Box>
              <Collapse in={expandedDates[date] !== false}>
                <Box sx={{ pl: 4 }}>
                  {dateTodos.map((todo) => (
                    <Box
                      key={todo.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 0.5,
                        p: 1,
                        borderRadius: '8px',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        }
                      }}
                    >
                      <Checkbox
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        sx={{
                          color: '#666',
                          '&.Mui-checked': {
                            color: '#3B82F6'
                          }
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            textDecoration: todo.completed ? 'line-through' : 'none',
                            color: todo.completed ? '#666' : '#fff'
                          }}
                        >
                          {todo.task}
                        </Typography>
                      </Box>
                      <IconButton 
                        onClick={() => handleDeleteClick(todo.id)}
                        size="small"
                        sx={{ 
                          color: '#666',
                          '&:hover': {
                            color: '#ef4444'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          ))}
      </Box>

      <Dialog open={todoToDelete !== null} onClose={() => setTodoToDelete(null)}>
        <DialogTitle>할 일 삭제</DialogTitle>
        <DialogContent>
          <Typography>이 할 일을 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTodoToDelete(null)}>취소</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

