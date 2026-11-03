import { useTodos } from '../../api/queries.ts';
import { TodoItem } from '../TodoItem/TodoItem.tsx';
import styles from './TodoList.module.css';

export function TodoList() {
  const { data, isPending, isError, refetch } = useTodos();

  if (isPending) {
    return <p role="status">Loading todos</p>;
  }

  if (isError) {
    return (
      <div role="alert" className={styles.error}>
        <p>Couldn&apos;t load todos.</p>
        <button
          type="button"
          className={styles.retry}
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return <p>No todos yet</p>;
  }

  const newestFirst = data.toSorted((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <ul className={styles.list} aria-label="Todos">
      {newestFirst.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
