import { CreateTodoForm } from '../CreateTodo/CreateTodoForm.tsx';
import { TodoList } from '../TodoList/TodoList.tsx';
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
