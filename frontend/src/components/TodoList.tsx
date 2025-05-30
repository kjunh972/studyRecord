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
import { Plus, Trash2, Edit, X, ChevronDown, ChevronUp } from 'lucide-react'
import { NavigationPrompt } from '../components/NavigationPrompt'

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
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<TodoRequest>({
    title: '',
    dueDate: undefined,
    startDate: undefined,
    startTime: undefined,
    endTime: undefined,
    location: '',
    tags: []
  });
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState<{
    title: string;
    content: string;
    confirmText: string;
    cancelText?: string;
  }>({
    title: '',
    content: '',
    confirmText: '',
    cancelText: ''
  });
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

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
    const handleTabSwitch = (e: CustomEvent) => {
      setCurrentTab(e.detail.tab);
    };

    window.addEventListener('switchTab', handleTabSwitch as EventListener);
    
    return () => {
      window.removeEventListener('switchTab', handleTabSwitch as EventListener);
    };
  }, []);

  useEffect(() => {
    // 초기 렌더링 시에만 모든 그룹을 펼침
    if (expandedGroups.length === 0) {
      const inProgressDates = groupTodosByDueDate(inProgressTodos).map(([date]) => date);
      const completedDates = groupTodosByDueDate(completedTodos).map(([date]) => date);
      setExpandedGroups([...inProgressDates, ...completedDates]);
    }
  }, []);

  const isValidDateRange = (
    startDate: string | null | undefined, 
    dueDate: string | null | undefined,
    startTime: string | null | undefined, 
    endTime: string | null | undefined
  ) => {
    if (!dueDate) return false;  // 마감일은 필수
    
    if (startDate && dueDate) {
      const start = new Date(startDate);
      const end = new Date(dueDate);
      
      if (start > end) return false;  // 시작일이 마감일보다 늦으면 안됨
      
      // 같은 날짜인 경우 시간 체크
      if (start.getTime() === end.getTime() && startTime && endTime) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
          return false;  // 시작 시간이 종료 시간보다 늦거나 같으면 안됨
        }
      }
    }
    
    return true;
  };

  const handleAddTodo = async () => {
    const errors = {
      title: !todoForm.title.trim(),
      dueDate: !todoForm.dueDate,
      dateRange: !isValidDateRange(todoForm.startDate, todoForm.dueDate, 
                                  todoForm.startTime, todoForm.endTime)
    };
    setFormErrors(errors);

    if (Object.values(errors).some(error => error)) {
      if (errors.dateRange) {
        setErrorMessage('시작일/시간은 종료일/시간보다 앞서야 합니다.');
      }
      return;
    }

    try {
      const response = await todoApi.create(todoForm);
      setTodos([...todos, response.data]);
      
      if (response.data.dueDate) {
        const newDueDate = new Date(response.data.dueDate).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).replace(/\. /g, '/');
        
        if (!expandedGroups.includes(newDueDate)) {
          setExpandedGroups(prev => [...prev, newDueDate]);
        }
      } else {
        if (!expandedGroups.includes('마감일 없음')) {
          setExpandedGroups(prev => [...prev, '마감일 없음']);
        }
      }
      
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
    todos.filter(todo => !todo.completed).forEach(todo => {
      todo.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditForm({
      title: todo.title || '',
      dueDate: todo.dueDate || undefined,
      startDate: todo.startDate || undefined,
      startTime: todo.startTime?.slice(0, 5) || undefined,
      endTime: todo.endTime?.slice(0, 5) || undefined,
      location: todo.location || '',
      tags: todo.tags || []
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingTodoId) return;

    if (!isValidDateRange(editForm.startDate, editForm.dueDate, 
                         editForm.startTime, editForm.endTime)) {
      setErrorMessage('시작일/시간은 종료일/시간보다 앞서야 합니다.');
      return;
    }

    try {
      const response = await todoApi.update(editingTodoId, editForm);
      setTodos(todos.map(todo => 
        todo.id === editingTodoId ? response.data : todo
      ));
      setEditDialogOpen(false);
      setEditingTodoId(null);
      
      setShowDialog(true);
      setMessage({
        title: '할 일 수정',
        content: '할 일이 수정이 완료되었습니다.',
        confirmText: '확인'
      });
    } catch (error) {
      setErrorMessage('할 일을 수정하는 중 오류가 발생했습니다.');
    }
  };

  const groupTodosByDueDate = (todos: Todo[]) => {
    const groups = todos.reduce((acc, todo) => {
      if (!todo.dueDate) {
        if (!acc['마감일 없음']) acc['마감일 없음'] = [];
        acc['마감일 없음'].push(todo);
        return acc;
      }

      const date = new Date(todo.dueDate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\. /g, '/');

      if (!acc[date]) acc[date] = [];
      acc[date].push(todo);
      return acc;
    }, {} as Record<string, Todo[]>);

    // 날짜순으로 정렬 (마감일 없음은 항상 마지막에)
    return Object.entries(groups).sort((a, b) => {
      if (a[0] === '마감일 없음') return 1;
      if (b[0] === '마감일 없음') return -1;
      return new Date(a[0].replace(/\//g, '-')).getTime() - new Date(b[0].replace(/\//g, '-')).getTime();
    });
  };

  const toggleGroup = (date: string) => {
    setExpandedGroups(prev => 
      prev.includes(date)
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
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
          '& .MuiTabs-indicator': {
            backgroundColor: 'hsl(var(--primary))',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          },
          '& .MuiTab-root': {
            color: 'hsl(var(--muted-foreground))',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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

      <Box
        sx={{
          position: 'relative',
          minHeight: 200  // 최소 높이 설정
        }}
      >
        <Box
          sx={{
            display: currentTab === 0 ? 'block' : 'none',
            opacity: currentTab === 0 ? 1 : 0,
            transform: `translateX(${currentTab === 0 ? 0 : -20}px)`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {groupTodosByDueDate(currentTab === 0 ? inProgressTodos : completedTodos).map(([date, todos]) => (
            <Box key={date} sx={{ mb: 4 }}>
              <Box
                onClick={() => toggleGroup(date)}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  mb: 1.5,
                  py: 0.5,
                  px: 1,
                  '&:hover': {
                    color: 'hsl(var(--primary))'
                  }
                }}
              >
                <Typography 
                  variant="subtitle2"
                  sx={{ 
                    color: 'hsl(var(--muted-foreground))',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {date}
                  <Typography 
                    component="span" 
                    sx={{ 
                      color: 'hsl(var(--muted-foreground))',
                      fontSize: '0.75rem',
                      opacity: 0.8
                    }}
                  >
                    ({todos.length})
                  </Typography>
                </Typography>
                {expandedGroups.includes(date) ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </Box>
              {expandedGroups.includes(date) && (
                <List sx={{ width: '100%' }}>
                  {todos.map((todo) => {
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
                          ...((!todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date()) && {
                            bgcolor: 'hsl(var(--destructive) / 0.1)',
                            borderLeft: '4px solid hsl(var(--destructive))',
                            '&:hover': {
                              bgcolor: 'hsl(var(--destructive) / 0.15)'
                            }
                          }),
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
                          <Box sx={{ flex: 1 }}>
                            <Box 
                              component="div"  // Typography 대신 Box 사용
                              sx={{ 
                                mb: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                color: 'hsl(var(--foreground))',
                                fontSize: '1rem',  // Typography의 기본 스타일 유지
                                fontWeight: 400
                              }}
                            >
                              <Box component="span">
                                {todo.title}
                              </Box>
                              {!todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date() && (
                                <Chip
                                  label="기한 초과"
                                  size="small"
                                  sx={{ 
                                    bgcolor: 'hsl(var(--destructive))',
                                    color: 'hsl(var(--destructive-foreground))',
                                    height: '20px',
                                    fontSize: '0.75rem'
                                  }}
                                />
                              )}
                            </Box>
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
                              <Box component="span" sx={{ display: 'flex', gap: 0.5 }}>
                                {todo.tags.map((tag, index) => (
                                  <Chip
                                    key={index}
                                    label={`#${tag}`}
                                    size="small"
                                    sx={{
                                      height: '20px',
                                      fontSize: '0.75rem',
                                      bgcolor: 'hsl(var(--secondary))',
                                      color: 'hsl(var(--secondary-foreground))'
                                    }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1,
                          ml: 2  // 내용과의 간격
                        }}>
                          <IconButton 
                            onClick={() => handleEditClick(todo)}
                            sx={{ 
                              color: 'hsl(var(--muted-foreground))',
                              '&:hover': {
                                color: 'primary.main'
                              }
                            }}
                          >
                            <Edit size={18} />
                          </IconButton>
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
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            display: currentTab === 1 ? 'block' : 'none',
            opacity: currentTab === 1 ? 1 : 0,
            transform: `translateX(${currentTab === 1 ? 0 : 20}px)`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {groupTodosByDueDate(currentTab === 0 ? inProgressTodos : completedTodos).map(([date, todos]) => (
            <Box key={date} sx={{ mb: 4 }}>
              <Box
                onClick={() => toggleGroup(date)}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  mb: 1.5,
                  py: 0.5,
                  px: 1,
                  '&:hover': {
                    color: 'hsl(var(--primary))'
                  }
                }}
              >
                <Typography 
                  variant="subtitle2"
                  sx={{ 
                    color: 'hsl(var(--muted-foreground))',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {date}
                  <Typography 
                    component="span" 
                    sx={{ 
                      color: 'hsl(var(--muted-foreground))',
                      fontSize: '0.75rem',
                      opacity: 0.8
                    }}
                  >
                    ({todos.length})
                  </Typography>
                </Typography>
                {expandedGroups.includes(date) ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </Box>
              {expandedGroups.includes(date) && (
                <List sx={{ width: '100%' }}>
                  {todos.map((todo) => {
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
                          ...((!todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date()) && {
                            bgcolor: 'hsl(var(--destructive) / 0.1)',
                            borderLeft: '4px solid hsl(var(--destructive))',
                            '&:hover': {
                              bgcolor: 'hsl(var(--destructive) / 0.15)'
                            }
                          }),
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
                          <Box sx={{ flex: 1 }}>
                            <Box 
                              component="div"  // Typography 대신 Box 사용
                              sx={{ 
                                mb: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                color: 'hsl(var(--foreground))',
                                fontSize: '1rem',  // Typography의 기본 스타일 유지
                                fontWeight: 400
                              }}
                            >
                              <Box component="span">
                                {todo.title}
                              </Box>
                              {!todo.completed && todo.dueDate && new Date(todo.dueDate) < new Date() && (
                                <Chip
                                  label="기한 초과"
                                  size="small"
                                  sx={{ 
                                    bgcolor: 'hsl(var(--destructive))',
                                    color: 'hsl(var(--destructive-foreground))',
                                    height: '20px',
                                    fontSize: '0.75rem'
                                  }}
                                />
                              )}
                            </Box>
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
                              <Box component="span" sx={{ display: 'flex', gap: 0.5 }}>
                                {todo.tags.map((tag, index) => (
                                  <Chip
                                    key={index}
                                    label={`#${tag}`}
                                    size="small"
                                    sx={{
                                      height: '20px',
                                      fontSize: '0.75rem',
                                      bgcolor: 'hsl(var(--secondary))',
                                      color: 'hsl(var(--secondary-foreground))'
                                    }}
                                  />
                                ))}
                              </Box>
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ 
                          display: 'flex', 
                          gap: 1,
                          ml: 2  // 내용과의 간격
                        }}>
                          <IconButton 
                            onClick={() => handleEditClick(todo)}
                            sx={{ 
                              color: 'hsl(var(--muted-foreground))',
                              '&:hover': {
                                color: 'primary.main'
                              }
                            }}
                          >
                            <Edit size={18} />
                          </IconButton>
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
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          ))}
        </Box>
      </Box>

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

      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: 500,
            bgcolor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))'
          }
        }}
      >
        <DialogTitle>할 일 수정</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="할 일 *"
              value={editForm.title || ''}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              error={!editForm.title.trim()}
              helperText={!editForm.title.trim() ? '할 일을 입력해주세요' : ''}
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="시작일"
                  value={editForm.startDate ? new Date(editForm.startDate) : null}
                  onChange={(date) => {
                    if (date) {
                      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        .toISOString()
                        .split('T')[0];
                      setEditForm({ 
                        ...editForm, 
                        startDate: localDate
                      });
                    } else {
                      setEditForm({
                        ...editForm,
                        startDate: undefined
                      });
                    }
                  }}
                  format="yyyy/MM/dd"
                />
                <DatePicker
                  label="마감일"
                  value={editForm.dueDate ? new Date(editForm.dueDate) : null}
                  onChange={(date) => {
                    if (date) {
                      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                        .toISOString()
                        .split('T')[0];
                      setEditForm({ 
                        ...editForm, 
                        dueDate: localDate
                      });
                    } else {
                      setEditForm({
                        ...editForm,
                        dueDate: undefined
                      });
                    }
                  }}
                  format="yyyy/MM/dd"
                  slotProps={{
                    textField: {
                      required: true,
                      error: !editForm.dueDate,
                      helperText: !editForm.dueDate ? '마감일은 필수입니다' : ''
                    }
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ flex: 1, position: 'relative' }}>
                  <TimePicker
                    label="시작 시간"
                    value={editForm.startTime ? new Date(`1970-01-01T${editForm.startTime}`) : null}
                    onChange={(time) => {
                      setEditForm({
                        ...editForm,
                        startTime: time ? time.toLocaleTimeString('en-US', {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : null
                      });
                    }}
                    sx={{ width: '100%' }}
                  />
                  {editForm.startTime && (
                    <IconButton 
                      size="small"
                      onClick={() => setEditForm({ ...editForm, startTime: null })}
                      sx={{ 
                        position: 'absolute',
                        right: 32,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'hsl(var(--muted-foreground))',
                        '&:hover': {
                          color: 'hsl(var(--destructive))',
                          bgcolor: 'transparent'
                        }
                      }}
                    >
                      <X size={16} />
                    </IconButton>
                  )}
                </Box>
                <Box sx={{ flex: 1, position: 'relative' }}>
                  <TimePicker
                    label="종료 시간"
                    value={editForm.endTime ? new Date(`1970-01-01T${editForm.endTime}`) : null}
                    onChange={(time) => {
                      setEditForm({
                        ...editForm,
                        endTime: time ? time.toLocaleTimeString('en-US', {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : null
                      });
                    }}
                    sx={{ width: '100%' }}
                  />
                  {editForm.endTime && (
                    <IconButton 
                      size="small"
                      onClick={() => setEditForm({ ...editForm, endTime: null })}
                      sx={{ 
                        position: 'absolute',
                        right: 32,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'hsl(var(--muted-foreground))',
                        '&:hover': {
                          color: 'hsl(var(--destructive))',
                          bgcolor: 'transparent'
                        }
                      }}
                    >
                      <X size={16} />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </LocalizationProvider>
            <TextField
              fullWidth
              label="장소"
              value={editForm.location || ''}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              placeholder="예: 집, 카페"
            />
            <TextField
              fullWidth
              label="태그"
              value={editForm.tags?.join(', ') || ''}
              onChange={(e) => {
                const tags = e.target.value
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag);
                setEditForm({ ...editForm, tags });
              }}
              placeholder="쉼표(,)로 구분하여 입력"
              helperText="예시: 공부, 과제, 프로젝트"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)}>취소</Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            disabled={!editForm.title.trim()}
          >
            수정
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 6 }}
      >
        <Alert 
          onClose={() => setErrorMessage(null)}
          severity="error"
          variant="filled"
          sx={{ 
            width: '100%',
            bgcolor: 'hsl(var(--destructive))',
            color: 'hsl(var(--destructive-foreground))',
            '& .MuiAlert-icon': {
              color: 'hsl(var(--destructive-foreground))'
            }
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

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
        <DialogTitle>새로운 할 일</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="할 일 *"
              value={todoForm.title}
              onChange={(e) => setTodoForm({ ...todoForm, title: e.target.value })}
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
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ flex: 1, position: 'relative' }}>
                  <TimePicker
                    label="시작 시간"
                    value={todoForm.startTime ? new Date(`1970-01-01T${todoForm.startTime}`) : null}
                    onChange={(time) => {
                      setTodoForm({
                        ...todoForm,
                        startTime: time ? time.toLocaleTimeString('en-US', {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : undefined
                      });
                    }}
                    sx={{ width: '100%' }}
                  />
                  {todoForm.startTime && (
                    <IconButton 
                      size="small"
                      onClick={() => setTodoForm({ ...todoForm, startTime: undefined })}
                      sx={{ 
                        position: 'absolute',
                        right: 32,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'hsl(var(--muted-foreground))',
                        '&:hover': {
                          color: 'hsl(var(--destructive))',
                          bgcolor: 'transparent'
                        }
                      }}
                    >
                      <X size={16} />
                    </IconButton>
                  )}
                </Box>
                <Box sx={{ flex: 1, position: 'relative' }}>
                  <TimePicker
                    label="종료 시간"
                    value={todoForm.endTime ? new Date(`1970-01-01T${todoForm.endTime}`) : null}
                    onChange={(time) => {
                      setTodoForm({
                        ...todoForm,
                        endTime: time ? time.toLocaleTimeString('en-US', {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : undefined
                      });
                    }}
                    sx={{ width: '100%' }}
                  />
                  {todoForm.endTime && (
                    <IconButton 
                      size="small"
                      onClick={() => setTodoForm({ ...todoForm, endTime: undefined })}
                      sx={{ 
                        position: 'absolute',
                        right: 32,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'hsl(var(--muted-foreground))',
                        '&:hover': {
                          color: 'hsl(var(--destructive))',
                          bgcolor: 'transparent'
                        }
                      }}
                    >
                      <X size={16} />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </LocalizationProvider>
            <TextField
              fullWidth
              label="장소"
              value={todoForm.location || ''}
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
          <Button 
            onClick={handleAddTodo}
            variant="contained"
            disabled={!todoForm.title.trim()}
          >
            추가
          </Button>
        </DialogActions>
      </Dialog>

      <NavigationPrompt
        open={showDialog}
        message={message}
        onCancel={() => setShowDialog(false)}
        onConfirm={() => setShowDialog(false)}
      />
    </Box>
  )
}

