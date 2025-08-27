import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task, TaskStatus, SortField, SortOrder, CreateTaskPayload } from './types/Task';
import { fetchTasks, createTask, updateTask, deleteTask } from './services/api';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import './App.css';

// Create a client
const queryClient = new QueryClient();

function TodoApp() {
  const [status, setStatus] = useState<TaskStatus>('active');
  const [sort, setSort] = useState<SortField>('dueDate');
  const [order, setOrder] = useState<SortOrder>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const queryClient = useQueryClient();
  
  // Fetch tasks
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', { status, sort, order, page, pageSize }],
    queryFn: () => fetchTasks({ status, sort, order, page, pageSize }),
  
  });
  
  // Create task mutation
  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
  
  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, task }: { id: string; task: Partial<Task> }) => updateTask(id, task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
  
  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
  
  // Handle task creation
  const handleCreateTask = async (newTask: CreateTaskPayload) => {
    try {
      await createMutation.mutateAsync(newTask);
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Couldn\'t save. Please retry.');
    }
  };
  
  // Handle task update
  const handleUpdateTask = async (id: string, updatedTask: Partial<Task>) => {
    try {
      await updateMutation.mutateAsync({ id, task: updatedTask });
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Couldn\'t save. Please retry.');
    }
  };
  
  // Handle task deletion
  const handleDeleteTask = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Couldn\'t delete. Please retry.');
    }
  };
  
  // Handle toggle done status
  const handleToggleDone = async (id: string, done: boolean) => {
    try {
      await updateMutation.mutateAsync({ id, task: { done } });
    } catch (error) {
      console.error('Failed to toggle task status:', error);
      alert('Couldn\'t update. Please retry.');
    }
  };
  
  // Handle sort change
  const handleSort = (field: SortField, newOrder: SortOrder) => {
    setSort(field);
    setOrder(newOrder);
  };
  
  // Handle status filter change
  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    setPage(1); // Reset to first page when changing filters
  };
  
  return (
    <div className="todo-container">
      <header className="mb-8 text-center">
        <h1 className="todo-title">todos</h1>
        <p className="text-gray-600 mt-2">What needs to be done today?</p>
      </header>
      
      <main>
        <TaskForm onSubmit={handleCreateTask} />
        
        {isLoading ? (
          <div className="todo-empty">Loading tasks...</div>
        ) : error ? (
          <div className="todo-empty text-red-600">
            Error loading tasks. Please try again.
          </div>
        ) : (
          <TaskList
            tasks={data?.tasks || []}
            totalCount={data?.totalCount || 0}
            status={status}
            onStatusChange={handleStatusChange}
            onToggleDone={handleToggleDone}
            onDelete={handleDeleteTask}
            onUpdate={handleUpdateTask}
            onSort={handleSort}
            currentSort={sort}
            currentOrder={order}
          />
        )}
      </main>
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>Double-click to edit a task • Drag to reorder • Click checkmark to complete</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TodoApp />
    </QueryClientProvider>
  );
}

export default App;
