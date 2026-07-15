<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Added principles:
  - I. Evals Are the Specification
  - II. Public-Safe Synthetic Data
  - III. Human-Controlled Operations
  - IV. Dimensional and Evidence Integrity
  - V. Simplicity and Reversible Delivery
- Added sections:
  - Engineering Constraints
  - Development Workflow and Quality Gates
- Removed sections: placeholder-only template sections
- Templates updated:
  - ✅ .specify/templates/plan-template.md
  - ✅ .specify/templates/spec-template.md
  - ✅ .specify/templates/tasks-template.md
  - ✅ AGENTS.md
- Deferred items: none
-->
# AI Efficiency Constitution

## Core Principles

### I. Evals Are the Specification

Every behavior change MUST begin with a deterministic eval that fails for the
expected reason. Implementation MUST follow a red-green-refactor loop, and all
focused evals plus repository-wide verification MUST pass before a change is
committed or merged. A benchmark claim MUST name its baseline, fixture, metric,
sample size, and limitations. A passing build alone is not evidence that an
operational method is correct.

### II. Public-Safe Synthetic Data

Tracked fixtures and examples MUST contain synthetic data only. Stable entity
identifiers MUST use declared `SYNTH-` namespaces. Schemas MUST fail closed on
unknown fields, free text, direct identifiers, precise real locations, and
values resembling tracking, employee, customer, route, address, manifest, or
source-system identifiers. Rejected values MUST NOT appear in logs or derived
artifacts. Locally prepared scrubbed inputs MUST remain in documented ignored
paths and MUST never be copied into tracked locations automatically.

### III. Human-Controlled Operations

Software in this repository MUST remain advisory. It MUST NOT dispatch routes,
change staffing, score employees, send messages, call live operational write
APIs, deploy production systems, or present simulated output as an authorized
decision. Every decision artifact MUST preserve its snapshot time, policy,
model, plan, constraints, provenance, and limitations. Infeasible or
incomparable plans MUST suppress recommendations rather than produce a forced
ranking.

### IV. Dimensional and Evidence Integrity

Every measure MUST have an explicit unit and semantic definition. Every rate
MUST name its numerator, denominator, and time basis; additive components MUST
be aggregated before a rate is derived. Forecasts MUST be leakage-safe and
evaluated out of sample against simple baselines. Hard operational constraints
MUST NOT be converted into cheap objective penalties. Correlation, simulation,
finite differences, and options-language analogies MUST NOT be described as
causation or financial pricing.

### V. Simplicity and Reversible Delivery

Implement the smallest independently useful slice. Standard-library Node.js is
the default for new offline analytics; a dependency MUST demonstrate a concrete
eval benefit that cannot reasonably be achieved with existing code. Shared
modules require at least two current call sites. Changes MUST be surgical,
reviewable, and independently revertible. Stage files by explicit path; `git
add .` and `git add -A` are prohibited.

## Engineering Constraints

- The default workflow MUST run offline and deterministically on macOS and the
  Linux GitHub Actions runner using the repository-supported Node.js version.
- JSON is the canonical machine-readable artifact. Markdown MAY render the same
  facts but MUST NOT introduce calculations or claims absent from JSON.
- Randomized scenarios MUST accept an explicit seed. Golden outputs MUST not
  contain wall-clock timestamps, random identifiers, network results, or model
  output.
- Validation and privacy checks MUST complete before analytics or artifact
  writes. Successful writes MUST be atomic.
- Existing user changes and unrelated starter projects MUST remain untouched.
- No production deployment, live FedEx integration, or external communication
  is authorized by a specification, plan, task, or test result.

## Development Workflow and Quality Gates

1. Begin from an approved feature specification and declare exact boundaries.
2. Write a plan that maps every requirement to files, interfaces, and evals.
3. Generate dependency-ordered tasks in which each behavior follows:
   failing eval, observed failure, minimal implementation, passing eval, commit.
4. Re-run focused evals after each task and full verification at integration
   checkpoints.
5. Run Spec Kit consistency analysis before implementation and again before a
   pull request.
6. Record exact commands and observed results. Do not claim unrun verification.
7. Use one concern per commit and pull request. Major dependencies, live data,
   production actions, and outward messages remain explicit human gates.

## Governance

This constitution governs all Spec Kit artifacts and implementation work in
this repository. `AGENTS.md` may add compatible operating detail but cannot
weaken these principles. Amendments require a documented rationale, a migration
impact assessment, updates to dependent templates, and semantic versioning:
MAJOR for incompatible governance changes, MINOR for new or materially expanded
principles, and PATCH for non-semantic clarification. Every plan MUST pass the
Constitution Check before research and after design; every pull request MUST
report applicable gates and evidence.

**Version**: 1.0.0 | **Ratified**: 2026-07-15 | **Last Amended**: 2026-07-15
