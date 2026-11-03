import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../../../../mocks/server.ts';
import { todosDb } from '../../../../mocks/todosDb.ts';
import { expectNoAxeViolations } from '../../../../test/axe.ts';
import {
  renderWithProviders,
  screen,
  waitFor,
  within,
} from '../../../../test/render.tsx';
import { TodoList } from '../TodoList/TodoList.tsx';

function failMessage(title: string) {
  return `Couldn't update “${title}”. Try again.`;
}

function getRow(title: string) {
  const row = screen.getByText(title).closest('li');
  if (!row) throw new Error(`No row for ${title}`);
  return row;
}

function getCheckbox(title: string) {
  return screen.getByRole('checkbox', { name: title });
}

function failUpdates(status = 500) {
  server.use(http.patch('*/todos/*', () => HttpResponse.json({}, { status })));
}

function hangUpdates() {
  server.use(
    http.patch('*/todos/*', async () => {
      await delay('infinite');
      return HttpResponse.json({});
    }),
  );
}

describe('TodoItem completion toggle', () => {
  it('completes a todo after the server confirms', async () => {
    todosDb.create('Buy milk');
    const { user } = renderWithProviders(<TodoList />);
    await screen.findByRole('checkbox', { name: 'Buy milk' });

    await user.click(getCheckbox('Buy milk'));

    await waitFor(() => expect(getCheckbox('Buy milk')).toBeChecked());
    expect(within(getRow('Buy milk')).getByText('Completed')).toBeVisible();
  });

  it('uncompletes a completed todo after the server confirms', async () => {
    const todo = todosDb.create('Buy milk');
    todosDb.update(todo.id, { isCompleted: true });
    const { user } = renderWithProviders(<TodoList />);
    await screen.findByRole('checkbox', { name: 'Buy milk' });
    expect(getCheckbox('Buy milk')).toBeChecked();

    await user.click(getCheckbox('Buy milk'));

    await waitFor(() => expect(getCheckbox('Buy milk')).not.toBeChecked());
    expect(within(getRow('Buy milk')).getByText('Not completed')).toBeVisible();
  });

  it('shows the previous state and a busy row while the request is pending', async () => {
    todosDb.create('Buy milk');
    hangUpdates();
    const { container, user } = renderWithProviders(<TodoList />);
    await screen.findByRole('checkbox', { name: 'Buy milk' });

    await user.click(getCheckbox('Buy milk'));

    expect(getCheckbox('Buy milk')).not.toBeChecked();
    expect(getRow('Buy milk')).toHaveAttribute('aria-busy', 'true');
    expect(within(getRow('Buy milk')).getByText('Not completed')).toBeVisible();
    await expectNoAxeViolations(container);
  });

  it('sends one request when activated again while pending', async () => {
    todosDb.create('Buy milk');
    let requests = 0;
    server.use(
      http.patch('*/todos/*', async () => {
        requests += 1;
        await delay('infinite');
        return HttpResponse.json({});
      }),
    );
    const { user } = renderWithProviders(<TodoList />);
    await screen.findByRole('checkbox', { name: 'Buy milk' });

    await user.click(getCheckbox('Buy milk'));
    await user.click(getCheckbox('Buy milk'));

    expect(requests).toBe(1);
  });

  it('keeps other rows usable while one row is pending', async () => {
    const pending = todosDb.create('Pending one');
    todosDb.create('Other one');
    server.use(
      http.patch('*/todos/:id', async ({ params }) => {
        if (params.id === pending.id) await delay('infinite');
        return HttpResponse.json(
          todosDb.update(String(params.id), { isCompleted: true }),
        );
      }),
    );
    const { user } = renderWithProviders(<TodoList />);
    await screen.findByRole('checkbox', { name: 'Pending one' });

    await user.click(getCheckbox('Pending one'));
    await user.click(getCheckbox('Other one'));

    await waitFor(() => expect(getCheckbox('Other one')).toBeChecked());
    expect(getRow('Pending one')).toHaveAttribute('aria-busy', 'true');
  });
});

