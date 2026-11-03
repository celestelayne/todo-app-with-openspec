import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useApiClient } from '../../../shared/api/ApiClientContext.ts';
import type { CreateTodoInput, UpdateTodoInput } from '../model/todo.ts';
import { createTodo, listTodos, updateTodo } from './todosApi.ts';

export const todoKeys = {
  all: ['todos'] as const,
};

export function useTodos() {
  const client = useApiClient();

  return useQuery({
    queryKey: todoKeys.all,
    queryFn: ({ signal }) => listTodos(client, { signal }),
  });
}

export function useCreateTodo() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTodoInput) => createTodo(client, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todoKeys.all }),
  });
}

export function useUpdateTodo() {
  const client = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTodoInput }) =>
      updateTodo(client, id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todoKeys.all }),
  });
}
