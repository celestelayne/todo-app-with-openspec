import { z } from 'zod';

import type { ApiClient } from '../../../shared/api/ApiClient.ts';
import {
  todoSchema,
  type CreateTodoInput,
  type Todo,
  type UpdateTodoInput,
} from '../model/todo.ts';

const todoListSchema = z.array(todoSchema);

export async function listTodos(
  client: ApiClient,
  options?: { signal?: AbortSignal },
): Promise<Todo[]> {
  return todoListSchema.parse(await client.get('/todos', options));
}

export async function createTodo(
  client: ApiClient,
  input: CreateTodoInput,
): Promise<Todo> {
  return todoSchema.parse(await client.post('/todos', input));
}

export async function updateTodo(
  client: ApiClient,
  id: string,
  input: UpdateTodoInput,
): Promise<Todo> {
  return todoSchema.parse(
    await client.patch(`/todos/${encodeURIComponent(id)}`, input),
  );
}
