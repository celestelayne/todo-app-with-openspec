import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../../../mocks/server.ts';
import { createFetchApiClient } from '../../../shared/api/FetchApiClient.ts';
import { createTodo, listTodos } from './todosApi.ts';

const client = createFetchApiClient({ baseUrl: 'http://localhost:3000' });

const validTodo = {
  id: 'abc',
  title: 'Buy milk',
  isCompleted: false,
  createdAt: '2026-11-02T10:00:00.000Z',
  updatedAt: '2026-11-02T10:00:00.000Z',
};

describe('listTodos', () => {
  it('returns the validated todos from GET /todos', async () => {
    server.use(http.get('*/todos', () => HttpResponse.json([validTodo])));

    await expect(listTodos(client)).resolves.toEqual([validTodo]);
  });

  it('rejects when an item is missing required fields', async () => {
    server.use(
      http.get('*/todos', () => HttpResponse.json([{ id: 'abc', title: 'x' }])),
    );

    await expect(listTodos(client)).rejects.toThrow();
  });

  it('rejects when the response is not an array', async () => {
    server.use(http.get('*/todos', () => HttpResponse.json({ todos: [] })));

    await expect(listTodos(client)).rejects.toThrow();
  });
});

describe('createTodo', () => {
  it('sends only the title and returns the validated created todo', async () => {
    let requestBody: unknown;
    server.use(
      http.post('*/todos', async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(validTodo, { status: 201 });
      }),
    );

    await expect(createTodo(client, { title: 'Buy milk' })).resolves.toEqual(
      validTodo,
    );
    expect(requestBody).toEqual({ title: 'Buy milk' });
  });

  it('rejects when the created todo is malformed', async () => {
    server.use(
      http.post('*/todos', () =>
        HttpResponse.json({ id: 'abc' }, { status: 201 }),
      ),
    );

    await expect(createTodo(client, { title: 'Buy milk' })).rejects.toThrow();
  });

  it('rejects when the server responds with an error status', async () => {
    server.use(
      http.post('*/todos', () => HttpResponse.json({}, { status: 500 })),
    );

    await expect(createTodo(client, { title: 'Buy milk' })).rejects.toThrow();
  });
});
