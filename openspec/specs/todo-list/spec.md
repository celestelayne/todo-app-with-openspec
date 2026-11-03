# todo-list Specification

## Purpose

Shows the user the todos held by the server as a read-only list, with intentional loading, empty, and error states, as the entry view of the application.

## Requirements

### Requirement: Todos page is the application entry view

The system SHALL present the create-todo form and the todo list on the application's initial view.

#### Scenario: Initial load

- **WHEN** the user opens the application
- **THEN** the title input and the todo list region are displayed

### Requirement: Page heading

The system SHALL present the todos page with exactly one level-1 heading reading "Todo List".

#### Scenario: Heading present

- **WHEN** the application loads
- **THEN** a single level-1 heading "Todo List" is displayed

### Requirement: Display todos newest first

The system SHALL display each todo's title and completion state, ordered by `createdAt` with the newest first.

#### Scenario: Ordering

- **GIVEN** the server holds todos created at 09:00 and 10:00
- **WHEN** the list loads
- **THEN** the 10:00 todo is listed before the 09:00 todo

#### Scenario: Newly created todo

- **WHEN** a todo is created successfully
- **THEN** it appears at the top of the list without a page reload

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

### Requirement: Loading state

The system SHALL show a loading indication while the list is being fetched.

#### Scenario: Fetch in progress

- **WHEN** the list request has not yet completed
- **THEN** a loading indication is shown and no empty or error message is shown

### Requirement: Empty state

The system SHALL show the message "No todos yet" when the server returns no todos.

#### Scenario: No todos

- **WHEN** the list request succeeds with an empty collection
- **THEN** "No todos yet" is shown

### Requirement: Error state with retry

The system SHALL show an error message with a retry control when the list cannot be loaded. Activating retry SHALL refetch the list.

#### Scenario: Load failure

- **WHEN** the list request fails
- **THEN** an error message and a retry control are shown

#### Scenario: Retry succeeds

- **GIVEN** the list failed to load
- **WHEN** the user activates retry and the server succeeds
- **THEN** the todos are displayed and the error message is removed

### Requirement: Validate server responses

The system SHALL validate list and create responses against the `Todo` shape `{ id, title, isCompleted, createdAt, updatedAt }` before using them, and SHALL treat a malformed response as a failure.

#### Scenario: Malformed list response

- **WHEN** the list response contains an item missing required fields
- **THEN** the list error state is shown

### Requirement: Layout and accessibility

The system SHALL render the todos page without horizontal scrolling at a 320 CSS pixel viewport and SHALL have no automated accessibility violations in loading, empty, populated, and error states.

#### Scenario: Narrow viewport

- **WHEN** the page is rendered at 320 CSS pixels wide
- **THEN** there is no unintended horizontal scrolling
