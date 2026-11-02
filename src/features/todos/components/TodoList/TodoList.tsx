import { useTodos } from '../../api/queries.ts';
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
        <li key={todo.id} className={styles.item}>
          <span>{todo.title}</span>
          <span className={styles.state}>
            {todo.isCompleted ? 'Completed' : 'Not completed'}
          </span>
        </li>
      ))}
    </ul>
  );
}
