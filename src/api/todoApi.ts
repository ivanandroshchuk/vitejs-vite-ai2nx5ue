import { mockApi } from './mockData';
import { BatchUpdateRequest, CreateTodoRequest, GetTodosRequest, UpdateTodoRequest } from '../types/todo';

export const todoApi = {
  async getTodos(params: GetTodosRequest = {}) {
    try {
      return await mockApi.getTodos(params);
    } catch (error) {
      throw new Error('Failed to fetch todos');
    }
  },

  async createTodo(params: CreateTodoRequest) {
    try {
      return await mockApi.createTodo(params);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Failed to create todo');
    }
  },

  async updateTodo(
    id: string,
    updates: UpdateTodoRequest
  ) {
    try {
      return await mockApi.updateTodo(id, updates);
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('Failed to update todo');
    }
  },

  async deleteTodo(id: string) {
    try {
      return await mockApi.deleteTodo(id);
    } catch (error) {
      throw new Error('Failed to delete todo');
    }
  },

  async batchUpdate(params: BatchUpdateRequest) {
    try {
      return await mockApi.batchUpdateTodos(params);
    } catch (error) {
      throw new Error('Failed to perform batch update');
    }
  },
};
