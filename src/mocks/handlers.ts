import { http, HttpResponse } from 'msw';

import { createTodoInputSchema } from '../features/todos/model/todo.ts';
import { todosDb } from './todosDb.ts';

export const handlers = [
  http.get('*/health', () => HttpResponse.json({ status: 'ok' })),

  http.get('*/todos', () => HttpResponse.json(todosDb.list())),

  http.post('*/todos', async ({ request }) => {
    const input = createTodoInputSchema.safeParse(
      await request.json().catch(() => undefined),
    );
    if (!input.success) {
      return HttpResponse.json(
        { message: input.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      );
    }
    return HttpResponse.json(todosDb.create(input.data.title), {
      status: 201,
    });
  }),
];
