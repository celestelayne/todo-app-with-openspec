# Engineering Standards

**Status:** Draft v0.1  
**Last updated:** 2026-10-31

## Purpose

Define the engineering conventions that govern human-written and AI-generated code in this repository.

These standards apply equally to human engineers and AI coding agents.

## Core Principles

1. Prefer clarity over cleverness.
2. Keep changes small, focused, and reviewable.
3. Follow existing architectural decisions before introducing new patterns.
4. Make dependencies and state ownership explicit.
5. Treat accessibility, error handling, and testing as part of feature development.
6. Optimize for maintainability and correctness before abstraction.

## Technology Standards

- React and TypeScript with strict type checking
- Vite for development and production builds
- pnpm for dependency management
- Oxlint for linting
- Prettier for formatting
- CSS Modules and CSS custom properties for styling
- TanStack Query for server state
- Zustand for shared client/UI state
- React Hook Form and Zod for forms and validation

These are architectural choices, not requirements to use every library in every feature.

## Interface Quality

User-facing changes must satisfy applicable interface-quality requirements:

1. Meet WCAG 2.2 AA accessibility expectations, including text contrast of at least 4.5:1 for normal text, 3:1 for large text, and 3:1 for applicable non-text UI indicators.
2. Ensure interactive elements are keyboard accessible and have visible focus indicators.
3. Aim for touch targets of at least 44×44 CSS pixels; document justified exceptions.
4. Respect `prefers-reduced-motion`. Use established motion tokens rather than arbitrary durations and easing.
5. Design intentional empty, loading, success, and error states where applicable.
6. Support layouts down to 320 CSS pixels without unintended horizontal scrolling. Allow deliberate overflow for content that requires it.
7. Never use color as the only means of communicating information.

Automated accessibility checks supplement, but do not replace, keyboard testing and visual inspection.

## Code Organization

Follow ADR-001.

- Domain-specific code belongs inside its feature.
- Shared modules must be independent of feature-specific logic.
- Avoid circular dependencies.
- Prefer explicit imports and exports.
- Do not introduce a shared abstraction for a single use case without a demonstrated need.

## TypeScript

- Prefer explicit domain types at public boundaries.
- Avoid `any`; use `unknown` for untrusted values.
- Validate external data where runtime guarantees are required.
- Use discriminated unions for meaningful state variants.
- Avoid unnecessary type assertions.

## React

- Use function components and hooks.
- Keep rendering logic separate from networking concerns.
- Prefer composition over large configurable components.
- Avoid unnecessary effects and duplicated derived state.
- Use semantic HTML and accessible interaction patterns.

## Styling

- Use CSS Modules for component-specific styles.
- Use design tokens for shared values.
- Provide visible keyboard focus states.
- Support responsive layouts.
- Avoid arbitrary styling values when an established token exists.

## Dependencies

- Prefer existing dependencies before adding new ones.
- New dependencies require a clear use case.
- Evaluate maintenance, security, bundle impact, and alternatives.
- Do not install dependencies merely because an AI assistant recommends them.

## Definition of Done

A change is complete when:

- Its acceptance criteria are satisfied.
- Required tests pass.
- Lint, formatting, type checking, and build checks pass.
- Relevant accessibility and interaction states are reviewed.
- Documentation is updated when behavior or architecture changes.
- Known limitations are reported.

## Exceptions

Exceptions require an explicit explanation and approval. Architectural exceptions should be documented in an ADR when they establish a lasting precedent.
