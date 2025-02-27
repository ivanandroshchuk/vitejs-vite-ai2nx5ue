import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { TodoItem } from '../TodoItem/TodoItem';
import styles from './TodoList.module.css';

export const TodoList: React.FC = () => {
  const { items, status } = useSelector((state: RootState) => state.todos);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'failed') return <div>Error loading todos</div>;
  return (
    <ul>
      {items.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
};
