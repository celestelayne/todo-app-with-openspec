import { describe, expect, it } from 'vitest';

import { createTodoInputSchema, todoSchema } from './todo.ts';

const validTodo = {
  id: 'abc',
  title: 'Buy milk',
  isCompleted: false,
  createdAt: '2026-11-02T10:00:00.000Z',
  updatedAt: '2026-11-02T10:00:00.000Z',
};

describe('todoSchema', () => {
  it('accepts a complete todo', () => {
    expect(todoSchema.parse(validTodo)).toEqual(validTodo);
  });

  it('rejects a todo missing a required field', () => {
    const { updatedAt: _omitted, ...incomplete } = validTodo;

    expect(todoSchema.safeParse(incomplete).success).toBe(false);
  });
});

describe('createTodoInputSchema', () => {
  it('accepts a title', () => {
    expect(createTodoInputSchema.parse({ title: 'Buy milk' })).toEqual({
      title: 'Buy milk',
    });
  });

  it('trims surrounding whitespace', () => {
    expect(createTodoInputSchema.parse({ title: '  Buy milk  ' })).toEqual({
      title: 'Buy milk',
    });
  });

  it('rejects an empty title with "Enter a title"', () => {
    const result = createTodoInputSchema.safeParse({ title: '' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Enter a title');
  });

  it('rejects a whitespace-only title with "Enter a title"', () => {
    const result = createTodoInputSchema.safeParse({ title: '   ' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Enter a title');
  });

  it('accepts a 300-character title (no maximum length)', () => {
    const title = 'a'.repeat(300);

    expect(createTodoInputSchema.parse({ title })).toEqual({ title });
  });
});
