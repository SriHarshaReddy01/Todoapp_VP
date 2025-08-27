import { useState } from 'react';
import type { Task, TaskStatus, SortField, SortOrder } from '../types/Task';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  totalCount: number;
  status: TaskStatus;
  onStatusChange: (status: TaskStatus) => void;
  onToggleDone: (id: string, done: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updatedTask: Partial<Task>) => Promise<void>;
  onSort: (field: SortField, order: SortOrder) => void;
  currentSort: SortField;
  currentOrder: SortOrder;
}

export default function TaskList({
  tasks,
  totalCount,
  status,
  onStatusChange,
  onToggleDone,
  onDelete,
  onUpdate,
  onSort,
  currentSort,
  currentOrder
}: TaskListProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  // Calculate tasks count based on filter
  const activeTasks = tasks.filter(task => !task.done).length;
  const completedTasks = tasks.filter(task => task.done).length;
  
  // Handle sort toggle
  const handleSort = (field: SortField) => {
    const newOrder = currentSort === field && currentOrder === 'asc' ? 'desc' : 'asc';
    onSort(field, newOrder);
  };
  
  // Render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (currentSort !== field) return null;
    
    return currentOrder === 'asc' 
      ? <span className="ml-1">↑</span> 
      : <span className="ml-1">↓</span>;
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => onStatusChange('all')}
            className={`todo-filter-button ${status === 'all' ? 'active' : ''}`}
          >
            All
          </button>
          <button
            onClick={() => onStatusChange('active')}
            className={`todo-filter-button ${status === 'active' ? 'active' : ''}`}
          >
            Active
          </button>
          <button
            onClick={() => onStatusChange('completed')}
            className={`todo-filter-button ${status === 'completed' ? 'active' : ''}`}
          >
            Completed
          </button>
        </div>
        <div className="text-sm text-gray-600 font-medium">
          {status === 'completed' ? 
            `${completedTasks} completed item${completedTasks !== 1 ? 's' : ''}` : 
            `${activeTasks} item${activeTasks !== 1 ? 's' : ''} left`
          }
        </div>
      </div>
      
      {tasks.length === 0 ? (
        <div className="todo-empty">
          {status === 'all' 
            ? "No tasks yet. Create your first one." 
            : "Nothing here. Try another filter."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="todo-table min-w-full">
            <thead>
              <tr>
                <th className="py-3 px-4 text-left w-12"></th>
                <th className="py-3 px-4 text-left">Title</th>
                <th className="py-3 px-4 text-left">
                  <button 
                    onClick={() => handleSort('dueDate')}
                    className="font-medium flex items-center"
                  >
                    Due Date {renderSortIndicator('dueDate')}
                  </button>
                </th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Days Left</th>
                <th className="py-3 px-4 text-left hidden md:table-cell">
                  <button 
                    onClick={() => handleSort('createdAt')}
                    className="font-medium flex items-center"
                  >
                    Created At {renderSortIndicator('createdAt')}
                  </button>
                </th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleDone={onToggleDone}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {totalCount > pageSize && (
        <div className="todo-pagination">
          <nav className="flex items-center">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-l border"
            >
              Previous
            </button>
            <span className="px-4 py-1 border-t border-b">
              Page {page} of {Math.ceil(totalCount / pageSize)}
            </span>
            <button
              onClick={() => setPage(p => Math.min(Math.ceil(totalCount / pageSize), p + 1))}
              disabled={page >= Math.ceil(totalCount / pageSize)}
              className="px-3 py-1 rounded-r border"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
