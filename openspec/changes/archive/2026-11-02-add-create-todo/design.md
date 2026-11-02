# Design

## Context

The template provides a shared `ApiClient` (`get`/`post` returning `Promise<unknown>`), `ApiClientProvider`/`useApiClient`, a `QueryProvider`, MSW wiring (`src/mocks/`, only `GET */health` today), and `renderWithProviders` in `src/test/`. There is no `src/features/` yet; `src/App.tsx` is the Vite demo. ADR-001 sets the `features/<name>/{api,components,model,store,tests}` layout and a public `index.ts` entry point enforced by `.dependency-cruiser.cjs`. ADR-003 requires feature API operations to own endpoint behavior and mocks to model the contract rather than bypass it. See proposal.md for motivation and scope.

## Goals / Non-Goals

**Goals:**

- Establish the reference pattern for a feature: model (Zod) -> api -> query/mutation hooks -> components.
- Keep the `Todo` schema and the create-input schema as the single source of truth for types, form validation, response validation, and mock handlers.

**Non-Goals:**

- No Zustand store: nothing in this slice is shared client UI state, and server data must not be duplicated there.
- No shared abstractions in `shared/` (no generic query-key factory, no generic form field component).
- No toggle/edit/delete, optimistic updates, or maximum title length.

## Decisions

**Layout.**

```
src/features/todos/
  index.ts                  public: <TodosPage />
  model/todo.ts             todoSchema, Todo, createTodoInputSchema, CreateTodoInput
  api/todosApi.ts           listTodos(client), createTodo(client, input)
  api/queries.ts            todoKeys, useTodos, useCreateTodo
  components/TodosPage.tsx
  components/CreateTodoForm.tsx (+ .module.css)
  components/TodoList.tsx       (+ .module.css)
  tests/
```

`App.tsx` renders `<TodosPage />` via the feature's `index.ts`. Alternative: keep `App.tsx` at `src/` vs. move to `src/app/App.tsx` as the architecture doc sketches. Decision: leave the file where it is; moving it is unrelated to this slice and can be a separate maintenance change.

**Schemas in `model/`.** `todoSchema` is `z.object({ id: string, title: string, isCompleted: boolean, createdAt: string, updatedAt: string })`. Timestamps stay ISO-8601 strings (validated as strings, not converted to `Date`) to avoid a serialization round trip in the cache; sorting by `createdAt` compares the ISO strings, and the format is fixed by the contract. `createTodoInputSchema` is `{ title: z.string().trim().min(1, 'Enter a title') }`. The form uses it through the Zod resolver; the MSW handler reuses it to return 400 on invalid input. Alternative: duplicate validation in the handler; rejected because it lets mock and client drift (ADR-003 risk).

**API functions take the `ApiClient`.** `todosApi.ts` exports plain functions `(client, ...)` that call `client.get('/todos')` / `client.post('/todos', input)` and parse the `unknown` result with the schema (`z.array(todoSchema)`, `todoSchema`). Hooks obtain the client with `useApiClient()`. Components never call `fetch`. Parse failures throw, so TanStack Query surfaces them as errors, satisfying the malformed-response requirement.

**Query and mutation.** Query key `['todos']`. `useCreateTodo` is a `useMutation` that, on success, invalidates `['todos']` (non-optimistic, per spec). The form awaits `mutateAsync`; on success it calls `reset()`, on failure it leaves the field value and sets a form-level error state from the mutation's `isError`. Alternative: write the returned todo into the cache with `setQueryData`; rejected because invalidation is the simpler default and keeps the server as source of truth. `useTodos` returns the validated array; newest-first sorting is derived in the component (`useMemo`/`select`), not stored and not done by the API.

**Pending and error UI.** Submit button `disabled` while `isPending`. Field error ("Enter a title") rendered with `aria-describedby` and `aria-invalid`. Failure message ("Couldn't add todo. Try again.") in an element with `role="alert"`. The list's loading state uses a status region (`role="status"`); the error state shows a message and a retry button calling `refetch`. Completion state is the text "Not completed"/"Completed" so state is never color-only. Styling uses CSS Modules and tokens from `src/styles/tokens.css`, with focus-visible styles and a 44px minimum target on the button.

**Mock backend.** `src/mocks/` gains a small in-memory store (`todosDb`) and handlers `GET */todos` and `POST */todos`. `POST` validates with `createTodoInputSchema`, returns 400 on failure, and otherwise generates `crypto.randomUUID()`, `isCompleted: false`, and one timestamp for both `createdAt` and `updatedAt` (`new Date().toISOString()`). Tests override handlers with `server.use(...)` for error, empty, malformed, and delayed cases, and reset the store in `src/test/setup.ts` `afterEach`. Store state resets on page reload in dev. Handlers use `*/todos` to match the existing `*/health` style and the configurable `VITE_API_BASE_URL`.

**Tests.** Test-first per `docs/engineering/testing.md`: schema unit tests; component/integration tests with `renderWithProviders` + MSW + `jest-axe` covering every spec scenario; one Playwright e2e that runs against `VITE_API_MODE=mock` and checks create -> appears at top, plus keyboard submission. `playwright.config.ts` already starts the dev server in mock mode (`VITE_API_MODE=mock`). `e2e/smoke.spec.ts` waits for a level-1 heading as its signal that the mock worker has started, so `TodosPage` renders an h1 "Todo List" and the smoke tests stay unchanged.

## Risks / Trade-offs

- [Mock contract drifts from a future real backend] -> Contract and schemas are documented in the specs; the mock reuses the same Zod schemas; ADR-003 is updated with the concrete contract.
- [Newest-first via ISO string comparison relies on a uniform timestamp format] -> The `todoSchema` may constrain the format; if a backend returns offsets, sorting would need to parse dates. Mock timestamps equal for same-millisecond creates, so ties keep response order; tests use distinct timestamps.
- [Duplicate submissions via fast double-activation] -> The disabled submit button also blocks implicit Enter submission, so no separate `isPending` guard is needed; covered by a test that presses Enter twice.
- [Replacing the demo `App.tsx` removes the only existing render surface] -> The existing `api-boundary.test.tsx` and `smoke.spec.ts` are checked for dependencies on demo content before removal; unused demo assets and `App.css` are removed only if nothing else references them.
- [Newest-first ordering and the 'Not completed' wording are product decisions] -> Both were confirmed in exploration; flagged in the specs so they can be revisited.
