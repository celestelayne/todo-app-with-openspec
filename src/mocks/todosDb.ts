import type { Todo, UpdateTodoInput } from '../features/todos/model/todo.ts';

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

  update(id: string, input: UpdateTodoInput): Todo | undefined {
    const existing = todos.find((todo) => todo.id === id);
    if (!existing) return undefined;
    const updated: Todo = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    todos = todos.map((todo) => (todo.id === id ? updated : todo));
    return updated;
  },

  reset(): void {
    todos = [];
  },
};
