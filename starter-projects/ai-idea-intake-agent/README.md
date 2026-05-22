# AI Idea Intake Agent

## What This Is

AI Idea Intake Agent is a safe concept for a Teams/Copilot or Gemini-channel
assistant that collects AI ideas from employees, organizes them, and routes them
into this repository as reviewed use cases.

It is not a model-training system. It is an intake, triage, documentation, and
handoff system.

## Who It Helps

- Employees who have ideas but do not know how to write a technical proposal.
- Managers who want a clean way to collect feedback and pain points.
- The AI efficiency team, which needs a repeatable way to prioritize ideas.
- IT and AI governance reviewers, who need consistent data and risk summaries.

## When To Use It

Use the agent when someone wants to submit:

- an AI use-case idea;
- a workflow pain point;
- a prompt that helped;
- a request for training material;
- a safe screenshot of a confusing workflow;
- feedback about an AI tool or pilot.

## Do Not Use It For

- HR complaints or employee performance reviews;
- customer/package data submission;
- confidential operational screenshots;
- pricing, contract, bid, or procurement details;
- production incidents requiring urgent escalation;
- automatic model training;
- automatic publication to GitHub without human review.

## Recommended First Platform

Start with Microsoft Teams and Microsoft 365 Copilot if that is the current
approved workplace surface.

Why:

- employees already know Teams;
- Teams supports channel conversations and file attachments;
- Copilot Studio can publish agents into Teams and Microsoft 365 Copilot;
- Teams app permissions and admin approval provide a natural governance gate.

Important caveat: file and image uploads to a Teams bot require careful review.
Microsoft's Teams app permissions guidance says a file sent to a bot can leave
the corporate network and requires user approval for each file. Version 0 should
therefore avoid automatic screenshot ingestion.

Future option: a Gemini/Google Workspace version if FedEx approves a Gemini
Workspace path and the data rules are clear.

## Plain-English Workflow

1. Employee posts an idea or uses a form in the AI Ideas channel.
2. Agent asks a few clarifying questions.
3. Agent warns the user not to include sensitive data.
4. Agent classifies the idea by value, risk, data sensitivity, and owner.
5. Agent creates a draft intake packet.
6. Human reviewer approves, edits, rejects, or asks for more information.
7. Approved ideas become GitHub issues, prompt-library updates, starter-project
   folders, or governance review packets.

## What The Agent Should Capture

- Problem statement.
- Who the workflow affects.
- Current manual process.
- Time or quality pain point.
- Data needed.
- Sensitive data risk.
- Suggested tool: ChatGPT, Copilot, Gemini, AI Studio, or other.
- Human review requirement.
- Expected benefit.
- Proposed next step.

## What The Agent Should Not Store

- Real tracking numbers.
- Customer data.
- Employee records or performance reviews.
- Private screenshots.
- Credentials.
- Confidential bid, pricing, or contract material.
- Private system logs.

## Training And Learning Boundary

The agent can help build a reviewed knowledge base:

- common use cases;
- reusable prompts;
- common risks;
- approved examples;
- rejected examples and why they were rejected.

The agent must not automatically train or fine-tune a model from employee
feedback, screenshots, reviews, or operational examples. If the team later wants
model training, that needs a separate approved data, privacy, security, and
retention plan.

## First Safe Version

Version 0 should be simple:

- one Teams channel or private pilot group;
- one intake form;
- no automatic screenshot ingestion;
- no HR/performance feedback;
- no confidential data;
- human review before GitHub updates;
- weekly summary for the AI efficiency team.

## GitHub Linkage

Approved ideas can become:

- GitHub issue from the use-case template;
- prompt-library pull request;
- new starter-project folder;
- governance checklist update;
- training-guide update.

The agent should never write directly to `main`. It should draft an issue or a
pull request for review.

## Official Reference Points

- [Microsoft 365 Copilot extensibility](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/)
- [Connect a Copilot Studio agent to Teams and Microsoft 365 Copilot](https://learn.microsoft.com/en-us/microsoft-copilot-studio/publication-add-bot-to-microsoft-teams)
- [Microsoft Teams app permissions and consent](https://learn.microsoft.com/en-us/microsoftteams/app-permissions)
- [Google Workspace updates at I/O 2026](https://blog.google/products-and-platforms/products/workspace/workspace-updates/)
- [Google AI Studio at I/O 2026](https://blog.google/innovation-and-ai/technology/developers-tools/google-ai-studio-io-2026/)
