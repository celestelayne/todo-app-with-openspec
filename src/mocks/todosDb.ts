import type { Todo } from '../features/todos/model/todo.ts';

let todos: Todo[] = [];

export const todosDb = {
  list(): Todo[] {
    return [...todos];
  },

  create(title: string): Todo {
    const now = new Date().toISOString();
    const todo: Todo = {
      id: crypto.randomUUID(),
      title,
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    };
    todos = [...todos, todo];
    return todo;
  },

  reset(): void {
    todos = [];
  },
};
