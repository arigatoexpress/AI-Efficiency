# AI Efficiency Team — Agent Notes

This repository is a public-safe documentation and starter-project hub for an operations-led AI efficiency team. It contains plain-English guides, copyable prompts, and governance-ready prototype scaffolds.

## What this repo does

The repo turns operational friction into reusable AI assets: prompts for managers, starter projects for developers, and checklists for governance reviewers. Everything is designed for non-technical readers first, with technical depth available in the starter projects.

## Key directories and files

| Path | Purpose |
|------|---------|
| `docs/` | Human-first guides, governance checklists, and technology how-tos |
| `docs/ai-workplace-user-guide.md` | Onboarding doc for the least technical teammate |
| `docs/documentation-standard.md` | Style guide for all repo docs and starter projects |
| `prompts/` | Copy-paste prompt library organized by operational area |
| `starter-projects/` | Runnable prototypes (React/Vite, AI Studio, Cloud Run) |
| `starter-projects/fedex-logistics-intelligence-system/` | Most mature prototype — public-data ops dashboard |
| `assets/` | Banners, screenshots, and architecture diagrams |
| `.github/ISSUE_TEMPLATE/` | Issue templates for governance review |
| `CONTRIBUTING.md` | Full contribution process |
| `ROADMAP.md` | Phased plan for AI Studio, Foundry, and chat-agent work |

## How to run / develop

This repo is primarily documentation; there is no unified dev server.

- **Starter projects:** Each subfolder has its own README and run instructions.
- **Docs:** Edit in Markdown and preview with any Markdown renderer.
- **Logistics Intelligence System:** See `starter-projects/fedex-logistics-intelligence-system/README.md` for `npm install && npm run dev`.

## Safety boundaries

- **Do NOT** add secrets, credentials, customer data, package data, employee data, route manifests, or proprietary FedEx internal data.
- **Do NOT** copy private source projects into this repository unless Ari explicitly confirms the target visibility and sharing scope.
- **Do NOT** claim a project is production-ready unless it has live verification, documented owners, approved data handling, and governance signoff.
- Preserve clear language around prototypes, paper-only demos, synthetic data, and human review.

## Documentation style

- Write for non-technical operations managers first.
- Use plain English, short sections, and copyable examples.
- Assume the reader is intelligent but busy and may be brand new to AI.
- Explain acronyms the first time they appear.
- Start each guide with who it is for, when to use it, and what not to do.
- Prefer checklists and templates over abstract policy language.

## Current status

Active. Ready for team documentation, prompt collection, public-data starter projects, and governance review. The Logistics Intelligence System starter project has a live Cloud Run prototype and a source-owned rebuild in progress.
