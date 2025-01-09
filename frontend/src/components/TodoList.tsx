import { useState, useEffect } from 'react'
import { Todo, TodoRequest } from '../types'
import { todoApi } from '../services/api'
import { 
  Box, TextField, Button, List, ListItem, Checkbox, 
  IconButton, Typography, Dialog, DialogTitle, 
  DialogContent, DialogActions, Tabs, Tab, Chip, Snackbar, Alert
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { TimePicker } from '@mui/x-date-pickers/TimePicker'
import { Plus, Trash2, FileX } from 'lucide-react'

interface TodoListProps {
  todos: Todo[]
  setTodos: (todos: Todo[]) => void
}

export default function TodoList({ todos, setTodos }: TodoListProps) {
  const [openDialog, setOpenDialog] = useState(false)
  const [currentTab, setCurrentTab] = useState(0)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [todoForm, setTodoForm] = useState<TodoRequest>({
    title: '',
    dueDate: undefined,
    startDate: undefined,
    startTime: undefined,
    endTime: undefined,
    location: '',
    tags: []
  })
  const [formErrors, setFormErrors] = useState({
    title: false,
    dueDate: false
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sortByDueDate = (todos: Todo[]) => {
    return [...todos].sort((a, b) => {
      if (!a.dueDate) return 1;  // null 뒤로
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  };

  const filterTodosByTag = (todoList: Todo[]) => {
    if (!selectedTag) return todoList;
    return todoList.filter(todo => todo.tags?.includes(selectedTag));
  };

  const inProgressTodos = filterTodosByTag(
    sortByDueDate(todos.filter(todo => !todo.completed))
  );
  const completedTodos = filterTodosByTag(
    sortByDueDate(todos.filter(todo => todo.completed))
  );

  useEffect(() => {
  }, [todos]);

  const handleAddTodo = async () => {
    const errors = {
      title: !todoForm.title.trim(),
      dueDate: !todoForm.dueDate
    };
    setFormErrors(errors);

    if (Object.values(errors).some(error => error)) {
      return;
    }

    try {
      const response = await todoApi.create(todoForm);
      setTodos([...todos, response.data]);
      
      setTodoForm({
        title: '',
        dueDate: undefined,
        startDate: undefined,
        startTime: undefined,
        endTime: undefined,
        location: '',
        tags: []
      });
      setFormErrors({ title: false, dueDate: false });
      setOpenDialog(false);
    } catch (error) {
      setErrorMessage('할 일을 추가하는 중 오류가 발생했습니다.');
    }
  };

  const handleToggleTodo = async (id: number) => {
    try {
      await todoApi.update(id, { completed: !todos.find(t => t.id === id)?.completed });
      const response = await todoApi.getAll();
      setTodos(response.data);
    } catch (error) {
      setErrorMessage('할 일 상태를 변경하는 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteClick = (id: number) => {
    setTodoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (todoToDelete) {
      try {
        await todoApi.delete(todoToDelete);
        setTodos(todos.filter(todo => todo.id !== todoToDelete));
      } catch (error) {
        setErrorMessage('할 일을 삭제하는 중 오류가 발생했습니다.');
      }
    }
    setDeleteDialogOpen(false);
    setTodoToDelete(null);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${year}/${month}/${day}`;
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const getAllTags = () => {
    const tagSet = new Set<string>();
    todos.forEach(todo => {
      todo.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setOpenDialog(true)}
          sx={{ 
            bgcolor: 'hsl(var(--foreground))',
            color: 'hsl(var(--background))',
            border: 'none',
            '&:hover': {
              bgcolor: 'hsl(var(--foreground) / 0.9)',
            }
          }}
        >
          ADD TODO
        </Button>
      </Box>

      {getAllTags().length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {getAllTags().map((tag) => (
            <Chip
              key={tag}
              label={`#${tag}`}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              sx={{ 
                bgcolor: selectedTag === tag ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
                color: selectedTag === tag ? 'hsl(var(--primary-foreground))' : 'hsl(var(--secondary-foreground))',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: selectedTag === tag 
                    ? 'hsl(var(--primary) / 0.9)'
                    : 'hsl(var(--secondary) / 0.9)'
                }
              }}
            />
          ))}
          {selectedTag && (
            <Chip
              label="모든 태그"
              onClick={() => setSelectedTag(null)}
              sx={{ 
                bgcolor: 'hsl(var(--muted))',
                color: 'hsl(var(--muted-foreground))',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'hsl(var(--muted) / 0.9)'
                }
              }}
            />
          )}
        </Box>
      )}

      <Tabs 
        value={currentTab} 
        onChange={(_, newValue) => setCurrentTab(newValue)}
        sx={{ 
          mb: 2,
          borderBottom: '1px solid hsl(var(--border))',
          '& .MuiTab-root': {
            color: 'hsl(var(--muted-foreground))',
            '&.Mui-selected': {
              color: 'hsl(var(--foreground))'
            }
          }
        }}
      >
        <Tab 
          label={`진행중 (${inProgressTodos.length})`} 
          id="todo-tab-0"
        />
        <Tab 
          label={`완료됨 (${completedTodos.length})`} 
          id="todo-tab-1"
        />
      </Tabs>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: 500,
            bgcolor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))'
          }
        }}
      >
        <DialogTitle>New Todo</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="할 일 *"
              value={todoForm.title}
              onChange={(e) => {
                setTodoForm({ ...todoForm, title: e.target.value });
                setFormErrors({ ...formErrors, title: false });
              }}
              error={formErrors.title}
              helperText={formErrors.title ? '할 일을 입력해주세요' : ''}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="시작일"
                  value={todoForm.startDate ? new Date(todoForm.startDate) : null}
                  onChange={(date) => {
                    if (date) {
                      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        .toISOString()
                        .split('T')[0];
                      setTodoForm({ 
                        ...todoForm, 
                        startDate: localDate
                      });
                    } else {
                      setTodoForm({
                        ...todoForm,
                        startDate: undefined
                      });
                    }
                  }}
                  format="yyyy/MM/dd"
                />
                <DatePicker
                  label="마감일"
                  value={todoForm.dueDate ? new Date(todoForm.dueDate) : null}
                  onChange={(date) => {
                    if (date) {
                      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        .toISOString()
                        .split('T')[0];
                      setTodoForm({ 
                        ...todoForm, 
                        dueDate: localDate
                      });
                      setFormErrors({ ...formErrors, dueDate: false });
                    } else {
                      setTodoForm({
                        ...todoForm,
                        dueDate: undefined
                      });
                    }
                  }}
                  format="yyyy/MM/dd"
                  slotProps={{
                    textField: {
                      required: true,
                      error: formErrors.dueDate,
                      helperText: formErrors.dueDate ? '마감일은 필수입니다' : ''
                    }
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TimePicker
                  label="시작 시간"
                  value={todoForm.startTime ? new Date(`1970-01-01T${todoForm.startTime}:00`) : null}
                  onChange={(time) => {
                    if (time) {
                      const localTime = new Date(time.getTime() - (time.getTimezoneOffset() * 60000))
                        .toISOString()
                        .split('T')[1]
                        .slice(0, 5);
                      setTodoForm({
                        ...todoForm,
                        startTime: localTime
                      });
                    } else {
                      setTodoForm({
                        ...todoForm,
                        startTime: undefined
                      });
                    }
                  }}
                />
                <TimePicker
                  label="종료 시간"
                  value={todoForm.endTime ? new Date(`1970-01-01T${todoForm.endTime}:00`) : null}
                  onChange={(time) => {
                    if (time) {
                      const localTime = new Date(time.getTime() - (time.getTimezoneOffset() * 60000))
                        .toISOString()
                        .split('T')[1]
                        .slice(0, 5);
                      setTodoForm({
                        ...todoForm,
                        endTime: localTime
                      });
                    } else {
                      setTodoForm({
                        ...todoForm,
                        endTime: undefined
                      });
                    }
                  }}
                />
              </Box>
            </LocalizationProvider>
            <TextField
              fullWidth
              label="장소"
              value={todoForm.location}
              onChange={(e) => setTodoForm({ ...todoForm, location: e.target.value })}
              placeholder="예: 집, 카페"
            />
            <TextField
              fullWidth
              label="태그"
              value={todoForm.tags?.join(', ') || ''}
              onChange={(e) => {
                const tags = e.target.value
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag);
                setTodoForm({ ...todoForm, tags });
              }}
              placeholder="쉼표(,)로 구분하여 입력"
              helperText="예시: 공부, 과제, 프로젝트"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button onClick={handleAddTodo} variant="contained">추가</Button>
        </DialogActions>
      </Dialog>

      {todos.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          py: 4,
          color: 'text.secondary'
        }}>
          <FileX size={48} strokeWidth={1.5} />
          <Typography sx={{ mt: 2 }}>
            할 일 목록이 비어있습니다
          </Typography>
        </Box>
      ) : (
        <List sx={{ width: '100%' }}>
          {(currentTab === 0 ? inProgressTodos : completedTodos).map((todo) => {
            return (
              <ListItem
                key={todo.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid hsl(var(--border))',
                  py: 1.5,
                  px: 2,
                  '&:hover': {
                    bgcolor: 'hsl(var(--accent))'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo.id)}
                    sx={{
                      color: 'hsl(var(--muted-foreground))',
                      '&.Mui-checked': {
                        color: 'hsl(var(--primary))'
                      }
                    }}
                  />
                  <Box>
                    <Typography
                      sx={{
                        textDecoration: todo.completed ? 'line-through' : 'none',
                        color: todo.completed ? 'text.secondary' : 'text.primary',
                        mb: 0.5
                      }}
                    >
                      {todo.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {todo.startDate && `${formatDate(todo.startDate)}`}
                      {todo.startTime && ` ${formatTime(todo.startTime)}`}
                      {(todo.dueDate || todo.endTime) && ' ~ '}
                      {todo.dueDate && `${formatDate(todo.dueDate)}`}
                      {todo.endTime && ` ${formatTime(todo.endTime)}`}
                    </Typography>
                    {todo.location && (
                      <Box 
                        sx={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 1,
                          bgcolor: 'hsl(var(--muted) / 0.3)',
                          py: 0.5,
                          px: 1,
                          borderRadius: 'var(--radius)',
                          mt: 0.5
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>장소:</span> {todo.location}
                        </Typography>
                      </Box>
                    )}
                    {todo.tags && todo.tags.length > 0 && (
                      <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {todo.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={`#${tag}`}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();  // 상위 요소로의 이벤트 전파 방지
                              setSelectedTag(selectedTag === tag ? null : tag);
                            }}
                            sx={{ 
                              bgcolor: selectedTag === tag ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
                              color: selectedTag === tag ? 'hsl(var(--primary-foreground))' : 'hsl(var(--secondary-foreground))',
                              borderRadius: 'var(--radius)',
                              height: '20px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: selectedTag === tag 
                                  ? 'hsl(var(--primary) / 0.9)'
                                  : 'hsl(var(--secondary) / 0.9)'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
                <IconButton 
                  onClick={() => handleDeleteClick(todo.id)}
                  sx={{ 
                    color: 'hsl(var(--muted-foreground))',
                    '&:hover': {
                      color: 'error.main'
                    }
                  }}
                >
                  <Trash2 size={18} />
                </IconButton>
              </ListItem>
            );
          })}
        </List>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTodoToDelete(null);
        }}
        PaperProps={{
          sx: {
            bgcolor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))'
          }
        }}
      >
        <DialogTitle>할 일 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            정말 이 할 일을 삭제 하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false);
              setTodoToDelete(null);
            }}
          >
            취소
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setErrorMessage(null)}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

