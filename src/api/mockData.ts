import {
  Todo,
  TodoPriority,
  CreateTodoRequest,
  UpdateTodoRequest,
  BatchUpdateRequest,
  GetTodosResponse,
  DeleteTodoResponse,
  BatchUpdateResponse,
  GetTodosRequest,
} from '../types/todo';

let todos: Todo[] = [
  {
    id: '1',
    title: 'Learn React',
    completed: false,
    priority: TodoPriority.MEDIUM,
    createdAt: '2024-02-09T10:00:00.000Z',
    updatedAt: '2024-02-09T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'Build a todo app',
    completed: true,
    priority: TodoPriority.HIGH,
    createdAt: '2024-02-09T11:00:00.000Z',
    updatedAt: '2024-02-09T15:00:00.000Z',
  },
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to generate IDs (simplified version of uuid)
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper function to sort by date
const sortByDateDescending = (a: Todo, b: Todo): number =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

// Helper functions for validation
const validateTitle = (title?: string): void => {
  if (!title) throw new Error('Title is required');
  if (title.length > 100) throw new Error('Title must be less than 100 characters');
};

const validatePriority = (priority?: TodoPriority): void => {
  if (!priority) throw new Error('Priority is required');
  if (!Object.values(TodoPriority).includes(priority)) throw new Error('Invalid priority');
};

// Mock API implementation
export const mockApi = {
  async getTodos(params: GetTodosRequest = {}): Promise<GetTodosResponse> {
    await delay(200);

    let filteredTodos = [...todos];

    // Apply search filter
    if (params.search) {
      filteredTodos = filteredTodos.filter((todo) =>
        todo.title.toLowerCase().includes(params.search!.toLowerCase())
      );
    }

    // Apply status filter
    if (params.status === 'completed') {
      filteredTodos = filteredTodos.filter((todo) => todo.completed);
    } else if (params.status === 'active') {
      filteredTodos = filteredTodos.filter((todo) => !todo.completed);
    }

    // Apply priority filter
    if (params.priority) {
      filteredTodos = filteredTodos.filter((todo) => todo.priority === params.priority);
    }

    // Apply sorting (default: createdAt, optional: priority)
    if (params.sortBy === 'priority') {
      const priorityOrder = { [TodoPriority.HIGH]: 3, [TodoPriority.MEDIUM]: 2, [TodoPriority.LOW]: 1 };

      filteredTodos.sort((a, b) => {
        const prioDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        // If priorities are equal, sort by createdAt descending
        return prioDiff === 0 ?  sortByDateDescending(a, b) : prioDiff;
      });
    } else {
      filteredTodos.sort(sortByDateDescending);
    }

    return {
      todos: filteredTodos,
      total: filteredTodos.length,
    };
  },

  async getTodoById(id: string): Promise<Todo> {
    await delay(200);
    const todo = todos.find((t) => t.id === id);
    if (!todo) throw new Error('Todo not found');
    return todo;
  },

  async createTodo({ title, priority }: CreateTodoRequest): Promise<Todo> {
    await delay(200);
    validateTitle(title);
    validatePriority(priority);

    const newTodo: Todo = {
      id: generateId(),
      title,
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    todos = [...todos, newTodo];
    return newTodo;
  },

  async updateTodo(
    id: string,
    updates: UpdateTodoRequest
  ): Promise<Todo> {
    await delay(200);

    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Todo not found');

    if ('title' in updates) validateTitle(updates.title);
    if ('priority' in updates) validatePriority(updates.priority);

    const updatedTodo: Todo = {
      ...todos[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    todos = todos.map((t) => (t.id === id ? updatedTodo : t));
    return updatedTodo;
  },

  async deleteTodo(id: string): Promise<DeleteTodoResponse> {
    await delay(200);

    const exists = todos.some((t) => t.id === id);
    if (!exists) throw new Error('Todo not found');

    todos = todos.filter((t) => t.id !== id);
    return { success: true };
  },

  async batchUpdateTodos({ ids, action, data }: BatchUpdateRequest): Promise<BatchUpdateResponse> {
    await delay(300);

    const updated: Todo[] = [];

    // Using a Set for O(1) ID existence check.
    const idsSet = new Set(ids);

    if (action === 'complete') {
      todos = todos.map((todo) => {
        if (idsSet.has(todo.id) && !todo.completed) {
          const updatedTodo = { ...todo, completed: true, updatedAt: new Date().toISOString() };

          updated.push(updatedTodo);

          return updatedTodo;
        }
        return todo;
      });
    } else if (action === 'delete') {
      todos = todos.filter((todo) => !idsSet.has(todo.id));
    } else if (action === 'update' && data) {
      const updatesMap = new Map<Todo['id'], UpdateTodoRequest>();

      ids.forEach((id, index) => {
        updatesMap.set(id, data[index]);
      });

      todos = todos.map((todo) => {
        const updateData = updatesMap.get(todo.id)

        if (updateData) {
          if ('title' in updateData) validateTitle(updateData.title);
          if ('priority' in updateData) validatePriority(updateData.priority);

          const updatedTodo = { ...todo, ...updateData, updatedAt: new Date().toISOString() };

          updated.push(updatedTodo);

          return updatedTodo;
        }

        return todo;
      });
    }

    return {
      success: true,
      updated,
    };
  },
};
