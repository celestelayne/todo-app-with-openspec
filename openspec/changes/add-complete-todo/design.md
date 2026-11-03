# Design

## Context

The create slice (see `openspec/specs/todo-creation` and `todo-list`) left `isCompleted` and `updatedAt` on every `Todo` but nothing writes them. `TodoList` renders each row inline as a title and a state text, and a test asserts no buttons or checkboxes exist. `ApiClient` already has `patch()`. The mock store (`src/mocks/todosDb.ts`) only supports list and create. Server state is owned by TanStack Query (ADR-002). Components live in per-component folders under `src/features/todos/components/`. See proposal.md for motivation and scope.

## Goals / Non-Goals

**Goals:**

- Add the update half of the Todo API contract (`PATCH /todos/:id`) using the existing model, API, hook, and component layering.
- Keep the same non-optimistic, invalidate-on-success mutation pattern as create.
- Give each row its own pending and error state.

**Non-Goals:**

- Optimistic updates, rollback, or race handling between concurrent toggles. A deliberate choice made while scoping this change: the pattern stays identical to create, and the race analysis does not apply because nothing is written to the cache until the server responds.
- Editing titles, deleting, bulk actions, filtering, or reordering.
- A generic mutation or error-message abstraction in `shared/`.

## Decisions

**Extract `TodoItem`.** Add `components/TodoItem/TodoItem.tsx` (+ CSS Module and test) rendering one `<li>`. `TodoList` keeps loading, error, empty, and sorting logic and maps todos to `<TodoItem todo={todo} />`. Each `TodoItem` calls the update hook itself, so mutation state (pending, error) is naturally per row. Alternative: keep rows inline in `TodoList` and track pending and error per id in a map in the list. Rejected: it duplicates what a per-row `useMutation` already provides and complicates the list.

**Model and API.** `model/todo.ts` gains `updateTodoInputSchema = z.object({ isCompleted: z.boolean() })` and `UpdateTodoInput`, matching the `UpdateTodoInput` named in ADR-003. `api/todosApi.ts` gains `updateTodo(client, id, input)`, which calls `client.patch('/todos/' + encodeURIComponent(id), input)` and parses the result with `todoSchema`. Schema parse failures throw, which surfaces as a failed mutation (spec: malformed response is a failed update).

**Hook.** `useUpdateTodo()` in `api/queries.ts` is a `useMutation` taking `{ id, input }`, with `onSuccess` invalidating `todoKeys.all`. No `onMutate`, no cache writes, no rollback.

**Row behavior.** The checkbox is controlled: `checked={todo.isCompleted}`, so it always shows the last server-confirmed state. `onChange` calls `mutate` unless the row's mutation is pending, so repeated activation sends no second request. The checkbox is not `disabled` while pending, because a focused element that becomes disabled loses keyboard focus; instead the `<li>` carries `aria-busy` while pending, with the same reduced opacity the create form's disabled button uses. Calling `mutate` again on the same row resets that mutation's error state, which clears the message on the next attempt. Rows keep `key={todo.id}`, and sorting is by `createdAt`, so toggling neither remounts nor reorders a row and focus stays on the checkbox.

**Accessible name and failure message.** The checkbox is wrapped in a `<label>` whose text is the title, giving it the title as its accessible name with a hit area of at least 44px. The "Completed" / "Not completed" text stays outside the label so it does not change the accessible name. The failure message is a `<p role="alert">` rendered inside the same row after the controls, with the text "Couldn't update “<title>”. Try again." (curly quotes), for any error kind including network, 4xx, 5xx, and malformed response.

**Mock backend.** `todosDb.update(id, patch)` returns the updated todo or `undefined` for an unknown id and sets `updatedAt` to `new Date().toISOString()`. `PATCH */todos/:id` validates the body with `updateTodoInputSchema` (400 on failure), responds 404 for an unknown id, and otherwise returns the updated todo with 200. Handlers reuse the schema so mock and client cannot drift (ADR-003).

**Existing test and spec change.** The `TodoList` test "provides no toggle, edit, or delete controls" encodes the old requirement. It is changed to assert no edit or delete controls while a checkbox now exists per row. This follows the approved MODIFIED requirement; it is not a weakened assertion. The delta keeps the scenario heading "No mutation controls" so the MODIFIED block carries every scenario of the original requirement.

**Tests.** Test-first per `docs/engineering/testing.md`: schema, API, handler, hook, `TodoItem`/`TodoList` component tests with `jest-axe` in populated, pending, and failure states, a page-level test that toggling does not reorder, and a Playwright test that toggles with Space and checks focus stays on the checkbox. Pending states use `delay('infinite')` MSW handlers, as in the create tests.

## Risks / Trade-offs

- [Toggle feels slow on a slow network because nothing changes until the server responds] -> Accepted for consistency with create; `aria-busy` and reduced opacity show pending. Revisit optimistic updates only if latency proves to matter, and then as its own change with its own race handling.
- [Same-millisecond updates leave `updatedAt` equal to the old value in the mock] -> Mock tests use fake timers to assert `updatedAt` advances; they do not rely on wall-clock difference.
- [Controlled checkbox with no immediate change may look unresponsive] -> Pending is announced through `aria-busy`; a visible pending style reuses the existing disabled-opacity convention instead of introducing new design.
- [Keeping the scenario name "No mutation controls" is slightly imprecise now that a toggle is a mutation] -> Its body states "no edit or delete control"; the name is kept only so the MODIFIED delta stays a complete copy of the original requirement's scenarios.
