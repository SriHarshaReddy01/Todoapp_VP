import { useState } from 'react';
import type { FormEvent } from 'react';
import { z } from 'zod';
import { createTaskSchema } from '../validations/taskSchema';
import type { Task, CreateTaskPayload } from '../types/Task';

interface TaskFormProps {
  onSubmit: (task: CreateTaskPayload) => Promise<void>;
  initialValues?: Partial<Task>;
  isEditing?: boolean;
}

export default function TaskForm({ onSubmit, initialValues, isEditing = false }: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [notes, setNotes] = useState(initialValues?.notes || '');
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ? new Date(initialValues.dueDate).toISOString().split('T')[0] : '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    try {
      createTaskSchema.parse({ title, notes: notes || null, dueDate: dueDate || null });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.format((issue) => {
          if (issue.path && issue.path.length > 0 && typeof issue.path[0] === 'string') {
            formattedErrors[issue.path[0]] = issue.message || 'Invalid value';
          }
          return issue;
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        title,
        notes: notes || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
      });
      
      if (!isEditing) {
        // Reset form if it's a new task
        setTitle('');
        setNotes('');
        setDueDate('');
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      // Handle API errors here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form mb-6">
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title*
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className={`todo-input w-full ${
            errors.title ? 'border-red-500' : ''
          }`}
          disabled={isSubmitting}
        />
        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={`todo-input w-full ${
            errors.notes ? 'border-red-500' : ''
          }`}
          disabled={isSubmitting}
        />
        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
      </div>
      
      <div className="mb-4">
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
          Due Date (optional)
        </label>
        <input
          type="date"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={`todo-input w-full ${
            errors.dueDate ? 'border-red-500' : ''
          }`}
          disabled={isSubmitting}
        />
        {errors.dueDate && <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>}
      </div>
      
      <button
        type="submit"
        className="todo-button"
        style={{
          backgroundColor: '#3182ce',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          width: '100%',
          marginTop: '1.5rem',
          cursor: 'pointer',
          border: 'none',
          boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)'
        }}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : isEditing ? 'Update Task' : 'Add Task'}
      </button>
    </form>
  );
}
