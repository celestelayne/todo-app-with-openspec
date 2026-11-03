import { useUpdateTodo } from '../../api/queries.ts';
import type { Todo } from '../../model/todo.ts';
import styles from './TodoItem.module.css';

export function TodoItem({ todo }: { todo: Todo }) {
  const { mutate, isPending, isError } = useUpdateTodo();

  function handleChange() {
    if (isPending) return;
    mutate({ id: todo.id, input: { isCompleted: !todo.isCompleted } });
  }

  return (
    <li className={styles.item} aria-busy={isPending || undefined}>
      <label className={styles.label}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={todo.isCompleted}
          onChange={handleChange}
        />
        {todo.title}
      </label>
      <span className={styles.state}>
        {todo.isCompleted ? 'Completed' : 'Not completed'}
      </span>
      {isError ? (
        <p role="alert" className={styles.message}>
          Couldn&apos;t update “{todo.title}”. Try again.
        </p>
      ) : null}
    </li>
  );
}
