import { createAsyncThunk, createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';
import debounce from 'lodash.debounce';
import omitBy from 'lodash.omitby';
import pick from 'lodash.pick';
import isNil from 'lodash.isnil';
import { Todo } from '../../../types/todo';
import { todoApi } from '../../../api/todoApi';
import { AppDispatch, RootState } from "../../store.ts";

// Create an entity adapter for normalized todos state.
export const todosAdapter = createEntityAdapter<Todo>();

interface UpdateTodoPayload {
  id: Todo['id'];
  updates: Partial<Todo>;
}

type Status = 'idle' | 'loading' | 'failed'

interface TodosState {
  status: Status;
  error?: string | null;
  pendingChanges: Record<Todo['id'], Partial<Todo> & { timestamp: number }>;
  // Used to store values that have been changed but not yet saved to the server.
  pendingDeletions: Todo['id'][];
  // Used to store the IDs of todos that are being saved,
  // so if a todo is modified during the saving process, the saved data is not applied
  batchingTodos: Todo['id'][] | null;
  updateStatus: Status;
  deleteStatus: Status;
}

const initialState = todosAdapter.getInitialState<TodosState>({
  status: 'idle',
  pendingChanges: {},
  pendingDeletions: [],
  batchingTodos: [],
  updateStatus: 'idle',
  deleteStatus: 'idle',
});

export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  todoApi.getTodos
);

export const addTodo = createAsyncThunk(
  'todos/addTodo',
  todoApi.createTodo
);

export const batchUpdateTodos = createAsyncThunk<
  { ids: Todo['id'][]; updated: Todo[] },
  void,
  { state: RootState }
>(
  'todos/batchUpdateTodos',
  async (_, { getState }) => {
    const { todos: { pendingChanges } } = getState();

    const ids = Object.keys(pendingChanges);

    if (ids.length) {
      const { updated } = await todoApi.batchUpdate({
        action: 'update',
        ids: ids,
        data: ids.map((key) => {
          return omitBy(pick(pendingChanges[key], ['completed', 'priority', 'title']), isNil);
        }),
      });

      return { ids, updated };
    }

    return { ids: [], updated: [] };
  }
);

export const batchDeleteTodos = createAsyncThunk<
  Todo['id'][],
  void,
  { state: RootState }
>(
  'todos/batchDeleteTodos',
  async (_, { getState }) => {
    const { todos: { pendingDeletions: ids } } = getState();

    if (ids.length) {
      await todoApi.batchUpdate({ action: 'delete', ids });

      return ids;
    }

    return [];
  }
);

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    optimisticUpdateTodo: (state, { payload: { id, updates } }: PayloadAction<UpdateTodoPayload>) => {
      state.pendingChanges[id] = {
        ...state.pendingChanges[id],
        ...updates,
        timestamp: Date.now()
      };

      // if a todo is modified during the saving process, the saved data is not applied
      if (state.batchingTodos) {
        const batchingTodosIdsSet = new Set(state.batchingTodos);

        if (batchingTodosIdsSet.has(id)) {
          batchingTodosIdsSet.delete(id);
          state.batchingTodos = Array.from(batchingTodosIdsSet);
        }
      }
    },
    optimisticDeleteTodo: (state, { payload: id }: PayloadAction<string>) => {
      todosAdapter.removeOne(state, id);
      delete state.pendingChanges[id];
      state.pendingDeletions.push(id);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action: PayloadAction<{ todos: Todo[]; total: number }>) => {
        state.status = 'idle';
        todosAdapter.setAll(state, action.payload.todos);
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      .addCase(addTodo.fulfilled, (state, action: PayloadAction<Todo>) => {
        state.status = 'idle';
        todosAdapter.addOne(state, action.payload);
      })


      .addCase(batchUpdateTodos.pending, (state) => {
        state.updateStatus = 'loading';
        state.batchingTodos = Object.keys(state.pendingChanges);
      })
      .addCase(batchUpdateTodos.fulfilled, (state, { payload: { updated } }) => {
        const batchingTodosIdsSet = new Set(state.batchingTodos);

        updated.forEach((serverTodo) => {
          if (batchingTodosIdsSet.has(serverTodo.id) || !state.pendingChanges[serverTodo.id]) return;

          todosAdapter.updateOne(state, {
            id: serverTodo.id,
            changes: serverTodo
          });

          delete state.pendingChanges[serverTodo.id];
        });

        state.batchingTodos = null;
        state.updateStatus = 'idle';
      })
      .addCase(batchUpdateTodos.rejected, (state) => {
        state.updateStatus = 'failed';
        state.batchingTodos = null;
      })

      .addCase(batchDeleteTodos.pending, (state) => {
        state.deleteStatus = 'loading';
      })
      .addCase(batchDeleteTodos.fulfilled, (state, { payload: ids }) => {
        const idsToDelete = new Set(ids);
        state.pendingDeletions = state.pendingDeletions.filter(id => !idsToDelete.has(id));
        state.deleteStatus = 'idle';
      })
      .addCase(batchDeleteTodos.rejected, (state) => {
        state.deleteStatus = 'failed';
      });
  },
});

export default todosSlice.reducer;

const { optimisticUpdateTodo, optimisticDeleteTodo } = todosSlice.actions;

const SAVE_DEBOUNCE_DELAY_MS = 1000;

// Debounce is used to batch requests, reducing the number of API calls
// Using THE debounce in the store is absolutely fine as it helps batch frequent updates, and separates logic from components.
const debouncedBatchUpdate = debounce(
  (dispatch: AppDispatch) => dispatch(batchUpdateTodos()),
  SAVE_DEBOUNCE_DELAY_MS
);

const debouncedBatchDelete = debounce(
  (dispatch: AppDispatch) => dispatch(batchDeleteTodos()),
  SAVE_DEBOUNCE_DELAY_MS
);

export const updateTodoOptimistically = (todo: UpdateTodoPayload) => (
  dispatch: AppDispatch,
) => {
  dispatch(optimisticUpdateTodo(todo));
  debouncedBatchUpdate(dispatch);
};

export const deleteTodoOptimistically = (id: Todo['id']) => (
  dispatch: AppDispatch,
) => {
  dispatch(optimisticDeleteTodo(id));
  debouncedBatchDelete(dispatch);
};