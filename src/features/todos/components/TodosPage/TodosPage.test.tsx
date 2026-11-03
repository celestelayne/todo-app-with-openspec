import { describe, expect, it } from 'vitest';

import { todosDb } from '../../../../mocks/todosDb.ts';
import { expectNoAxeViolations } from '../../../../test/axe.ts';
import {
  renderWithProviders,
  screen,
  within,
  waitFor,
} from '../../../../test/render.tsx';
import { TodosPage } from './TodosPage.tsx';

describe('TodosPage', () => {
  it('shows a single "Todo List" heading, the title input, and the list', async () => {
    renderWithProviders(<TodosPage />);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Todo List',
    );
    expect(screen.getByRole('textbox', { name: 'Title' })).toBeInTheDocument();
    expect(await screen.findByText('No todos yet')).toBeInTheDocument();
  });

  it('shows a newly created todo at the top of the list without a reload', async () => {
    todosDb.create('First');
    await new Promise((resolve) => setTimeout(resolve, 5));
    const { user } = renderWithProviders(<TodosPage />);
    await screen.findByText('First');

    await user.type(
      screen.getByRole('textbox', { name: 'Title' }),
      'Second{Enter}',
    );

    await screen.findByText('Second');
    const items = screen.getAllByRole('listitem');
    expect(within(items[0]!).getByText('Second')).toBeInTheDocument();
    expect(within(items[0]!).getByText('Not completed')).toBeInTheDocument();
    expect(within(items[1]!).getByText('First')).toBeInTheDocument();
  });

  it('has no accessibility violations once loaded', async () => {
    const { container } = renderWithProviders(<TodosPage />);
    await screen.findByText('No todos yet');

    await expectNoAxeViolations(container);
  });

  it('keeps the list order unchanged when a todo is toggled', async () => {
    todosDb.create('First');
    await new Promise((resolve) => setTimeout(resolve, 5));
    todosDb.create('Second');
    const { user } = renderWithProviders(<TodosPage />);
    const titlesInOrder = () =>
      screen
        .getAllByRole('listitem')
        .map(
          (item) =>
            within(item).getByRole('checkbox').closest('label')?.textContent,
        );
    await screen.findByRole('checkbox', { name: 'First' });
    expect(titlesInOrder()).toEqual(['Second', 'First']);

    await user.click(screen.getByRole('checkbox', { name: 'First' }));

    await waitFor(() =>
      expect(screen.getByRole('checkbox', { name: 'First' })).toBeChecked(),
    );
    expect(titlesInOrder()).toEqual(['Second', 'First']);
  });
});
