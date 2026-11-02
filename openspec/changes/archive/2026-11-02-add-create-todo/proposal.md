# Proposal

## Why

The repository is a template whose architecture (feature modules, TanStack Query, React Hook Form + Zod, shared API client, MSW) has not yet been exercised by a real feature. The Todo app is meant to validate those decisions. Creating a todo and seeing it appear is the smallest end-to-end slice that proves the full loop: form, validation, mutation, API boundary, mock backend, cache invalidation, and rendered server state.

## What Changes

- Add a `todos` feature module with a `Todo` domain type: `{ id, title, isCompleted, createdAt, updatedAt }`, validated at runtime with Zod.
- Add a create-todo form that accepts a `title` (trimmed, required, no maximum length) and submits non-optimistically. While pending the submit control is disabled. On failure an inline, announced error is shown and the typed title is preserved.
- Add a minimal read-only todo list, newest first, with loading, empty, error (with retry), and populated states. `isCompleted` is displayed as read-only text, not color alone. There is no toggle, edit, or delete.
- Define the API contract used by the slice: `GET /todos` returns `Todo[]`; `POST /todos` accepts `{ title }` and returns the created `Todo`. The server owns `id`, `isCompleted` (initially `false`), `createdAt`, and `updatedAt`.
- Add MSW handlers (in-memory store, reset between tests) that model this contract, including failure paths.
- Replace the Vite demo content of `src/App.tsx` with the todos page. This is a visible change to the app shell.
- Add unit, component/integration, accessibility, and Playwright e2e coverage.

Out of scope: toggle, edit, delete, persistence beyond the mock, pagination, filtering, optimistic updates, a maximum title length.

## Capabilities

### New Capabilities

- `todo-creation`: Entering a title and creating a todo, including validation, pending state, and failure handling.
- `todo-list`: Viewing the collection of todos as read-only server state, including ordering and loading, empty, and error states.

### Modified Capabilities

(none; no specs exist yet)

## Impact

- New code: `src/features/todos/` (api, components, model, tests) and a public `index.ts` entry point.
- Changed code: `src/App.tsx` (and removal of the demo-only `App.css` usage); `src/mocks/handlers.ts` (new handlers and a resettable store); `src/test/` setup if the mock store needs resetting.
- Docs: ADR-003's illustrative `TodoApi` is refined by this contract; `docs/architecture.md` may need a note once the feature lands.
- No new dependencies. No backend. Verification includes `pnpm check`, `pnpm architecture:check`, and `pnpm test:e2e`.
