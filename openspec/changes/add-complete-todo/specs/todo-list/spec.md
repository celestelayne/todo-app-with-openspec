# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: Read-only completion state`
- TO: `### Requirement: Completion state display`

## MODIFIED Requirements

### Requirement: Completion state display

The system SHALL show each todo's completion state as text and SHALL NOT provide controls to edit or delete a todo. Changing completion state is defined by the `todo-completion` capability.

#### Scenario: Incomplete todo

- **WHEN** a todo with `isCompleted: false` is listed
- **THEN** its state is conveyed by text, not by color alone

#### Scenario: Completed todo

- **WHEN** a todo with `isCompleted: true` is listed
- **THEN** its state is conveyed by text, not by color alone

#### Scenario: No mutation controls

- **WHEN** the list is displayed
- **THEN** no edit or delete control is present
