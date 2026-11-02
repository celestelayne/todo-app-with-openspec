# AI-Assisted Engineering Readiness Assessment

**Status:** Baseline Assessment  
**Assessment date:** 2026-10-31  
**Scope:** Frontend template, AI-assisted development  
**Excluded:** Long-running autonomous agents

## Purpose

Evaluate whether this repository provides a reliable, understandable, and verifiable environment for AI-assisted frontend engineering.

The goal is not to maximize automation. It is to enable AI agents to implement changes while preserving architectural coherence, engineering quality, and human oversight.

## Assessment Criteria

Each capability is evaluated using four statuses:

- **Not started:** No implementation or documented approach exists.
- **Planned:** A decision or design exists, but implementation is incomplete.
- **Implemented:** The capability exists in the repository.
- **Validated:** The capability has been demonstrated through repeatable evidence.

## Baseline Assessment

| Capability               | Initial status                  | Required evidence                              |
| ------------------------ | ------------------------------- | ---------------------------------------------- |
| Reproducible toolchain   | Implemented, pending validation | Pinned versions, lockfile, clean installation  |
| Engineering standards    | Planned                         | Documented rules and automated checks          |
| Architecture             | Planned                         | ADRs and implemented module boundaries         |
| Agent instructions       | Not started                     | `AGENTS.md` and fresh-session evaluation       |
| Specification workflow   | Not started                     | OpenSpec change lifecycle                      |
| API independence         | Planned                         | HTTP client and MSW integration                |
| Automated testing        | Not started                     | Unit, integration, and E2E tests               |
| Verification contract    | Planned                         | Executable checks and agent reports            |
| Visual verification      | Not started                     | Browser screenshots and review                 |
| Security controls        | Planned                         | CI, dependency controls, permission boundaries |
| Template reproducibility | Not started                     | Successful fresh-clone validation              |

Statuses must be updated against actual repository evidence.

## Gold-Standard Exit Criteria

The template may be considered validated when:

1. A fresh clone installs and builds successfully.
2. The architecture is understandable from repository documentation.
3. AI agents follow the documented development workflow.
4. Feature changes originate from reviewed specifications.
5. Automated checks detect meaningful violations.
6. Tests exercise real application behavior.
7. Security and dependency controls are operational.
8. A new feature can be implemented without undocumented instructions.
9. A human reviewer can understand and verify the resulting changes.

## Validation Experiment

Use the Todo reference application to evaluate the engineering environment.

After completing the reference feature:

1. Create a fresh repository from the template.
2. Start a new AI agent session without prior conversation context.
3. Ask the agent to explain the architecture.
4. Request a small feature through OpenSpec.
5. Review its specification and implementation.
6. Run independent verification.
7. Record deviations, missing instructions, and corrective changes.

## Assessment Evidence

For each validated capability, record:

- Relevant repository files
- Commands executed
- Test or CI results
- Observed failures
- Changes made in response

## Open Gaps

Maintain a prioritized list of missing capabilities.

Do not mark a capability validated solely because a configuration file or documentation page exists.

## Review Cadence

Update this assessment after each major build phase and before publishing a new template release.