describe('TodoItem update failure', () => {
  it('shows an alert under the row and keeps the previous state on a server error', async () => {
    todosDb.create('Buy milk');
    todosDb.create('Other one');
    failUpdates(500);
    const { container, user } = renderWithProviders(<TodoList />);
    await screen.findByRole('checkbox', { name: 'Buy milk' });

    await user.click(getCheckbox('Buy milk'));

    const alert = await within(getRow('Buy milk')).findByRole('alert');
    expect(alert).toHaveTextContent(failMessage('Buy milk'));
    expect(getCheckbox('Buy milk')).not.toBeChecked();
    expect(within(getRow('Other one')).queryByRole('alert')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('shows the same message on a network failure', async () => {
    todosDb.create('Buy milk');
    server.use(http.patch('*/todos/*', () => HttpResponse.error()));
    const { user } = renderWithProviders(<TodoList />);
    await screen.findByRole('checkbox', { name: 'Buy milk' });

    await user.click(getCheckbox('Buy milk'));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      failMessage('Buy milk'),
    );
  });

  it('shows the same message when the todo no longer exists (404)', async () => {
    todosDb.create('Buy milk');
    failUpdates(404);
    const { user } = renderWithProviders(<TodoList />);
    await screen.findByRole('checkbox', { name: 'Buy milk' });

    await user.click(getCheckbox('Buy milk'));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      failMessage('Buy milk'),
    );
  });

  it('shows the failure message and keeps the previous state for a malformed response', async () => {
    todosDb.create('Buy milk');
    server.use(http.patch('*/todos/*', () => HttpResponse.json({ id: 'x' })));
    const { user } = renderWithProviders(<TodoList />);
    await screen.findByRole('checkbox', { name: 'Buy milk' });

    await user.click(getCheckbox('Buy milk'));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      failMessage('Buy milk'),
    );
    expect(getCheckbox('Buy milk')).not.toBeChecked();
  });

  it('removes the message and shows the new state when a retry succeeds', async () => {
    todosDb.create('Buy milk');
    failUpdates(500);
    const { user } = renderWithProviders(<TodoList />);
    await screen.findByRole('checkbox', { name: 'Buy milk' });
    await user.click(getCheckbox('Buy milk'));
    await screen.findByRole('alert');

    server.resetHandlers();
    await user.click(getCheckbox('Buy milk'));

    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    await waitFor(() => expect(getCheckbox('Buy milk')).toBeChecked());
  });

  it('shows one message per failing row', async () => {
    todosDb.create('First');
    todosDb.create('Second');
    failUpdates(500);
    const { user } = renderWithProviders(<TodoList />);
    await screen.findByRole('checkbox', { name: 'First' });

    await user.click(getCheckbox('First'));
    await user.click(getCheckbox('Second'));

    await waitFor(() => expect(screen.getAllByRole('alert')).toHaveLength(2));
    expect(within(getRow('First')).getByRole('alert')).toHaveTextContent(
      failMessage('First'),
    );
    expect(within(getRow('Second')).getByRole('alert')).toHaveTextContent(
      failMessage('Second'),
    );
  });
});

describe('TodoItem accessibility', () => {
  it('toggles with Space and keeps focus on the checkbox', async () => {
    todosDb.create('Buy milk');
    const { user } = renderWithProviders(<TodoList />);
    await screen.findByRole('checkbox', { name: 'Buy milk' });

    await user.tab();
    expect(getCheckbox('Buy milk')).toHaveFocus();
    await user.keyboard(' ');

    await waitFor(() => expect(getCheckbox('Buy milk')).toBeChecked());
    expect(getCheckbox('Buy milk')).toHaveFocus();
  });

  it('has no accessibility violations in the populated state', async () => {
    todosDb.create('Buy milk');
    const done = todosDb.create('Done one');
    todosDb.update(done.id, { isCompleted: true });
    const { container } = renderWithProviders(<TodoList />);
    await screen.findByRole('checkbox', { name: 'Buy milk' });

    await expectNoAxeViolations(container);
  });
});
