# Tasks

## 1. Todo model

- [x] 1.1 Write failing unit tests for `todoSchema` and `createTodoInputSchema` (valid todo, missing field, trim, empty, whitespace-only, 300-character title accepted), then implement `src/features/todos/model/todo.ts`; verify `pnpm test` passes for the model tests

## 2. Mock API and todos API functions

- [x] 2.1 Add the in-memory todos store and `GET */todos` / `POST */todos` handlers to `src/mocks/` (server generates `id`, `isCompleted: false`, timestamps; 400 on invalid input) and reset the store in `src/test/setup.ts`; verify with handler-level tests that GET returns `[]` initially, POST returns a full `Todo`, and an empty title returns 400
- [x] 2.2 Write failing tests, then implement `src/features/todos/api/todosApi.ts` (`listTodos`, `createTodo` parsing responses with the schemas); verify tests cover success, request body is only `{ title }`, and malformed responses reject

## 3. Query hooks

- [x] 3.1 Write failing tests, then implement `useTodos` and `useCreateTodo` in `src/features/todos/api/queries.ts` (key `['todos']`, invalidate on success, no optimistic update); verify that a successful create refetches the list and a failed create leaves it unchanged

## 4. Todo list UI

- [x] 4.1 Write failing component tests from the `todo-list` spec (loading, empty, populated newest first, read-only completion text, error with retry, malformed response, no mutation controls), then implement `TodoList` with CSS Module using tokens; verify tests pass and `jest-axe` reports no violations in each state

## 5. Create form UI

- [x] 5.1 Write failing component tests from the `todo-creation` spec (success and clear, Enter key, empty and whitespace validation message, trim, long title, pending disables submit and no double request, server error and network failure keep title and show `role="alert"` message, retry success clears error), then implement `CreateTodoForm` with React Hook Form + Zod resolver; verify tests pass and `jest-axe` reports no violations in idle, validation-error, and failure states

## 6. Page composition

- [x] 6.1 Implement `TodosPage` (with the "Todo List" h1), export it from `src/features/todos/index.ts`, replace the demo content in `src/App.tsx`, and remove demo assets and `App.css` only if no remaining file references them; verify with an integration test that creating a todo shows it at the top of the list and that `pnpm build` succeeds
- [x] 6.2 Confirm `TodosPage` renders a single level-1 heading "Todo List" so `e2e/smoke.spec.ts` (which waits for a level-1 heading) still passes unchanged; check `src/shared/api/api-boundary.test.tsx` for dependence on demo content; verify `pnpm test` passes without weakening any assertion

## 7. End-to-end and integration checks

- [x] 7.1 Add a Playwright test in `e2e/` (mock mode) that creates a todo via keyboard and sees it at the top of the list; verify `pnpm test:e2e` passes, including the existing smoke tests
- [x] 7.2 Manually verify keyboard flow, visible focus, and a 320px viewport in the browser; record results in the completion report
- [x] 7.3 Update ADR-003's illustrative `TodoApi` with the implemented contract (`GET /todos`, `POST /todos`), and note the feature in `docs/architecture.md` if it is inaccurate; verify docs match the code
- [x] 7.4 Run `pnpm check`, `pnpm architecture:check`, and `pnpm test:e2e`; verify all pass and report any not executed

## Workflow follow-up

- Archive the change after human review of the implemented behavior.
