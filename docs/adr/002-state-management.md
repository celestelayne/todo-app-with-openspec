# ADR-002: State Management Responsibilities

**Status:** Accepted — Pending Validation  
**Date:** 2026-10-31  
**Decision makers:** Repository maintainers

## Context

React applications manage several fundamentally different types of state: remote data, shared interface state, form values, and transient component interactions.

Using a single state-management solution for every category can create duplicated data, unclear ownership, unnecessary synchronization, and unpredictable updates.

AI-assisted development introduces an additional concern: without explicit conventions, generated code may introduce new state-management patterns or duplicate existing state.

The template needs a consistent approach to state ownership.

## Decision

Assign state-management responsibilities according to the type of state being managed.

| State category  | Technology            | Responsibility                                |
| --------------- | --------------------- | --------------------------------------------- |
| Server state    | TanStack Query        | Fetching, caching, synchronization, mutations |
| Shared UI state | Zustand               | Filters, selections, dialog state             |
| Form state      | React Hook Form + Zod | Form values, validation, submission           |
| Local state     | React `useState`      | Isolated, transient interactions              |
| Dependencies    | React Context         | Provider composition and dependency injection |

### Rules

1. TanStack Query is the authoritative client-side cache for server data.
2. Do not duplicate fetched entities in Zustand.
3. Zustand stores must not perform HTTP requests.
4. Form values belong to React Hook Form unless a documented requirement justifies otherwise.
5. Use `useState` for state that does not need to be shared.
6. Use Context for dependency injection and provider composition rather than as a default general-purpose state store.
7. Prefer derived state over storing redundant computed values.

### Example: Todo Feature

- The Todo collection is managed by TanStack Query.
- The selected filter is stored in a feature-scoped Zustand store.
- Create/Edit Todo forms use React Hook Form and Zod.
- A temporary hover state remains local to the component.
- The HTTP client is provided through React Context.

## Alternatives Considered

### Redux Toolkit

**Not selected:** Provides a comprehensive state-management solution but introduces more structure than this reference application currently requires.

### Context for All State

**Rejected because:** It does not provide dedicated server-state caching or form-management capabilities, and broad contexts can create unnecessary update coupling.

### Zustand for All State

**Rejected because:** Remote data requires caching, invalidation, synchronization, and mutation semantics already provided by TanStack Query.

### TanStack Query for All State

**Rejected because:** It is designed primarily for asynchronous server state, not arbitrary shared interface state.

## Consequences

### Benefits

- Clear ownership of state.
- Less duplicated data and synchronization logic.
- Consistent patterns for AI-generated features.
- Each tool is used for its intended responsibility.
- State behavior is easier to test independently.

### Tradeoffs

- Multiple libraries must be understood and maintained.
- Developers must correctly classify state.
- Some small applications may not require Zustand.
- State that spans multiple categories requires careful modeling.

## Validation

The Todo reference application must demonstrate:

- Query-based fetching and mutations.
- Feature-scoped UI state.
- Form validation and submission.
- No duplicated server data in Zustand.
- Correct UI behavior following API success and failure.
- Integration tests that verify state changes through user-visible behavior.

The decision should be revisited if the separation creates more complexity than it resolves.
