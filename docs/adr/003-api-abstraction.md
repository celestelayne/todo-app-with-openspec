# ADR-003: API Abstraction and Backend Independence

**Status:** Accepted — Pending Validation  
**Date:** 2026-10-31  
**Decision makers:** Repository maintainers

## Context

Frontend development often becomes tightly coupled to a specific backend, API implementation, or mocking strategy.

This makes it difficult to develop and test the UI independently, reuse the application architecture, or replace a backend without modifying presentation code.

For AI-assisted engineering, a stable API boundary also limits the scope of implementation changes and allows agents to work against predictable contracts.

The template must support realistic development and testing without requiring a running backend.

## Decision

Use a typed API boundary with a replaceable HTTP transport implementation.

Feature-specific API operations will depend on the shared API client rather than making direct HTTP requests from components.

The initial implementation will use HTTP requests through `fetch`.

Mock Service Worker (MSW) will intercept those requests during local development and testing.

```text
React Components
       |
Feature Hooks
       |
TanStack Query
       |
Feature API Operations
       |
Shared HTTP Client
       |
HTTP Requests
       |
  +----+-----+
  |          |
 MSW      Real API
```

MSW and the real backend use the same application-side API contract.

### Rules

1. Components must not make direct HTTP requests.
2. Feature API operations own endpoint-specific behavior.
3. The shared HTTP client owns transport-level concerns.
4. External responses must be validated where runtime guarantees are required.
5. TanStack Query manages server-state lifecycle.
6. Mock handlers must model the API contract rather than bypass it.
7. API errors must be represented consistently.
8. Switching from MSW to a real backend must not require rewriting components or query hooks.

### Illustrative API Contract

```ts
interface TodoApi {
  list(): Promise<Todo[]>;
  create(input: CreateTodoInput): Promise<Todo>;
  update(id: string, input: UpdateTodoInput): Promise<Todo>;
  remove(id: string): Promise<void>;
}
```

The exact contract will be refined during the Todo reference implementation.

### Implemented Contract (Create, List, and Complete slices)

The implemented slices cover `list`, `create`, and `update` (completion) over HTTP. Paths are relative to `VITE_API_BASE_URL`.

| Operation | Request                              | Success response              | Failure                                            |
| --------- | ------------------------------------ | ----------------------------- | -------------------------------------------------- |
| `list`    | `GET /todos`                         | `200` with `Todo[]`           | Any non-2xx or invalid body                        |
| `create`  | `POST /todos` `{ title }`            | `201` with the `Todo`         | `400` for an invalid title                         |
| `update`  | `PATCH /todos/:id` `{ isCompleted }` | `200` with the updated `Todo` | `400` for an invalid body, `404` for an unknown id |

```ts
interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

The server owns `id`, `isCompleted` (initially `false`), `createdAt`, and `updatedAt`; when creating, the client sends only `title`. When updating, the client sends only `isCompleted`, and the server sets `updatedAt` and leaves `id`, `title`, and `createdAt` unchanged. The Zod schemas in `src/features/todos/model/todo.ts` validate every response and are reused by the MSW handlers. `update` currently supports only `isCompleted`; editing the title and `remove` remain illustrative until their slices are specified.

## Alternatives Considered

### Direct Fetch Calls in Components

**Rejected because:** Networking, presentation, and error handling become tightly coupled.

### Mock Data Imported Directly into Components

**Rejected because:** It bypasses the actual HTTP integration path and may hide loading, failure, and serialization behavior.

### Backend Required for Local Development

**Rejected because:** It prevents independent frontend development and introduces unnecessary infrastructure requirements.

### GraphQL as the Default Transport

**Not selected:** GraphQL may be appropriate for specific products, but a REST-oriented HTTP client provides a smaller, more broadly reusable starting point.

## Consequences

### Benefits

- Independent frontend development.
- Realistic HTTP mocking with MSW.
- Easier integration testing.
- Clear boundaries for AI-generated changes.
- Ability to connect to a real backend without changing presentation code.

### Tradeoffs

- Requires an additional abstraction layer.
- Mock contracts can drift from real backend behavior.
- Runtime response validation adds implementation effort.
- Authentication, retries, and error normalization require explicit policies as the application evolves.

## Validation

The Todo reference application must demonstrate:

- CRUD operations through typed API methods.
- HTTP requests intercepted by MSW.
- Loading, empty, success, and failure states.
- Integration tests exercising the complete UI-to-HTTP path.
- A documented procedure for replacing MSW with a real backend.

Mock handlers and the real backend must remain compatible with the agreed API contract.
