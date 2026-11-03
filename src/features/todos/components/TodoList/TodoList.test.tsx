import { delay, http, HttpResponse, type JsonBodyType } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../../../../mocks/server.ts';
import { expectNoAxeViolations } from '../../../../test/axe.ts';
import {
  renderWithProviders,
  screen,
  within,
} from '../../../../test/render.tsx';
import { TodoList } from './TodoList.tsx';

const older = {
  id: 'older',
  title: 'Older todo',
  isCompleted: true,
  createdAt: '2026-11-02T09:00:00.000Z',
  updatedAt: '2026-11-02T09:00:00.000Z',
};
const newer = {
  id: 'newer',
  title: 'Newer todo',
  isCompleted: false,
  createdAt: '2026-11-02T10:00:00.000Z',
  updatedAt: '2026-11-02T10:00:00.000Z',
};

function respondWith(body: JsonBodyType, status = 200) {
  server.use(http.get('*/todos', () => HttpResponse.json(body, { status })));
}

describe('TodoList', () => {
  it('shows a loading indication and no empty or error message while fetching', async () => {
    server.use(
      http.get('*/todos', async () => {
        await delay('infinite');
        return HttpResponse.json([]);
      }),
    );

    const { container } = renderWithProviders(<TodoList />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading todos');
    expect(screen.queryByText('No todos yet')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('shows "No todos yet" when the server returns no todos', async () => {
    respondWith([]);

    const { container } = renderWithProviders(<TodoList />);

    expect(await screen.findByText('No todos yet')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('lists todos newest first regardless of response order', async () => {
    respondWith([older, newer]);

    const { container } = renderWithProviders(<TodoList />);

    const items = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]!).getByText('Newer todo')).toBeInTheDocument();
    expect(within(items[1]!).getByText('Older todo')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('conveys completion state as text', async () => {
    respondWith([older, newer]);

    renderWithProviders(<TodoList />);

    const [first, second] = await screen.findAllByRole('listitem');
    expect(within(first!).getByText('Not completed')).toBeInTheDocument();
    expect(within(second!).getByText('Completed')).toBeInTheDocument();
  });

  it('provides only a completion checkbox per row and no edit or delete controls', async () => {
    respondWith([older, newer]);

    renderWithProviders(<TodoList />);

    const items = await screen.findAllByRole('listitem');
    for (const item of items) {
      expect(within(item).getAllByRole('checkbox')).toHaveLength(1);
    }
    expect(screen.queryAllByRole('button')).toEqual([]);
    expect(screen.queryAllByRole('link')).toEqual([]);
    expect(screen.queryAllByRole('textbox')).toEqual([]);
  });

  it('shows an error with a retry control when loading fails, and recovers on retry', async () => {
    respondWith({}, 500);

    const { container, user } = renderWithProviders(<TodoList />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't load todos",
    );
    await expectNoAxeViolations(container);

    respondWith([newer]);
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Newer todo')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows the error state when the response is malformed', async () => {
    respondWith([{ id: 'x', title: 'Missing fields' }]);

    renderWithProviders(<TodoList />);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
