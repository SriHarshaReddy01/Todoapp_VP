export interface Task {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string; // ISO 8601 format
  done: boolean;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

export type TaskStatus = 'all' | 'active' | 'completed';

export type SortField = 'dueDate' | 'createdAt';

export type SortOrder = 'asc' | 'desc';

export interface TaskFilters {
  status: TaskStatus;
  sort: SortField;
  order: SortOrder;
  page: number;
  pageSize: number;
}

export interface CreateTaskPayload {
  title: string;
  notes?: string;
  dueDate?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  notes?: string;
  dueDate?: string;
  done?: boolean;
}
