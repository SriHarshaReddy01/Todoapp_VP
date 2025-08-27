import { useState } from 'react';
import type { Task } from '../types/Task';
import TaskForm from './TaskForm';

interface TaskItemProps {
  task: Task;
  onToggleDone: (id: string, done: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updatedTask: Partial<Task>) => Promise<void>;
}

export default function TaskItem({ task, onToggleDone, onDelete, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Calculate if task is overdue
  const isOverdue = !task.done && task.dueDate && new Date(task.dueDate) < new Date();
  
  // Format due date for display
  const formattedDueDate = task.dueDate 
    ? new Date(task.dueDate).toLocaleDateString() 
    : '—';
  
  // Calculate days left
  const daysLeft = task.dueDate 
    ? Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  const daysLeftText = daysLeft !== null
    ? daysLeft === 0
      ? 'Due today'
      : daysLeft > 0
        ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
        : `${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} overdue`
    : '—';
  
  const handleToggleDone = async () => {
    await onToggleDone(task.id, !task.done);
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleUpdate = async (updatedTask: Partial<Task>) => {
    await onUpdate(task.id, updatedTask);
    setIsEditing(false);
  };
  
  const handleDelete = async () => {
    if (window.confirm('Delete this task?')) {
      setIsDeleting(true);
      try {
        await onDelete(task.id);
      } catch (error) {
        setIsDeleting(false);
        console.error('Error deleting task:', error);
      }
    }
  };
  
  if (isEditing) {
    return (
      <tr>
        <td colSpan={7}>
          <TaskForm
            onSubmit={(updatedTask) => handleUpdate(updatedTask)}
            initialValues={task}
            isEditing={true}
          />
        </td>
      </tr>
    );
  }
  
  return (
    <tr className={`task-item border-b ${isOverdue ? 'task-overdue' : ''} ${task.done ? 'task-completed' : ''}`}>
      <td className="py-3 px-4">
        <div 
          className={`todo-checkbox ${task.done ? 'checked' : ''}`}
          onClick={handleToggleDone}
          role="checkbox"
          aria-checked={task.done}
          aria-label={`Mark task "${task.title}" as ${task.done ? 'not done' : 'done'}`}
        >
          {task.done && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="max-w-xs truncate font-medium" title={task.title}>
          {task.title}
        </div>
        {task.notes && (
          <div className="text-xs text-gray-500 truncate mt-1" title={task.notes}>
            {task.notes}
          </div>
        )}
      </td>
      <td className="py-3 px-4">
        {formattedDueDate}
      </td>
      <td className="py-3 px-4">
        <span className={`inline-block px-2 py-1 rounded-full text-xs ${task.done ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
          {task.done ? 'Completed' : 'Active'}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={isOverdue ? 'task-overdue font-medium' : ''} aria-label={isOverdue ? 'Overdue' : ''}>
          {daysLeftText}
          {isOverdue && (
            <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">
              Overdue
            </span>
          )}
        </span>
      </td>
      <td className="py-3 px-4 hidden md:table-cell">
        {new Date(task.createdAt).toLocaleDateString()}
      </td>
      <td className="py-3 px-4">
        <div className="task-actions flex space-x-2">
          <button
            onClick={handleEdit}
            className="task-edit-button p-1"
            aria-label="Edit task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="task-delete-button p-1"
            aria-label="Delete task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
