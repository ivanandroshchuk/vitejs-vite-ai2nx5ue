import { TodoForm } from './components/todo/TodoForm/TodoForm';
import { TodoList } from './components/todo/TodoList/TodoList';
import { StatusIndicator } from "./components/todo/StatusIndicator/StatusIndicator.tsx";
import { Filter } from "./components/todo/Filter/Filter.tsx";
import styles from './App.module.css';

function App() {
  return (
    <main className={styles.main}>
      <TodoForm />

      <StatusIndicator />

      <Filter />

      <TodoList />
    </main>
  );
}

export default App;
