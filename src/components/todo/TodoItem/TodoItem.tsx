import React, { useCallback, useState } from 'react';
import { useSelector } from "react-redux";
import clsx from 'clsx';
import { Todo } from '../../../types/todo.ts';
import { useAppDispatch } from '../../../hooks/useAppDispatch.ts';
import { selectTodoById } from "../../../store/features/todos/todosSelectors.ts";
import { RootState } from "../../../store/store.ts";
import { FnPrioritySwitcherChange, PrioritySwitcher } from "../Priority/PrioritySwitcher.tsx";
import { deleteTodoOptimistically, updateTodoOptimistically } from "../../../store/features/todos/todosSlice.ts";
import styles from './TodoItem.module.css';

const isTitleValid = (value: string) =>
  value.trim().length > 0 && value.length <= 100;

interface TodoItemProps {
  todoId: Todo["id"];
}

export const TodoItemComponent: React.FC<TodoItemProps> = ({ todoId }) => {
  const dispatch = useAppDispatch();

  // Using a selector to get the Todo from the store by its ID
  // to prevent TodoList from re-rendering when the todo's values change
  const todo = useSelector((state: RootState) => selectTodoById(state, todoId));
  const { id, completed, title, priority } = todo;

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const handleTitleSave = () => {
    if (!isTitleValid(editedTitle)) return

    if (editedTitle !== title) {
      dispatch(updateTodoOptimistically({ id, updates: { title: editedTitle } }));
    }

    setIsEditing(false);
  };

  const handleInputKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleTitleSave();
    } else if (event.key === 'Escape') {
      setEditedTitle(title);
      setIsEditing(false);
    }
  };

  const handleCompletionToggle = () => {
    dispatch(updateTodoOptimistically({ id, updates: { completed: !completed } }));
  };

  const handleTodoWrapKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.target === event.currentTarget && event.key === 'Enter') {
      handleCompletionToggle();
    }
  };

  // Using useCallback because handlePriorityChange is passed to another component,
  // and the logic for using the callback may change in the component where it is passed.
  const handlePriorityChange = useCallback<FnPrioritySwitcherChange>((event, newPriority) => {
    event.stopPropagation();
    dispatch(updateTodoOptimistically({ id, updates: { priority: newPriority } }));
  }, [dispatch, id]);

  const handleTitleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditing(true);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(deleteTodoOptimistically(id));
  };

  return (
    <div
      className={styles.todoItem}
      role="button"
      tabIndex={0}
      onClick={handleCompletionToggle}
      onKeyDown={handleTodoWrapKeyPress}
    >
      <span className={styles.completedIcon}>
        {completed ? '✅' : '☑️'}
      </span>

      <PrioritySwitcher value={priority} onChange={handlePriorityChange} />

      {isEditing ? (
        <input
          type="text"
          autoFocus
          maxLength={100}
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={handleInputKeyPress}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <button
          className={clsx(styles.title, { [styles.completedTitle]: completed })}
          type="button"
          onClick={handleTitleClick}
        >
          {title}
        </button>
      )}

      <button className={styles.deleteBtn} type="button" onClick={handleDelete}>❌</button>
    </div>
  );
};

// Using React.memo to prevent unnecessary re-renders of TodoItem.
// TodoList will update when an item is deleted, triggering a re-render.
export const TodoItem = React.memo(TodoItemComponent);

TodoItem.displayName = 'TodoItem';
