# todo-completion Specification

## Purpose

Lets a user mark a todo as completed or not completed from the list, with clear pending and failure behavior, so that the server remains the source of truth for each todo's state.

## Requirements

### Requirement: Toggle completion from the list

The system SHALL provide each listed todo with a checkbox, named by the todo's title, that sets the todo's completion state to the opposite of its current state. The list order SHALL NOT change when a todo is toggled.

#### Scenario: Complete a todo

- **GIVEN** a todo that is not completed
- **WHEN** the user checks its checkbox
- **THEN** the todo is shown as completed, with the text "Completed", after the server confirms

#### Scenario: Uncomplete a todo

- **GIVEN** a todo that is completed
- **WHEN** the user unchecks its checkbox
- **THEN** the todo is shown as not completed, with the text "Not completed", after the server confirms

#### Scenario: List order is unchanged

- **GIVEN** a list of several todos
- **WHEN** the user toggles one of them
- **THEN** the todos remain in the same order

### Requirement: Server owns completion state and timestamps

The system SHALL send only the new `isCompleted` value when toggling. The server SHALL apply it, update the todo's `updatedAt`, and leave `id`, `title`, and `createdAt` unchanged.

#### Scenario: Update request contents

- **WHEN** the user completes a todo
- **THEN** the request body contains only `isCompleted: true`
- **AND** the response is the full updated todo with `title` and `createdAt` unchanged

### Requirement: Non-optimistic update with pending state

The system SHALL keep a todo's displayed state unchanged until the server confirms the update. While a toggle request for a todo is pending, that todo's row SHALL be marked busy and further activations of its checkbox SHALL send no additional request. The checkbox SHALL remain focusable.

#### Scenario: Pending request

- **WHEN** the user toggles a todo and the server has not yet responded
- **THEN** the todo still shows its previous state
- **AND** its row is marked busy

#### Scenario: Repeated activation while pending

- **WHEN** the user activates the checkbox again while its request is pending
- **THEN** no additional request is sent

#### Scenario: Other rows stay usable

- **WHEN** one todo's request is pending
- **THEN** the checkboxes of other todos can still be toggled

### Requirement: Update failure feedback

The system SHALL show an inline message directly under the affected todo, announced to assistive technology, when its update fails for any reason: "Couldn't update “<title>”. Try again." The todo SHALL remain in its last server-confirmed state, and the message SHALL remain until the next attempt on that todo.

#### Scenario: Server error

- **WHEN** the server responds to the update request with an error status
- **THEN** the message appears under that todo and is announced as an alert
- **AND** the todo shows its previous state
- **AND** other todos are unchanged

#### Scenario: Network failure

- **WHEN** the update request fails without a response
- **THEN** the same message is shown under that todo

#### Scenario: Todo no longer exists

- **WHEN** the server responds with 404 because the todo does not exist
- **THEN** the same message is shown under that todo

#### Scenario: Retry clears the message

- **GIVEN** an update failed and its message is shown
- **WHEN** the user toggles the same todo again
- **THEN** the message is removed
- **AND** if the server succeeds the todo shows its new state

#### Scenario: Independent failures

- **WHEN** updates for two different todos both fail
- **THEN** each todo shows its own message

### Requirement: Validate update responses

The system SHALL validate the update response against the `Todo` shape and SHALL treat a malformed response as a failed update.

#### Scenario: Malformed update response

- **WHEN** the update response is missing required fields
- **THEN** the update failure message is shown and the todo keeps its previous state

### Requirement: Accessible completion control

The system SHALL make the completion checkbox operable with the keyboard, give it the todo's title as its accessible name, keep keyboard focus on it after a toggle, show a visible focus indicator, and give it a touch target of at least 44 by 44 CSS pixels.

#### Scenario: Keyboard toggle

- **WHEN** the checkbox has focus and the user presses Space
- **THEN** the todo's state is toggled as if it had been clicked
- **AND** focus remains on the same checkbox after the list updates

#### Scenario: Accessible name

- **WHEN** the list is rendered
- **THEN** each checkbox is reachable by its todo's title as its accessible name

#### Scenario: No accessibility violations

- **WHEN** the list is shown in populated, pending, and update-failure states
- **THEN** there are no automated accessibility violations
