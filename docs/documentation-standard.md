# Plain-English Documentation Standard

Every README, user guide, starter project, and codebase document in this repo
should be useful to a non-technical operations manager.

## The Standard

A good document should answer these questions in the first minute:

- What is this?
- Who is it for?
- When should I use it?
- What should I not do with it?
- What is the safe first step?
- Who reviews or owns it?

## Required Sections For READMEs

Use this structure unless there is a strong reason not to:

```text
# Project Name

## What This Is

## Who It Helps

## When To Use It

## Do Not Use It For

## Safe Data Rules

## How To Start

## Example Prompts Or Workflows

## Review And Approval

## Status
```

## Writing Rules

- Use plain English.
- Keep paragraphs short.
- Use examples before theory.
- Explain acronyms the first time.
- Avoid hype words like "autonomous" unless the system truly acts on its own.
- Do not say "production-ready" unless there is evidence and approval.
- State limitations clearly.
- Put safety boundaries near the top, not buried at the bottom.
- Prefer checklists and tables for busy readers.

## Prompt Documentation Rules

Every prompt should include:

- when to use it;
- what data is allowed;
- what data is not allowed;
- the prompt text;
- how to review the output.

## Codebase Documentation Rules

If a starter project has code, its README should also include:

- local setup steps;
- demo steps;
- verification command;
- known limitations;
- data classification;
- live-action gates;
- rollback or stop instructions if anything goes wrong.

## Example Disclaimer

Use language like this:

```text
This is a prototype. It is not approved for production use. Use synthetic or
approved non-sensitive data only. A human owner must review all outputs before
they are shared or acted on.
```

## Final Test

Before publishing a document, ask:

Could a busy manager understand the purpose, risk, and next step without asking
a technical person to translate it?

If not, simplify it.
