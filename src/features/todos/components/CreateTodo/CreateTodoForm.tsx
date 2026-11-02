import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { useForm } from 'react-hook-form';

import { useCreateTodo } from '../../api/queries.ts';
import {
  createTodoInputSchema,
  type CreateTodoInput,
} from '../../model/todo.ts';
import styles from './CreateTodoForm.module.css';

export function CreateTodoForm() {
  const inputId = useId();
  const errorId = useId();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTodoInput>({
    resolver: zodResolver(createTodoInputSchema),
    defaultValues: { title: '' },
  });
  const { mutateAsync, isPending, isError } = useCreateTodo();

  async function onSubmit(input: CreateTodoInput) {
    try {
      await mutateAsync(input);
      reset();
    } catch {
      // Surfaced to the user through the mutation's error state.
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor={inputId}>Title</label>
      <div className={styles.row}>
        <input
          id={inputId}
          type="text"
          className={styles.input}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? errorId : undefined}
          {...register('title')}
        />
        <button type="submit" className={styles.button} disabled={isPending}>
          Add todo
        </button>
      </div>
      {errors.title ? (
        <p id={errorId} className={styles.message}>
          {errors.title.message}
        </p>
      ) : null}
      {isError ? (
        <p role="alert" className={styles.message}>
          Couldn&apos;t add todo. Try again.
        </p>
      ) : null}
    </form>
  );
}
