import { afterEach, describe, expect, it, vi } from 'vitest';

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

function patchTodo(id: string, body: unknown) {
  return fetch(`${todosUrl}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function createTodoViaApi(title: string) {
  return todoSchema.parse(await (await postTodo({ title })).json());
}

describe('PATCH /todos/:id', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('updates isCompleted, keeps id, title, and createdAt, and advances updatedAt', async () => {
    vi.useFakeTimers({
      toFake: ['Date'],
      now: new Date('2026-11-02T10:00:00.000Z'),
    });
    const created = await createTodoViaApi('Buy milk');
    vi.setSystemTime(new Date('2026-11-02T10:00:05.000Z'));

    const response = await patchTodo(created.id, { isCompleted: true });

    expect(response.status).toBe(200);
    const updated = todoSchema.parse(await response.json());
    expect(updated).toEqual({
      ...created,
      isCompleted: true,
      updatedAt: '2026-11-02T10:00:05.000Z',
    });
  });

  it('can set isCompleted back to false', async () => {
    const created = await createTodoViaApi('Buy milk');
    await patchTodo(created.id, { isCompleted: true });

    const response = await patchTodo(created.id, { isCompleted: false });

    expect(todoSchema.parse(await response.json()).isCompleted).toBe(false);
  });

  it('is reflected by GET /todos', async () => {
    const created = await createTodoViaApi('Buy milk');
    await patchTodo(created.id, { isCompleted: true });

    const todos = await (await fetch(todosUrl)).json();

    expect(todos).toHaveLength(1);
    expect(todos[0].isCompleted).toBe(true);
  });

  it('responds 400 for an invalid body', async () => {
    const created = await createTodoViaApi('Buy milk');

    const response = await patchTodo(created.id, { isCompleted: 'yes' });

    expect(response.status).toBe(400);
  });

  it('responds 404 for an unknown id', async () => {
    const response = await patchTodo('does-not-exist', { isCompleted: true });

    expect(response.status).toBe(404);
  });
});
