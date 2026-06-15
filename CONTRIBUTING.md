# Contributing

This repo is meant to be easy for FEC supervisors and managers to use.
Before submitting changes, run the verification commands listed in
[AGENTS.md](AGENTS.md) (CI runs the same checks on every pull request). Contributions do
not need to be complicated, but they do need to be clear and safe.

## Good Contributions

- A prompt that saves time on a recurring task.
- A short guide that helps a manager use an AI tool responsibly.
- A starter project with a plain-English purpose, screenshots, demo script, and
  governance checklist.
- A process improvement idea with success metrics and data needs.
- A review note that catches a privacy, security, or accuracy risk.

## Contribution Checklist

Before opening a pull request, confirm:

- The content does not include secrets, credentials, or private links.
- The content does not include real customer, employee, package, route, or
  facility-sensitive data.
- The audience is clear.
- The owner is clear.
- The expected operational benefit is clear.
- The human review step is clear.
- Any vendor or model-specific claims link to official documentation.
- The document follows the plain-English structure in
  [docs/documentation-standard.md](docs/documentation-standard.md).

## Git Hygiene

- Do **not** commit `node_modules/` or build artifacts such as `dist/`,
  `build/`, or `coverage/`.
- Keep the repo clean: rely on `.gitignore` and run `npm run build` locally
  rather than checking in compiled output.
- If you accidentally stage a dependency directory, remove it from the index
  with `git rm -r --cached <path>` before opening a pull request.

## Project Submission Format

Create a folder under `starter-projects/` with:

```text
starter-projects/project-name/
  README.md
  demo-script.md
  governance-review.md
```

Use the starter README to answer:

- What problem does this solve?
- Who uses it?
- What data does it need?
- What must never be pasted into it?
- What does a successful pilot look like?
- What review is required before broader rollout?

## Pull Request Expectations

- Keep the pull request small.
- Describe what changed and why.
- Include screenshots only when they do not reveal sensitive data.
- Request governance review for anything that may touch regulated data,
  operational systems, employee workflows, or customer communication.
