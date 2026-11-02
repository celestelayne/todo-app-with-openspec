import { CreateTodoForm } from './CreateTodoForm.tsx';
import { TodoList } from './TodoList.tsx';
import styles from './TodosPage.module.css';

export function TodosPage() {
  return (
    <main className={styles.page}>
      <h1>Todo List</h1>
      <CreateTodoForm />
      <TodoList />
    </main>
  );
}
