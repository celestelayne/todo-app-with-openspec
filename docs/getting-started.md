# Getting Started: New Engineer Guide

**Audience:** Engineers new to this repository  
**Status:** Draft — the template is under development

## 1. What Is This Repository?

This repository is a reusable frontend engineering template built with React and TypeScript.

It provides a consistent way to organize code, build features, write tests, and collaborate with AI coding assistants.

The goal is not simply to write working code. It's to build software that other engineers can understand, test, and maintain.

You'll learn to:

- Understand an existing codebase before changing it.
- Follow architectural conventions.
- Translate requirements into testable behavior.
- Use AI to assist with implementation.
- Verify your changes before submitting them for review.

The Todo application will serve as our reference example.

## 2. Set Up Your Environment

You'll need Git, Node.js, pnpm, and a code editor such as VS Code.

Clone the repository:

```bash
git clone <repository-url>
cd frontend-template
```

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open the local address displayed in your terminal, typically `http://localhost:5173`.

Before making changes, verify that the project works:

```bash
pnpm check
```

If a command fails, read the error before attempting to fix it. Some checks may not be available until later phases of template development.

## 3. Understand the Repository

Before writing code, read these documents in order:

| Document                        | What you'll learn                           |
| ------------------------------- | ------------------------------------------- |
| `README.md`                     | What the project does and how to run it     |
| `docs/architecture.md`          | How the application is organized            |
| `docs/engineering/standards.md` | How code should be written                  |
| `docs/engineering/testing.md`   | How behavior should be tested               |
| `AGENTS.md`                     | Instructions that coding agents must follow |

You don't need to memorize everything. You should know where to find the information when you need it.

### Where Does Code Belong?

```text
src/
├── app/         # Application setup and providers
├── features/    # Domain-specific functionality
├── shared/      # Reusable infrastructure and UI
└── styles/      # Global styles and design tokens
```

**Rule:** Put code close to the feature that owns it. Don't move code into `shared/` just because it might be reusable someday.

## 4. Your First Task

Imagine you're asked to add a priority field to a Todo. Before opening your editor, answer four questions:

1. What should the user be able to do?
2. What should happen when the input is invalid?
3. Which existing modules will be affected?
4. How will you prove the feature works?

These questions help you understand the problem before implementing a solution.

### Example Task: Add Todo Priority

Feature request: Users should be able to assign a priority level to a Todo so they can distinguish important tasks from less urgent ones.

#### 1. What should the user be able to do?

**Expected behavior:**

- When creating a Todo, the user can select Low, Medium, or High priority.
- Medium is selected by default.
- After saving, the Todo displays its assigned priority.
- When editing a Todo, the user can change its priority.
- Existing Todos without a priority are displayed as Medium until the API contract defines a different migration rule.

**Example:**
A user creates a Todo titled "Pay electricity bill," selects High priority, and saves it.

The Todo list displays:

```
Pay electricity bill — High Priority
```

#### 2. What should happen when the input is invalid?

**Expected behavior:**

- Priority must be one of low, medium, or high.
- An unsupported value, such as urgent, is rejected by validation.
- The form displays an understandable error if an invalid value is encountered.
- The user cannot submit invalid data.
- If the API rejects the request, the form preserves the user's input and displays an error.

**Example:**
The API returns an error when saving a Todo.

The user sees:

```
"Couldn't save your Todo. Please try again."
```

Their title and selected priority remain unchanged.

#### 3. Which existing modules will be affected?

Following the repository's feature-oriented architecture:

```
src/
└── features/
    └── todos/
        ├── model/
        │   └── todo.schema.ts
        ├── api/
        │   └── todoApi.ts
        ├── components/
        │   ├── TodoForm.tsx
        │   └── TodoItem.tsx
        └── tests/
            └── todo-priority.test.tsx

src/
└── mocks/
    └── handlers.ts
```

| Module                   | Required change                                          |
| ------------------------ | -------------------------------------------------------- |
| `todo.schema.ts`         | Define allowed priority values and default               |
| `todoApi.ts`             | Include priority in create/update contracts              |
| `TodoForm.tsx`           | Add priority selection                                   |
| `TodoItem.tsx`           | Display selected priority                                |
| `todo-priority.test.tsx` | Verify user-visible behavior                             |
| `mocks/handlers.ts`      | Accept, persist, and return priority in mocked responses |

These are proposed locations. Check the existing repository before creating files.

**Architectural consideration:** Priority is part of the Todo's domain data, not shared UI state. It belongs in the Todo model and server-state flow, not a Zustand store.

#### 4. How will you prove the feature works?

Define acceptance tests before implementing the feature.

| Test                                | Expected result                              |
| ----------------------------------- | -------------------------------------------- |
| Open Create Todo form               | Medium is selected by default                |
| Select High and save                | Todo appears with High priority              |
| Edit Todo and select Low            | Updated Todo displays Low priority           |
| Submit unsupported priority         | Verification rejects the value               |
| API returns an error                | Error message appears and input is preserved |
| Load an older Todo without priority | Medium is displayed                          |

**Example test using React Testing Library:**

```
it('creates a high-priority todo', async () => {
  const user = userEvent.setup();

  render(<TodoApp />, { wrapper: TestProviders });

  await user.type(
    screen.getByRole('textbox', { name: /title/i }),
    'Pay electricity bill',
  );

  await user.selectOptions(
    screen.getByRole('combobox', { name: /priority/i }),
    'high',
  );

  await user.click(
    screen.getByRole('button', { name: /save/i }),
  );

  expect(
    await screen.findByText('Pay electricity bill'),
  ).toBeInTheDocument();

  expect(
    screen.getByText('High Priority'),
  ).toBeInTheDocument();
});
```

