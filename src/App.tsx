import { useEffect, useState } from 'react';
import { TodoForm } from './components/todo/TodoForm/TodoForm';
import { TodoList } from './components/todo/TodoList/TodoList';

function App() {
  return (
    <>
      <TodoForm />
      <TodoList />
    </>
  );
}

export default App;
