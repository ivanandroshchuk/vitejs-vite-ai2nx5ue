export type TodoStatus = 'completed' | 'active';
export type TodosRequestSortBy = 'priority' | 'createdAt';

// GET /api/todos
// Response: { todos: Todo[], total: number }
export interface GetTodosRequest {
  search?: string;
  status?: TodoStatus
  priority?: TodoPriority;
  sortBy?: TodosRequestSortBy;
}

export interface GetTodosResponse {
  todos: Todo[];
  total: number;
}

// POST /api/todos
// Body: { title: string, priority: 'low' | 'medium' | 'high' }
// Response: Todo
export interface CreateTodoRequest {
  title: string;
  priority: TodoPriority;
}

// PATCH /api/todos/:id
// Body: { title: string, completed: boolean, priority?: 'low' | 'medium' | 'high' }
// Response: Todo
export interface UpdateTodoRequest {
  title?: string;
  completed?: boolean;
  priority?: TodoPriority;
}

// DELETE /api/todos/:id
// Response: { success: boolean }
export interface DeleteTodoResponse {
  success: boolean;
}

// POST /api/todos/batch
// Body: { ids: string[], action: 'complete' | 'delete' | 'update', data?: any }
// Response: { success: boolean, updated: Todo[] }
export interface BatchUpdateRequest {
  ids: string[];
  action: 'complete' | 'delete' | 'update';
  data?: Partial<UpdateTodoRequest>[];
}

export interface BatchUpdateResponse {
  success: boolean;
  updated: Todo[];
}

export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: TodoPriority;
  createdAt: string;
  updatedAt: string;
}
