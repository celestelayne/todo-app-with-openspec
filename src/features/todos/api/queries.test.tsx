import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../../../mocks/server.ts';
import { todosDb } from '../../../mocks/todosDb.ts';
import { renderWithProviders, screen, waitFor } from '../../../test/render.tsx';
import { useCreateTodo, useTodos, useUpdateTodo } from './queries.ts';

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

function UpdateHarness() {
  const todos = useTodos();
  const updateMutation = useUpdateTodo();
  const first = todos.data?.[0];

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          first &&
          updateMutation.mutate({ id: first.id, input: { isCompleted: true } })
        }
      >
        complete
      </button>
      {updateMutation.isError ? <p>update failed</p> : null}
      <ul>
        {todos.data?.map((todo) => (
          <li key={todo.id}>
            {todo.title} {todo.isCompleted ? 'done' : 'open'}
          </li>
        ))}
      </ul>
    </div>
  );
}

describe('useUpdateTodo', () => {
  it('refetches the list with the new state after a successful update', async () => {
    todosDb.create('Seeded');
    const { user } = renderWithProviders(<UpdateHarness />);
    await screen.findByText('Seeded open');

    await user.click(screen.getByRole('button', { name: 'complete' }));

    expect(await screen.findByText('Seeded done')).toBeInTheDocument();
  });

  it('leaves the list unchanged and does not refetch after a failed update', async () => {
    todosDb.create('Seeded');
    let listRequests = 0;
    server.use(
      http.get('*/todos', () => {
        listRequests += 1;
        return HttpResponse.json(todosDb.list());
      }),
      http.patch('*/todos/*', () => HttpResponse.json({}, { status: 500 })),
    );
    const { user } = renderWithProviders(<UpdateHarness />);
    await screen.findByText('Seeded open');

    await user.click(screen.getByRole('button', { name: 'complete' }));

    expect(await screen.findByText('update failed')).toBeInTheDocument();
    expect(screen.getByText('Seeded open')).toBeInTheDocument();
    expect(listRequests).toBe(1);
  });

  it('does not change the cached list while the request is pending', async () => {
    todosDb.create('Seeded');
    let listRequests = 0;
    server.use(
      http.get('*/todos', () => {
        listRequests += 1;
        return HttpResponse.json(todosDb.list());
      }),
      http.patch('*/todos/*', async () => {
        await delay('infinite');
        return HttpResponse.json({});
      }),
    );
    const { user } = renderWithProviders(<UpdateHarness />);
    await screen.findByText('Seeded open');

    await user.click(screen.getByRole('button', { name: 'complete' }));

    expect(screen.getByText('Seeded open')).toBeInTheDocument();
    expect(listRequests).toBe(1);
  });
});
