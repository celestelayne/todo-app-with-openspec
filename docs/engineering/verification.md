# Verification Protocol

**Status:** Draft v0.1  
**Last updated:** 2026-10-31

## Purpose

Define the checks and evidence required before human-written or AI-generated changes are considered complete.

An implementation is not verified simply because it compiles or an AI agent reports success.

## Verification Levels

### Level 1 — Static Checks

Required for every code change:

```bash
pnpm lint
pnpm format:check
pnpm typecheck
```

### Level 2 — Automated Tests

Required for changes affecting application behavior:

```bash
pnpm test
```

### Level 3 — Production Build

Required before merging:

```bash
pnpm build
```

### Level 4 — Architecture Checks

Required once automated boundary enforcement is implemented:

```bash
pnpm architecture:check
```

### Level 5 — Browser and Visual Verification

Required for relevant user-facing changes:

```bash
pnpm test:e2e
```

Review responsive behavior, keyboard navigation, loading states, error states, and visual fidelity.

## Current Verification Command

During initial scaffolding:

```bash
pnpm check
```

This runs the checks currently configured in `package.json`.

Do not assume tests or architecture checks are included until those scripts have been added.

## AI Agent Verification Contract

Before reporting completion, an agent must:

1. Identify which acceptance criteria were implemented.
2. Run relevant verification commands.
3. Report the actual results.
4. Identify any checks not executed.
5. Summarize changes and remaining limitations.

A failed or unexecuted check must not be represented as passing.

## Human Review

Human review is required for:

- Architectural changes
- New dependencies
- Security-sensitive changes
- Significant visual or interaction decisions
- Changes to approved specifications

## Failure Handling

When verification fails:

- Identify the failure and its likely cause.
- Fix the implementation rather than weakening tests.
- Re-run the relevant checks.
- Report unresolved failures explicitly.

## Validation

The verification protocol will be exercised against the Todo reference application and a fresh project generated from the template.

### Verification Requirements

Before declaring a task complete:

1. Run the applicable lint, typecheck, formatting, build, and test commands. Report actual results.
2. For user-facing changes, inspect the application at representative mobile and desktop viewport widths.
3. Verify relevant keyboard interactions, focus indicators, and accessible names.
4. Check every acceptance criterion in the approved specification and report how it was verified.
5. Test applicable edge cases, including empty data, invalid inputs, failed requests, and missing optional data.
6. Run relevant regression tests to ensure existing behavior remains intact.
7. Report any verification steps that could not be performed and explain why.

Do not claim visual inspection, manual testing, or automated verification was completed unless it actually occurred.

A successful build is not sufficient evidence of correct behavior.
