import { describe, expect, it } from 'vitest';

import { todoSchema } from '../features/todos/model/todo.ts';

const todosUrl = 'http://localhost:3000/todos';

function postTodo(body: unknown) {
  return fetch(todosUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('todos mock handlers', () => {
  it('POST /todos returns a full todo with server-assigned fields', async () => {
    const response = await postTodo({ title: 'Buy milk' });

    expect(response.status).toBe(201);
    const todo = todoSchema.parse(await response.json());
    expect(todo.title).toBe('Buy milk');
    expect(todo.isCompleted).toBe(false);
    expect(todo.id).not.toBe('');
    expect(todo.createdAt).toBe(todo.updatedAt);
  });

  it('POST /todos trims the title', async () => {
    const response = await postTodo({ title: '  Buy milk  ' });

    expect(todoSchema.parse(await response.json()).title).toBe('Buy milk');
  });

  it('POST /todos responds 400 for an empty title', async () => {
    const response = await postTodo({ title: '   ' });

    expect(response.status).toBe(400);
  });

  it('GET /todos returns an empty list when nothing has been created', async () => {
    const response = await fetch(todosUrl);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });

  it('GET /todos returns todos that have been created', async () => {
    await postTodo({ title: 'Buy milk' });

    const todos = await (await fetch(todosUrl)).json();

    expect(todos).toHaveLength(1);
    expect(todos[0].title).toBe('Buy milk');
  });
});
