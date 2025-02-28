import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../../../store/store.ts';
import { selectTodoIds, selectTodosError, selectTodosStatus } from '../../../store/features/todos/todosSelectors.ts';
import { TodoItem } from '../TodoItem/TodoItem';
import { Loader } from '../../common/Loading/Loader.tsx';
import { Error } from '../../common/Error/Error.tsx';
import styles from './TodoList.module.css';

const selectors = (state: RootState) => ({
  todoIds: selectTodoIds(state),
  status: selectTodosStatus(state),
  error: selectTodosError(state),
});


export const TodoList: React.FC = () => {
  // Using a single selector to reduces state checks and avoids unnecessary re-renders by combining multiple selectors into one
  // The selectors function always returns a new object, shallowEqual ensures that the component only re-renders if the actual values change
  const { todoIds, status, error } = useSelector(selectors, shallowEqual);

  if (status === 'loading') return <Loader className={styles.loader} />;
  if (status === 'failed') return <Error message={error} />;

  return (
    <div className={styles.list}>
      {!todoIds.length ? (
        <p>No todos!</p>
      ) : (
        todoIds.map(id => (
          <TodoItem key={id} todoId={id} />
        ))
      )}
    </div>
  );
};
