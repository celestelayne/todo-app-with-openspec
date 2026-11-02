import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../../../mocks/server.ts';
import { todosDb } from '../../../mocks/todosDb.ts';
import { expectNoAxeViolations } from '../../../test/axe.ts';
import { renderWithProviders, screen, waitFor } from '../../../test/render.tsx';
import { CreateTodoForm } from './CreateTodoForm.tsx';

const failureMessage = "Couldn't add todo. Try again.";

function captureCreateRequests() {
  const bodies: unknown[] = [];
  server.use(
    http.post('*/todos', async ({ request }) => {
      const body = (await request.json()) as { title: string };
      bodies.push(body);
      return HttpResponse.json(todosDb.create(body.title), { status: 201 });
    }),
  );
  return bodies;
}

function getTitleInput() {
  return screen.getByRole('textbox', { name: 'Title' });
}

describe('CreateTodoForm', () => {
  it('sends the title and clears the input after a successful create', async () => {
    const bodies = captureCreateRequests();
    const { user } = renderWithProviders(<CreateTodoForm />);

    await user.type(getTitleInput(), 'Buy milk');
    await user.click(screen.getByRole('button', { name: 'Add todo' }));

    await waitFor(() => expect(getTitleInput()).toHaveValue(''));
    expect(bodies).toEqual([{ title: 'Buy milk' }]);
  });

  it('submits with the Enter key', async () => {
    const bodies = captureCreateRequests();
    const { user } = renderWithProviders(<CreateTodoForm />);

    await user.type(getTitleInput(), 'Buy milk{Enter}');

    await waitFor(() => expect(bodies).toHaveLength(1));
  });

  it('shows "Enter a title" and sends nothing for an empty title', async () => {
    const bodies = captureCreateRequests();
    const { container, user } = renderWithProviders(<CreateTodoForm />);

    await user.click(screen.getByRole('button', { name: 'Add todo' }));

    const message = await screen.findByText('Enter a title');
    expect(getTitleInput()).toHaveAccessibleDescription('Enter a title');
    expect(getTitleInput()).toBeInvalid();
    expect(message).toBeVisible();
    expect(bodies).toEqual([]);
    await expectNoAxeViolations(container);
  });

  it('shows "Enter a title" and sends nothing for a whitespace-only title', async () => {
    const bodies = captureCreateRequests();
    const { user } = renderWithProviders(<CreateTodoForm />);

    await user.type(getTitleInput(), '   {Enter}');

    expect(await screen.findByText('Enter a title')).toBeVisible();
    expect(bodies).toEqual([]);
  });

  it('trims surrounding whitespace before sending', async () => {
    const bodies = captureCreateRequests();
    const { user } = renderWithProviders(<CreateTodoForm />);

    await user.type(getTitleInput(), '  Buy milk  {Enter}');

    await waitFor(() => expect(bodies).toEqual([{ title: 'Buy milk' }]));
  });

  it('accepts a title longer than 200 characters', async () => {
    const bodies = captureCreateRequests();
    const title = 'a'.repeat(300);
    const { user } = renderWithProviders(<CreateTodoForm />);

    await user.click(getTitleInput());
    await user.paste(title);
    await user.keyboard('{Enter}');

    await waitFor(() => expect(bodies).toEqual([{ title }]));
  });

  it('disables the submit control while the request is pending', async () => {
    server.use(
      http.post('*/todos', async () => {
        await delay('infinite');
        return HttpResponse.json({});
      }),
    );
    const { user } = renderWithProviders(<CreateTodoForm />);

    await user.type(getTitleInput(), 'Buy milk{Enter}');

    expect(screen.getByRole('button', { name: 'Add todo' })).toBeDisabled();
  });

  it('sends only one request when submitted twice while pending', async () => {
    let requests = 0;
    server.use(
      http.post('*/todos', async () => {
        requests += 1;
        await delay(50);
        return HttpResponse.json(todosDb.create('Buy milk'), { status: 201 });
      }),
    );
    const { user } = renderWithProviders(<CreateTodoForm />);

    await user.type(getTitleInput(), 'Buy milk{Enter}{Enter}');

    await waitFor(() => expect(getTitleInput()).toHaveValue(''));
    expect(requests).toBe(1);
  });

  it('shows an alert and keeps the typed title when the server responds with an error', async () => {
    server.use(
      http.post('*/todos', () => HttpResponse.json({}, { status: 500 })),
    );
    const { container, user } = renderWithProviders(<CreateTodoForm />);

    await user.type(getTitleInput(), 'Buy milk{Enter}');

    expect(await screen.findByRole('alert')).toHaveTextContent(failureMessage);
    expect(getTitleInput()).toHaveValue('Buy milk');
    expect(screen.getByRole('button', { name: 'Add todo' })).toBeEnabled();
    await expectNoAxeViolations(container);
  });

  it('shows the same alert when the network request fails', async () => {
    server.use(http.post('*/todos', () => HttpResponse.error()));
    const { user } = renderWithProviders(<CreateTodoForm />);

    await user.type(getTitleInput(), 'Buy milk{Enter}');

    expect(await screen.findByRole('alert')).toHaveTextContent(failureMessage);
    expect(getTitleInput()).toHaveValue('Buy milk');
  });

  it('removes the alert and clears the input when a retry succeeds', async () => {
    server.use(
      http.post('*/todos', () => HttpResponse.json({}, { status: 500 })),
    );
    const { user } = renderWithProviders(<CreateTodoForm />);
    await user.type(getTitleInput(), 'Buy milk{Enter}');
    await screen.findByRole('alert');

    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: 'Add todo' }));

    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    expect(getTitleInput()).toHaveValue('');
  });

  it('has no accessibility violations when idle', async () => {
    const { container } = renderWithProviders(<CreateTodoForm />);

    await expectNoAxeViolations(container);
  });
});
