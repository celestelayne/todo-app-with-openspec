import { z } from 'zod';

export const todoSchema = z.object({
  id: z.string(),
  title: z.string(),
  isCompleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Todo = z.infer<typeof todoSchema>;

export const createTodoInputSchema = z.object({
  title: z.string().trim().min(1, 'Enter a title'),
});

export type CreateTodoInput = z.infer<typeof createTodoInputSchema>;

export const updateTodoInputSchema = z.object({
  isCompleted: z.boolean(),
});

export type UpdateTodoInput = z.infer<typeof updateTodoInputSchema>;
