# ADR-001: Feature-Oriented Architecture

**Status:** Accepted — Pending Validation  
**Date:** 2026-10-31  
**Decision makers:** Repository maintainers

## Context

Frontend applications often begin with directories organized by technical responsibility, such as `components/`, `hooks/`, `services/`, and `stores/`.

As applications grow, related code becomes scattered across these directories. Understanding or modifying a single feature requires navigating multiple parts of the repository.

This increases cognitive overhead for both human engineers and AI coding agents.

The template needs a predictable structure that supports feature development, clear ownership, and maintainable dependencies without introducing unnecessary architectural complexity.

## Decision

Adopt a **feature-oriented modular monolith**.

Organize domain-specific code within feature directories while keeping application composition and reusable infrastructure separate.

```text
src/
├── app/
│   └── providers/
├── features/
│   └── todos/
│       ├── api/
│       ├── components/
│       ├── model/
│       └── store/
└── shared/
    ├── api/
    ├── ui/
    └── lib/
```

### Dependency Rules

1. `app/` composes features and shared modules.
2. `features/` may depend on `shared/`.
3. `shared/` must not depend on `features/` or `app/`.
4. Features must not import another feature's private implementation.
5. Cross-feature coordination belongs in the application composition layer or an explicitly designed public interface.
6. Avoid circular dependencies.

Feature directories should contain only the subdirectories required by their implementation.

Architecture boundaries will be enforced through automated dependency checks.

## Alternatives Considered

### Layer-Based Organization

Organize all components, hooks, services, and stores in separate top-level directories.

**Rejected because:** Related feature code becomes distributed across the repository as the application grows.

### Atomic Design as Application Architecture

Organize components into atoms, molecules, organisms, templates, and pages.

**Rejected because:** Atomic Design can help organize a UI component library but does not define ownership of domain logic, server state, or application dependencies.

### Microfrontends

Separate features into independently deployed applications.

**Rejected because:** The operational and integration complexity is unnecessary for a reusable frontend starter.

## Consequences

### Benefits

- Features are easier to locate and understand.
- Related code can evolve together.
- Architectural boundaries are explicit.
- AI agents can work within a focused feature context.
- Features can be tested with limited knowledge of unrelated modules.

### Tradeoffs

- Some patterns may be repeated across features.
- Shared abstractions require deliberate design.
- Cross-feature interactions need explicit coordination.
- Automated boundary checks must be maintained.

## Validation

The Todo reference application must demonstrate:

- Feature code remains within its domain.
- Shared infrastructure contains no Todo-specific logic.
- Features do not depend on private modules of other features.
- Architecture checks detect prohibited dependencies.

This decision will be revisited if feature boundaries create unnecessary coupling or complexity.
