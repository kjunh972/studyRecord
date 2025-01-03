import { useState } from 'react'
import { Todo, TodoPeriod } from '../types'
import { format } from 'date-fns'
import { 
  Button, TextField, Checkbox, Box, Typography, Tabs, Tab, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Collapse, Snackbar, Alert
} from '@mui/material'
import { todoApi } from '../services/api'
import DeleteIcon from '@mui/icons-material/Delete'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { useTheme } from '../hooks/useTheme'

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
  const { theme = 'light' } = useTheme() || {}
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const addTodo = async () => {
    if (!dueDate) {
      setDateError(true)
      return
    }
    if (newTodo.trim() && dueDate) {
      setDateError(false)
      const todoRequest = {
        task: newTodo.trim(),
        dueDate: `${dueDate}T00:00:00`,
        completed: false,
        period: 'DAILY' as TodoPeriod
      }
      
      try {
        const response = await todoApi.create(todoRequest)
        setTodos([...todos, response.data])
        setNewTodo('')
        setDueDate('')
        setSelectedTab(0)
        setSnackbar({
          open: true,
          message: '할 일이 추가되었습니다',
          severity: 'success'
        })
      } catch (error) {
        console.error('Failed to create todo:', error)
        setSnackbar({
          open: true,
          message: '할 일 추가에 실패했습니다',
          severity: 'error'
        })
      }
    }
  }

  const toggleTodo = async (id: number) => {
    const todo = todos.find(t => t.id === id)
    if (todo) {
      const updatedTodo = {
        completed: !todo.completed,
      }
      try {
        await todoApi.update(id, updatedTodo)
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
      } catch (error) {
        console.error('Failed to update todo:', error)
        setSnackbar({
          open: true,
          message: '권한이 없거나 서버 오류가 발생했습니다',
          severity: 'error'
        })
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

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
                backgroundColor: 'hsl(var(--background))',
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: 'hsl(var(--border))'
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
                backgroundColor: 'hsl(var(--background))',
                borderRadius: '8px',
                color: theme === 'dark' ? '#ffffff' : 'inherit',
                '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                  color: theme === 'dark' ? '#ffffff' : 'inherit'
                },
                '& fieldset': {
                  borderColor: dateError ? 'error.main' : 'hsl(var(--border))'
                },
                '& input': {
                  color: theme === 'dark' ? '#ffffff' : 'inherit',
                  '&::-webkit-calendar-picker-indicator': {
                    filter: theme === 'dark' ? 'invert(1)' : 'none'
                  }
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
            bgcolor: 'hsl(var(--primary))', 
            color: 'hsl(var(--primary-foreground))',
            '&:hover': {
              bgcolor: 'hsl(var(--primary) / 0.9)'
            },
            borderRadius: '20px',
            textTransform: 'none',
            mt: 1
          }}
        >
          Add Task
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'hsl(var(--border))', mb: 2 }}>
        <Tabs 
          value={selectedTab} 
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              color: 'hsl(var(--muted-foreground))',
              '&.Mui-selected': {
                color: 'hsl(var(--foreground))'
              }
            }
          }}
        >
          <Tab label={`진행중 (${todos.filter(todo => !todo.completed).length})`} />
          <Tab label={`완료됨 (${completedCount})`} />
        </Tabs>
      </Box>

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
                    backgroundColor: 'hsl(var(--accent) / 0.1)'
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
                <Typography sx={{ 
                  color: 'hsl(var(--muted-foreground))',
                  fontSize: '0.9rem' 
                }}>
                  {format(new Date(date), 'yyyy. MM. dd.')}
                  <span style={{ 
                    marginLeft: '8px', 
                    color: 'hsl(var(--muted-foreground))' 
                  }}>
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
                          backgroundColor: 'hsl(var(--accent) / 0.1)'
                        }
                      }}
                    >
                      <Checkbox
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        sx={{
                          color: 'hsl(var(--muted-foreground))',
                          '&.Mui-checked': {
                            color: 'hsl(var(--primary))'
                          }
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            textDecoration: todo.completed ? 'line-through' : 'none',
                            color: todo.completed ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))'
                          }}
                        >
                          {todo.task}
                        </Typography>
                      </Box>
                      <IconButton 
                        onClick={() => handleDeleteClick(todo.id)}
                        size="small"
                        sx={{ 
                          color: 'hsl(var(--muted-foreground))',
                          '&:hover': {
                            color: 'hsl(var(--destructive))'
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

      <Dialog 
        open={todoToDelete !== null} 
        onClose={() => setTodoToDelete(null)}
        PaperProps={{
          sx: {
            bgcolor: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))'
          }
        }}
      >
        <DialogTitle sx={{ color: 'hsl(var(--foreground))' }}>
          할 일 삭제
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'hsl(var(--foreground))' }}>
            이 할 일을 삭제하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setTodoToDelete(null)}
            sx={{ color: 'hsl(var(--muted-foreground))' }}
          >
            취소
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            sx={{ 
              bgcolor: 'hsl(var(--destructive))',
              color: 'hsl(var(--destructive-foreground))',
              '&:hover': {
                bgcolor: 'hsl(var(--destructive) / 0.9)'
              }
            }}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            bgcolor: snackbar.severity === 'error' ? 'hsl(var(--destructive))' : 'hsl(var(--primary))',
            color: snackbar.severity === 'error' ? 'white' : 'hsl(var(--primary-foreground))',
            '& .MuiAlert-icon': {
              color: 'inherit'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

