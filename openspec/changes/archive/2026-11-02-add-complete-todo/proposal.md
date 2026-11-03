# Proposal

## Why

The create slice shipped `isCompleted` and `updatedAt` on every todo, but nothing can change them, and the approved `todo-list` spec explicitly forbids a toggle control. Completing a todo is the core purpose of a todo list and the first slice that updates existing server state. It validates the update half of the API contract and the mutation-then-invalidate pattern against an existing resource.

## What Changes

- Add a checkbox to each todo row, named by the todo's title, that toggles `isCompleted` in both directions (complete and uncomplete).
- Add `PATCH /todos/:id` with body `{ isCompleted }`. It returns the updated `Todo`, and the server sets `updatedAt`. An unknown id returns 404 and an invalid body returns 400.
- Update non-optimistically, consistent with create: the row keeps its last server-confirmed state until the server responds, shows a pending state meanwhile, and ignores further activations while pending. On success the list is refetched.
- On failure, show a per-row inline `role="alert"` message ("Couldn't update “<title>”. Try again."). The row stays in its last confirmed state, and the message clears on the next attempt on that row.
- **MODIFIED** the `todo-list` requirement "Read-only completion state": it no longer forbids a toggle. Edit and delete controls remain forbidden. The requirement is renamed to "Completion state display" because it is no longer read-only.
- Extract a `TodoItem` component from `TodoList` so each row owns its own mutation state.
- Add MSW `PATCH` handler and store update, component, hook, API, and Playwright e2e coverage.

Out of scope: editing titles, deleting todos, bulk actions, filtering by completion, reordering, and optimistic updates.

## Capabilities

### New Capabilities

- `todo-completion`: Toggling a todo's completed state from the list, including pending behavior, failure feedback, and accessibility of the control.

### Modified Capabilities

- `todo-list`: The requirement "Read-only completion state" is renamed to "Completion state display" and no longer bans a toggle control. Edit and delete remain forbidden.

## Impact

- New code: `TodoItem` component, `updateTodo` API function, `useUpdateTodo` hook, `updateTodoInputSchema` in `src/features/todos/`.
- Changed code: `TodoList` (renders `TodoItem`), `src/mocks/` (`PATCH` handler and `todosDb.update`), and the existing `TodoList` test that asserts no controls.
- Docs: ADR-003's implemented contract gains the `update` operation.
- No new dependencies and no backend. Verification includes `pnpm check`, `pnpm architecture:check`, and `pnpm test:e2e`.
