import type { Task, TaskFilters, CreateTaskPayload, UpdateTaskPayload } from '../types/Task';

const API_BASE_URL = 'http://localhost:5136/api/v1';

export const fetchTasks = async (filters: TaskFilters): Promise<{ tasks: Task[], totalCount: number }> => {
  const { status, sort, order, page, pageSize } = filters;
  const url = `${API_BASE_URL}/tasks?status=${status}&sort=${sort}&order=${order}&page=${page}&pageSize=${pageSize}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  const totalCount = response.headers.get('X-Total-Count') || '0';
  const tasks = await response.json();

  return { tasks, totalCount: parseInt(totalCount, 10) };
};

export const fetchTask = async (id: string): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch task');
  }

  return response.json();
};

export const createTask = async (task: CreateTaskPayload): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create task');
  }

  return response.json();
};

export const toggleTaskStatus = async (id: string, done: boolean): Promise<Task> => {
  // Create a specialized function just for toggling task status
  // This ensures we don't send any other fields that might trigger validation
  const response = await fetch(`${API_BASE_URL}/tasks/${id}/toggle`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    body: JSON.stringify({ done }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to toggle task status');
  }

  return response.json();
};

export const updateTask = async (id: string, task: UpdateTaskPayload): Promise<Task> => {
  // For toggling task status, use the specialized function
  if (Object.keys(task).length === 1 && 'done' in task && task.done !== undefined) {
    return toggleTaskStatus(id, task.done);
  }

  // For regular updates
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update task');
  }

  return response.json();
};

export const deleteTask = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    mode: 'cors',
  });

  if (!response.ok) {
    throw new Error('Failed to delete task');
  }

};


