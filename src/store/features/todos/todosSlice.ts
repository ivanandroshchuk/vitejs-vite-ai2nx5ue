import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Todo } from '../../../types/todo';
import { todoApi } from '../../../api/todoApi';

interface TodosState {
  items: Todo[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: TodosState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  return await todoApi.getTodos();
});

export const addTodo = createAsyncThunk(
  'todos/addTodo',
  async (title: string) => {
    return await todoApi.createTodo(title);
  }
);

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload.todos;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to fetch todos';
      });
  },
});

export default todosSlice.reducer;
