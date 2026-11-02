# Spec Delta

## Purpose

Lets a user add a new todo by entering a title, with clear validation and failure feedback, so that the todo is created by the server and becomes visible in the list.

## ADDED Requirements

### Requirement: Create a todo from a title

The system SHALL let the user create a todo by submitting a title. On success the created todo SHALL appear in the todo list and the title input SHALL be cleared.

#### Scenario: Successful creation

- **WHEN** the user enters "Buy milk" and submits the form
- **THEN** a todo titled "Buy milk" appears in the list, shown as not completed
- **AND** the title input is empty

#### Scenario: Submit with the keyboard

- **WHEN** the user types a title and presses Enter
- **THEN** the todo is created as if the submit button had been activated

### Requirement: Server owns todo identity and timestamps

The system SHALL send only the title when creating a todo. The server SHALL assign `id`, set `isCompleted` to `false`, and set `createdAt` and `updatedAt`.

#### Scenario: Create request contents

- **WHEN** the user submits the title "Buy milk"
- **THEN** the request body contains only `title`
- **AND** the created todo returned by the server contains `id`, `title`, `isCompleted: false`, `createdAt`, and `updatedAt`

### Requirement: Title validation

The system SHALL trim leading and trailing whitespace from the title and SHALL reject a title that is empty after trimming. The system SHALL NOT impose a maximum title length.

#### Scenario: Empty title

- **WHEN** the user submits an empty title
- **THEN** no create request is sent
- **AND** the message "Enter a title" is shown and associated with the input

#### Scenario: Whitespace-only title

- **WHEN** the user submits a title containing only spaces
- **THEN** no create request is sent
- **AND** the message "Enter a title" is shown

#### Scenario: Surrounding whitespace is trimmed

- **WHEN** the user submits " Buy milk "
- **THEN** the created todo has the title "Buy milk"

#### Scenario: Long title accepted

- **WHEN** the user submits a title longer than 200 characters
- **THEN** the todo is created with the full title

### Requirement: Non-optimistic submission

The system SHALL NOT add a todo to the list until the server confirms creation. While a create request is pending, the submit control SHALL be disabled.

#### Scenario: Pending request

- **WHEN** the user submits a valid title and the server has not yet responded
- **THEN** the submit control is disabled
- **AND** the todo is not yet in the list

#### Scenario: No duplicate submission

- **WHEN** the user submits a valid title twice while the first request is pending
- **THEN** only one create request is sent

### Requirement: Creation failure feedback

The system SHALL show the inline message "Couldn't add todo. Try again." when creation fails for any reason, announced to assistive technology, and SHALL preserve the typed title so the user can retry.

#### Scenario: Server error

- **WHEN** the server responds to the create request with an error status
- **THEN** the message "Couldn't add todo. Try again." is shown and announced as an alert
- **AND** the title input still contains the typed title
- **AND** the list is unchanged

#### Scenario: Network failure

- **WHEN** the create request fails without a response
- **THEN** the same message is shown and the typed title is preserved

#### Scenario: Retry after failure

- **GIVEN** a previous create attempt failed
- **WHEN** the user submits again and the server succeeds
- **THEN** the todo appears in the list and the error message is removed

### Requirement: Accessible form

The system SHALL provide the title input with a visible, programmatically associated label, keyboard operability, and a visible focus indicator.

#### Scenario: Labelled input

- **WHEN** the form is rendered
- **THEN** the title input is reachable by its accessible name
- **AND** the page has no automated accessibility violations in idle, validation-error, and failure-error states
