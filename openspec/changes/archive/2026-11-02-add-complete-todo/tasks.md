# Tasks

## 1. Update contract: model, mock, and API

- [x] 1.1 Write failing unit tests for `updateTodoInputSchema` (accepts `{ isCompleted: true|false }`, rejects missing or non-boolean), then add it and `UpdateTodoInput` to `src/features/todos/model/todo.ts`; verify the model tests pass
- [x] 1.2 Write failing handler tests for `PATCH */todos/:id` (updates `isCompleted`, leaves `id`, `title`, and `createdAt` unchanged, advances `updatedAt` using fake timers, 400 for an invalid body, 404 for an unknown id), then add `todosDb.update` and the handler in `src/mocks/`; verify the handler tests pass
- [x] 1.3 Write failing tests, then add `updateTodo` to `src/features/todos/api/todosApi.ts`; verify tests cover the request body being only `{ isCompleted }`, the path containing the encoded id, success parsing, a malformed response rejecting, and an error status rejecting

## 2. Update hook

- [x] 2.1 Write failing tests, then add `useUpdateTodo` to `src/features/todos/api/queries.ts` (invalidate `['todos']` on success, no cache writes); verify a successful update refetches the list with the new state, a failed update leaves the list unchanged and does not refetch, and no cache change occurs while the request is pending

## 3. Row UI

- [x] 3.1 Write failing component tests from the `todo-completion` spec for `TodoItem` and `TodoList` (complete and uncomplete, state unchanged and row `aria-busy` while pending, repeated activation sends one request, other rows stay togglable, server error, network failure, 404, and malformed response show “Couldn't update “<title>”. Try again.” as an alert, retry clears the message, two failing rows show two messages, Space toggles and focus stays on the checkbox, checkbox accessible name is the title); then extract `components/TodoItem/` with its CSS Module and render it from `TodoList`; verify the tests pass and `jest-axe` reports no violations in populated, pending, and failure states
- [x] 3.2 Update the existing `TodoList` test "provides no toggle, edit, or delete controls" to assert no edit or delete controls while each row has a checkbox, per the modified `todo-list` requirement; verify `pnpm test` passes and no other assertion was weakened
- [x] 3.3 Add a `TodosPage` integration test that toggling a todo leaves the list order unchanged; verify it passes

## 4. Browser verification

- [x] 4.1 Add a Playwright test in `e2e/` (mock mode) that creates a todo, toggles it with the keyboard, sees the state text change, and confirms focus is still on the checkbox; verify `pnpm test:e2e` passes including the existing tests
- [x] 4.2 Verify keyboard flow, visible focus, the 44px target, and a 320px viewport in the browser (a scripted Playwright check is acceptable); record results in the completion report

## 5. Docs and final checks

- [x] 5.1 Update ADR-003's implemented contract with `PATCH /todos/:id` (request, responses, 400, 404) and its status; verify the doc matches the implemented handler
- [x] 5.2 Run `pnpm check`, `pnpm architecture:check`, and `pnpm test:e2e`; verify all pass and report any not executed

## Workflow follow-up

- Commit the implementation first. Then, on the same branch and before merging, sync the specs to `openspec/specs/` and archive the change in a separate commit, as described in `docs/engineering/workflow.md`.
- Open a pull request from `add-complete-todo` into `main`, and let CI pass before merging.
