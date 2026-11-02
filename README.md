# Frontend Engineering Template

A reusable React and TypeScript starter for building maintainable frontend applications with AI-assisted development.

The template establishes a consistent engineering foundation through explicit architectural decisions, documented standards, specification-driven development, and automated verification.

**Status:** Work in progress — foundational architecture and engineering standards.

## Tech Stack

| Category           | Technology                                |
| ------------------ | ----------------------------------------- |
| Framework          | React, TypeScript, Vite                   |
| Package management | pnpm                                      |
| Code quality       | Oxlint, Prettier                          |
| Server state       | TanStack Query                            |
| Client state       | Zustand                                   |
| Forms              | React Hook Form, Zod                      |
| API mocking        | Mock Service Worker (MSW)                 |
| Testing            | Vitest, React Testing Library, Playwright |
| Styling            | CSS Modules, CSS custom properties        |
| AI workflow        | Claude Code, OpenSpec                     |

Some technologies are planned and will be introduced incrementally.

## Getting Started

Requires Node.js and pnpm.

```bash
pnpm install
pnpm dev
```

### Quality Checks

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm build
```

Or run the combined verification command:

```bash
pnpm check
```

## Architecture

The template follows a **feature-oriented modular monolith** with clear responsibilities for application composition, domain features, shared infrastructure, and state management.

A Todo application will serve as the reference implementation for validating these decisions.

See [Architecture](docs/architecture.md).

## Engineering Documentation

- [Engineering Standards](docs/engineering/standards.md)
- [Testing Strategy](docs/engineering/testing.md)
- [Verification Protocol](docs/engineering/verification.md)
- [Security Standards](docs/engineering/security.md)
- [AI Readiness Assessment](docs/engineering/ai-readiness-assessment.md)
- [Architecture Decision Records](docs/adr/)

## AI-Assisted Development

AI agents follow the same engineering standards as human contributors.

The intended workflow is:

**Specify → Review → Test → Implement → Verify**

- `AGENTS.md` defines repository instructions for coding agents.
- `openspec/` manages proposed changes and specifications.
- Automated checks provide evidence of implementation correctness.
- Human review remains responsible for architectural and product decisions.

These capabilities are being introduced incrementally.

## Project Goals

Build an engineering environment that is:

- **Understandable:** Clear architecture and documented decisions.
- **Reproducible:** Consistent development environments and dependencies.
- **Testable:** Behavior verified through automated tests.
- **Backend-agnostic:** Frontend development without a required backend.
- **AI-assisted:** Coding agents operate within explicit engineering constraints.
- **Reusable:** A foundation for future frontend projects.

## Development Status

The template is being built incrementally, beginning with repository foundations and engineering standards, followed by AI workflows, application infrastructure, testing, and a Todo reference application.

See the [AI Readiness Assessment](docs/engineering/ai-readiness-assessment.md) for progress and validation criteria.
