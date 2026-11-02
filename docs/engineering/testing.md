# Testing Strategy

**Status:** Draft v0.1  
**Last updated:** 2026-10-31

## Purpose

Establish a testing strategy that supports reliable frontend development and meaningful verification of AI-generated code.

Tests should provide evidence of expected behavior, not merely increase coverage percentages.

## Testing Philosophy

Prefer testing observable behavior over implementation details.

Tests should answer:

- What should the user be able to do?
- What should happen when an operation succeeds?
- What should happen when it fails?
- What happens with invalid, empty, or unexpected data?

## Test Levels

| Level                 | Tools                              | Scope                                         |
| --------------------- | ---------------------------------- | --------------------------------------------- |
| Unit                  | Vitest                             | Pure functions, transformations, domain rules |
| Component/integration | Vitest, React Testing Library, MSW | User interactions, forms, data fetching       |
| Browser E2E           | Playwright                         | Critical workflows in a real browser          |
| Accessibility         | jest-axe, manual testing           | Detectable violations and keyboard behavior   |
| Visual                | Playwright screenshots             | Layout and visual regression checks           |

## Test-First Development

For behavior with clear acceptance criteria, prefer:

1. Define expected behavior.
2. Write a focused failing test.
3. Confirm that it fails for the expected reason.
4. Implement the smallest change that makes it pass.
5. Refactor while preserving behavior.
6. Run the broader relevant test suite.

This is a preferred workflow, not a requirement to use strict TDD for every visual experiment.

## AI-Assisted Testing Rules

- Do not generate tests solely to confirm an existing implementation.
- Derive test cases from approved requirements.
- Do not weaken assertions to make failing tests pass.
- Do not delete tests without explaining why.
- Do not modify independently maintained acceptance tests without approval.
- Report tests that could not be executed.

## Mocking

Use MSW to intercept HTTP requests during development and integration testing.

Mock network boundaries rather than replacing application logic with test-specific implementations.

Include success, error, empty, and delayed-response scenarios where relevant.

## Accessibility

Automated accessibility tests are necessary but insufficient.

Verify keyboard navigation, focus behavior, accessible names, and interaction feedback manually or through browser tests.

## Coverage

Coverage is diagnostic evidence, not the primary quality target.

Prioritize meaningful behavior and critical paths over arbitrary percentage thresholds.

## Test Organization

- Keep focused unit tests close to the code they exercise.
- Keep shared test utilities in `src/test/`.
- Keep browser E2E tests in `e2e/`.
- Use descriptive test names that express expected behavior.

## Validation

The Todo reference application will demonstrate test-first development for form validation, CRUD operations, loading states, and error recovery.
