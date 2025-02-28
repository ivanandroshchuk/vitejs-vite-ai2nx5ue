import { todosAdapter } from './todosSlice.ts';
import { RootState } from '../../store.ts';
import {createSelector} from "@reduxjs/toolkit";

const {
  selectById,
  selectIds,
} = todosAdapter.getSelectors((state: RootState) => state.todos);

export { selectIds as selectTodoIds };

export const selectTodosStatus = (state: RootState) => state.todos.status;
export const selectTodosError = (state: RootState) => state.todos.error;

export const selectUpdateStatus = (state: RootState) => state.todos.updateStatus;
export const selectDeleteStatus = (state: RootState) => state.todos.deleteStatus;

// Retrieving the required todo by ID for each TodoItem and merging
// the data stored on the server with the changes that have been made
// but not yet saved.
export const selectTodoById = createSelector(
  [
    (state: RootState, id: string) => selectById(state, id),
    (state: RootState) => state.todos.pendingChanges,
  ],
  (todo, pendingChanges) => {
    const pendingChange = pendingChanges[todo.id];
    return pendingChange ? { ...todo, ...pendingChange, isPending: true } : todo;
  }
);
