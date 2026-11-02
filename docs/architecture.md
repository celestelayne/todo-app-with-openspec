# Frontend Architecture

**Status:** Proposed  
**Last updated:** October 31, 2026

## 1. Purpose

This repository is a reusable, backend-agnostic React frontend template designed for AI-assisted software engineering.

It establishes a consistent architecture that supports:

- Clear ownership of application responsibilities
- Predictable feature development
- Testable boundaries between modules
- Reproducible development workflows
- Human oversight of AI-generated changes

The Todo application will serve as the reference implementation for validating these architectural decisions.

## 2. Architectural Principles

1. **Feature-oriented organization.** Group application code by domain rather than by technical type alone.
2. **Explicit dependencies.** Features depend on shared abstractions rather than implementation details.
3. **Single ownership of state.** Each type of application state has a clearly defined owner.
4. **Backend independence.** UI components do not depend directly on a specific backend implementation.
5. **Testability by design.** Dependencies and boundaries support isolated and integration testing.
6. **Human-directed development.** AI agents operate within documented constraints and approved specifications.

## 3. Architectural Style

The application follows a **feature-oriented modular monolith**.

It is a single deployable frontend application organized into independently understandable feature modules.

The intended directory structure is:

```text
src/
├── app/
│   ├── App.tsx
│   └── providers/
├── features/
│   └── todos/
│       ├── api/
│       ├── components/
│       ├── model/
│       ├── store/
│       └── tests/
├── shared/
│   ├── api/
│   ├── ui/
│   └── lib/
└── styles/
    ├── tokens.css
    └── global.css
```

The `todos` feature is illustrative and will be introduced during reference application development.

### Module Responsibilities

| Module        | Responsibility                                            |
| ------------- | --------------------------------------------------------- |
| `app/`        | Application composition, global providers, initialization |
| `features/`   | Domain-specific behavior, components, hooks, and state    |
| `shared/api/` | HTTP transport and dependency injection                   |
| `shared/ui/`  | Reusable, domain-independent UI components                |
| `shared/lib/` | Domain-independent utilities                              |
| `styles/`     | Global styles and design tokens                           |

### Dependency Rules

- `app/` may import from `features/` and `shared/`.
- `features/` may import from `shared/`.
- `shared/` must not import from `features/` or `app/`.
- Features must not import another feature's private modules.
- Components must not make direct HTTP requests.

These rules will eventually be enforced through automated architecture checks.

## 4. State Management

State ownership is determined by the nature of the data.

| State category        | Technology            | Examples                             |
| --------------------- | --------------------- | ------------------------------------ |
| Server state          | TanStack Query        | Todos, API responses, mutations      |
| Shared UI state       | Zustand               | Filters, selections, dialogs         |
| Form state            | React Hook Form + Zod | Form values and validation           |
| Local component state | React `useState`      | Temporary UI interactions            |
| Dependency injection  | React Context         | API client and application providers |

### Rules

- Do not duplicate server data in Zustand.
- Do not store form values in Zustand without a documented reason.
- Do not perform API requests directly inside Zustand stores.
- Keep transient component state local when possible.
- Use Context for stable dependencies and providers, not as a default replacement for dedicated state-management tools.

## 5. API Architecture

The frontend communicates with external services through a typed API abstraction.

```text
React Components
       |
Feature Hooks
       |
TanStack Query
       |
Feature API
       |
Typed HTTP Client
       |
HTTP Endpoint
       |
MSW Mock or Real Backend
```

MSW intercepts HTTP requests during local development and testing.

The application should use the same API interface whether responses come from MSW or a real backend.

API contracts and external response validation will be defined as features are implemented.

## 6. Testing Strategy

Testing is organized around observable behavior.

| Layer                 | Technology                      | Purpose                                               |
| --------------------- | ------------------------------- | ----------------------------------------------------- |
| Unit                  | Vitest                          | Pure functions and domain logic                       |
| Component/integration | React Testing Library + MSW     | User interactions and API behavior                    |
| Browser E2E           | Playwright                      | Complete browser workflows                            |
| Accessibility         | jest-axe + manual review        | Detectable accessibility issues and keyboard behavior |
| Visual verification   | Playwright screenshots + review | Responsive layouts and visual regressions             |

Test-first development is preferred for well-defined behavior.

The expected workflow is:

**Specification → Failing test → Implementation → Refactoring → Verification**

Visual exploration may follow a more iterative process.

## 7. Styling and Design System

The initial styling approach uses CSS Modules and CSS custom properties.

Design tokens define shared values such as:

- Color
- Typography
- Spacing
- Border radius
- Focus styles
- Responsive breakpoints

Reusable components belong in `shared/ui/` only when they are genuinely domain-independent.

The template should avoid premature component abstractions.

## 8. AI-Assisted Engineering

AI agents must work within the same architectural constraints as human engineers.

The repository uses:

- `AGENTS.md` for agent instructions
- `CLAUDE.md` for Claude Code integration
- `openspec/` for specifications and change management
- `docs/adr/` for architectural decisions
- Automated tests and CI for verification

AI-generated changes must be reviewable, testable, and consistent with approved specifications.

The architecture must not be changed implicitly as part of unrelated feature implementation.

## 9. Architectural Decisions

Individual decisions are documented in Architecture Decision Records (ADRs).

Initial ADRs:

- ADR-001: Feature-Oriented Architecture
- ADR-002: State Management Responsibilities
- ADR-003: API Abstraction and Backend Independence

ADRs explain why a decision was made, alternatives considered, and its consequences.

This document describes the resulting architecture.

## 10. Evolution

This architecture will evolve incrementally.

Changes to architectural boundaries, state ownership, or foundational dependencies require an explicit decision and documentation update.

The Todo reference implementation will be used to validate these assumptions before the repository is promoted as a reusable template.
