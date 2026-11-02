import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../../../mocks/server.ts';
import { todosDb } from '../../../mocks/todosDb.ts';
import { renderWithProviders, screen, waitFor } from '../../../test/render.tsx';
import { useCreateTodo, useTodos } from './queries.ts';

function Harness() {
  const todos = useTodos();
  const createMutation = useCreateTodo();

  return (
    <div>
      <button
        type="button"
        onClick={() => createMutation.mutate({ title: 'New' })}
      >
        create
      </button>
      {createMutation.isError ? <p>create failed</p> : null}
      {todos.isPending ? <p>loading</p> : null}
      <ul>
        {todos.data?.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}

describe('useTodos', () => {
  it('loads the todos from the API', async () => {
    todosDb.create('Seeded');

    renderWithProviders(<Harness />);

    expect(await screen.findByText('Seeded')).toBeInTheDocument();
  });
});

describe('useCreateTodo', () => {
  it('refetches the list after a successful create', async () => {
    const { user } = renderWithProviders(<Harness />);
    await waitFor(() => expect(screen.queryByText('loading')).toBeNull());

    await user.click(screen.getByRole('button', { name: 'create' }));

    expect(await screen.findByText('New')).toBeInTheDocument();
  });

  it('does not add the todo to the list while the request is pending', async () => {
    server.use(
      http.post('*/todos', async () => {
        await delay('infinite');
        return HttpResponse.json({});
      }),
    );
    const { user } = renderWithProviders(<Harness />);
    await waitFor(() => expect(screen.queryByText('loading')).toBeNull());

    await user.click(screen.getByRole('button', { name: 'create' }));

    expect(screen.queryByText('New')).toBeNull();
  });

  it('leaves the list unchanged and does not refetch after a failed create', async () => {
    todosDb.create('Seeded');
    let listRequests = 0;
    server.use(
      http.get('*/todos', () => {
        listRequests += 1;
        return HttpResponse.json(todosDb.list());
      }),
      http.post('*/todos', () => HttpResponse.json({}, { status: 500 })),
    );
    const { user } = renderWithProviders(<Harness />);
    await screen.findByText('Seeded');

    await user.click(screen.getByRole('button', { name: 'create' }));

    expect(await screen.findByText('create failed')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(listRequests).toBe(1);
  });
});