This is an illustrative test. It assumes TodoApp exposes the form and TestProviders configures TanStack Query and MSW.

The test should initially fail because the priority feature does not exist.

After implementation, it should pass without changing the expected behavior.

## 5. Start With a Specification

This repository uses OpenSpec to organize feature changes.

Once OpenSpec is configured, start Claude Code and use:

```text
/opsx:explore
```

Describe the requested feature and discuss the expected behavior.

Then create a proposal:

```text
/opsx:propose
```

Review the generated proposal, specification, design, and tasks.

**Do not approve a specification you don't understand.**

If something is unclear, ask questions before implementation begins.

For a small maintenance fix, follow the repository's documented exception process if a full specification is unnecessary.

## 6. Write a Test Before the Implementation

For well-defined behavior, this repository prefers test-driven development.

The cycle is:

**Red → Green → Refactor**

### Red: Write a failing test

For example, a Todo priority feature might require:

> When a user selects High priority and saves a Todo, the Todo displays High priority.

Write a test describing that behavior.

Run the relevant test command:

```bash
pnpm test
```

The test should fail because the behavior hasn't been implemented yet.

### Green: Make the test pass

Implement the smallest change that satisfies the test.

Avoid adding unrelated functionality.

### Refactor: Improve the code

Once the test passes, improve readability or structure without changing behavior.

Run the test again to ensure it still passes.

**Important:** A passing test doesn't automatically mean the feature is correct. Check whether the test actually represents the requirement.

## 7. Use AI as an Engineering Assistant

AI can help you explore the codebase, explain unfamiliar code, write tests, implement approved changes, and investigate failures.

For example:

> Read `AGENTS.md`, the architecture documentation, and the relevant ADRs. Explain where a Todo priority feature should be implemented and why. Do not modify files.

Then:

> Using the approved specification, propose the first failing test for the priority feature. Explain what it verifies before writing implementation code.

Once the approach is understood, you can ask the agent to implement the approved change.

### Your Responsibilities

You remain responsible for understanding and reviewing the work.

Before accepting AI-generated code, ask:

- Can I explain what this code does?
- Does it follow the repository architecture?
- Does it satisfy the specification?
- Are the tests meaningful?
- Did the agent introduce unnecessary dependencies or abstractions?
- Can another engineer maintain this implementation?

If you cannot explain a change, don't submit it yet.

## 8. Follow State-Management Rules

Different types of state have different owners.

| If you're managing…        | Use…                  |
| -------------------------- | --------------------- |
| Data returned by an API    | TanStack Query        |
| Shared interface state     | Zustand               |
| Form inputs and validation | React Hook Form + Zod |
| Temporary component state  | React `useState`      |
| Shared dependencies        | React Context         |

For example, Todo data fetched from an API belongs in TanStack Query. The currently selected Todo filter can belong in Zustand.

Don't copy the fetched Todo list into Zustand just to make it available to other components.

## 9. Test More Than the Happy Path

A feature should work when everything goes right—and behave appropriately when things go wrong.

For a Todo form, consider:

- Valid submission
- Missing required fields
- API errors
- Loading states
- Keyboard interaction
- Screen-reader accessibility
- Small-screen layouts

Use React Testing Library for user-visible component behavior and MSW for realistic API responses.

Use Playwright for browser-level workflows once it is configured.

## 10. Verify Your Work

Before submitting changes, run:

```bash
pnpm check
```

As the template evolves, additional commands may include:

```bash
pnpm test
pnpm test:e2e
pnpm architecture:check
```

Only run commands that exist in the current repository.

If a check fails, investigate the cause. Do not remove tests, suppress errors, or weaken rules simply to make the checks pass.

For interface changes, inspect the actual application in a browser. Check responsive layouts, focus states, and interaction feedback.

## 11. Submit Your Changes

Create a focused Git branch:

```bash
git switch -c feat/todo-priority
```

Commit related changes together:

```bash
git add .
git commit -m "feat: add todo priority"
```

Before opening a pull request, summarize:

- What changed and why
- Which specification or issue it addresses
- What tests were added or updated
- Which verification commands passed
- Any known limitations
- Screenshots for relevant UI changes

A reviewer should be able to understand your change without reconstructing your entire development process.

## 12. What Does Done Mean?

A feature is complete when:

- The agreed behavior is implemented.
- The code follows the architecture.
- Relevant tests pass.
- Required quality checks pass.
- Accessibility and visual behavior have been reviewed.
- Documentation is updated when necessary.
- Another engineer can understand the implementation.

**Working code is the beginning of engineering quality, not the end.**

## 13. When You're Stuck

Use this sequence:

1. Read the error or unexpected behavior carefully.
2. Reproduce the problem.
3. Identify the smallest relevant part of the system.
4. Read the associated code, tests, and documentation.
5. Ask AI to explain possible causes without immediately changing code.
6. Form a hypothesis and test it.
7. Make a focused correction.
8. Run verification again.

Avoid asking AI to rewrite large sections of code before you understand the failure.

## Final Principle

**Understand → Specify → Test → Implement → Verify → Explain**

The purpose of this template is not to make engineers dependent on AI. It is to help engineers develop the judgment, technical understanding, and verification habits needed to use AI effectively.
