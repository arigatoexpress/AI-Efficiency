# Feedback And Screenshot Intake Rules

Last reviewed: 2026-05-22

Use this guide before collecting screenshots, manager feedback, employee
feedback, reviews, or operational examples for any AI project.

## Core Rule

Collect the minimum safe information needed to understand the use case. Do not
collect people data, customer data, package data, or confidential operations
details unless the workflow has been approved.

## What Is Allowed For Early Intake

Allowed with normal review:

- plain-English problem descriptions;
- synthetic examples;
- scrubbed screenshots with no people, customer, route, package, pricing, or
  private system data;
- public links;
- high-level workflow descriptions;
- optional submitter name and work area if the submitter agrees.

## What Is Not Allowed Without Approval

Do not collect:

- customer names, addresses, phones, signatures, delivery photos, or tracking
  numbers;
- employee records, performance reviews, discipline notes, HR details, or
  personal feedback about named people;
- route manifests, station-sensitive details, security procedures, or private
  system screens;
- pricing, contract terms, or confidential bid details;
- screenshots that show private chats, customer data, employee data, dashboards,
  credentials, or private links.

## Screenshot Rules

Before a screenshot is submitted:

1. Remove or blur names, photos, addresses, tracking numbers, customer details,
   employee details, private links, and credentials.
2. Crop to the smallest useful area.
3. Add a short text summary so the screenshot is not the only source.
4. Confirm the screenshot can be stored in the selected system.
5. If unsure, do not upload it.

For Teams/Copilot-style agents, treat file and image uploads as sensitive. Teams
app guidance notes that files sent to a bot can leave the corporate network and
require user approval for each file. That means screenshot upload should be off
by default until IT, security, privacy, and governance approve the exact flow.

## Feedback Rules

Feedback should describe the workflow, not judge a person.

Good:

```text
It takes 20 minutes to turn shift notes into a clean handoff.
```

Not OK:

```text
[Named employee] always writes bad handoffs.
```

## Model Training Language

Avoid saying the bot will "train the model" on submissions.

Safer language:

```text
The agent will build a reviewed use-case catalog and knowledge base. Human
owners decide what becomes a prompt, guide, issue, prototype, or training
example.
```

Do not fine-tune, train, or automatically update a model from employee feedback,
screenshots, reviews, or operational examples without formal approval.

## Human Review Gate

Every submitted idea should pass through a human reviewer before it:

- appears in a public repo;
- becomes a prompt template;
- becomes a prototype;
- is routed to IT or governance;
- uses any sensitive data;
- affects people, customers, packages, or production systems.
