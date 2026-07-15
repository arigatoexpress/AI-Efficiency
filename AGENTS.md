# AI Efficiency Team — Agent Notes

This repository is a public-safe documentation and starter-project hub for an operations-led AI efficiency team at FedEx. It contains plain-English guides, copyable prompts, governance-ready prototype scaffolds, and a live full-stack decision-support demo.

## What this repo does

The repo turns operational friction into reusable AI assets: prompts for managers, starter projects for developers, and checklists for governance reviewers. Everything is designed for non-technical readers first, with technical depth available in the starter projects.

## Scope & Evals (Verification)
- **Repo Nature:** A documentation hub with focused offline analytics starters and one React/Vite/Express application under `starter-projects/fedex-logistics-intelligence-system/app`.
- **Evals & Build:** Run the focused commands listed below plus the application typecheck/build before handoff.
- **CI:** `.github/workflows/ci.yml` runs documentation, prompt-index, TLH/SPH, ADK, typecheck, and application-build gates on pushes and pull requests.
- **Constraints:** Avoid introducing root-level runtime dependencies or lockfiles. Keep changes highly surgical.

## Key directories and files

| Path | Purpose |
|------|---------|
| `docs/` | Human-first guides, governance checklists, technology how-tos, and templates |
| `docs/ai-workplace-user-guide.md` | Onboarding doc for the least technical teammate |
| `docs/fedex-ai-literacy-guide.md` | How the repo aligns with FedEx's enterprise AI Education program |
| `docs/fedex-terminology.md` | Quick reference for FedEx operations terms — source of truth for the "FEC supervisors and managers" audience term |
| `docs/technology/agentic-ai-for-operations.md` | The agency ladder — manager-level guide to agentic AI, indexes the ADK and intake-agent docs |
| `docs/pilot-program-template.md` | Template for proposing small, measurable AI pilots |
| `docs/demo-script.md` | Script for presenting the repo and prototype to leadership |
| `docs/documentation-standard.md` | Style guide for all repo docs and starter projects |
| `prompts/` | Copy-paste prompt library organized by operational area |
| `prompts/README.md` | Index of 51 prompts across 10 categories |
| `prompts/explorer.html` | Offline search-and-fill Prompt Explorer (data injected by the build script) |
| `prompts/prompts.json` | Machine-readable prompt index — generated; edit the markdown, then run `scripts/build-prompt-index.mjs` |
| `starter-projects/` | Runnable prototypes (React/Vite, AI Studio, Cloud Run) |
| `starter-projects/fedex-logistics-intelligence-system/` | Most mature prototype — public-data ops dashboard with multi-station scenarios |
| `starter-projects/dock-efficiency-signal-lab/` | Offline SPC + TA + forecasting on weekly dock KPIs (is the move real?) |
| `starter-projects/tlh-sph-efficiency-explorer/` | Offline TLH/SPH decomposition (which lever moved?) — companion to the Signal Lab |
| `starter-projects/fhe-private-scoring-spike/` | Executed Phase 7 research benchmark: encrypted scoring with Concrete ML (synthetic, local) |
| `starter-projects/forecast-foundation-model-spike/` | Executed Phase 5 benchmark: Chronos-Bolt vs the Signal Lab ensemble (ensemble won) |
| `starter-projects/adk-shift-brief-agent/` | First ADK agent (offline-tested starter kit) — read-only tools, synthetic signals, Gemini Enterprise-ready |
| `docs/technology/gemini-enterprise-readiness.md` | Day-one plan for the pending Gemini Enterprise access request |
| `docs/technology/copilot-teams-playbook.md` | Microsoft-first ops playbook: Copilot tiers, four prompt elements, role-by-role guidance, skills ladder |
| `assets/` | Banners, screenshots, and architecture diagrams |
| `.github/ISSUE_TEMPLATE/` | Issue templates for governance review |
| `CONTRIBUTING.md` | Full contribution process |
| `ROADMAP.md` | Phased plan for prompts, data layer, Foundry, and chat-agent work |

## How to run / develop

This repo is primarily documentation; there is no unified dev server.

- **Starter projects:** Each subfolder has its own README and run instructions.
- **Docs:** Edit in Markdown and preview with any Markdown renderer.
- **Logistics Intelligence System:** See `starter-projects/fedex-logistics-intelligence-system/README.md` for `npm install && npm run dev`.

### Verification (run by CI on every PR — run locally before handing back)

- `node scripts/check-docs.mjs` — relative links, raw.githack paths, prompt-count claims, HTML balance, offline CSP.
- `node starter-projects/tlh-sph-efficiency-explorer/test/run-checks.mjs` — the explorer's exact-decomposition identity, validation cases, demo stories, CSV intake, offline guarantees.
- `python3 starter-projects/adk-shift-brief-agent/test/run_checks.py` — the ADK kit's tools, safety gate, offline guarantee, and (if google-adk is installed) agent wiring.
- `node scripts/build-prompt-index.mjs --check` — prompts.json and the Prompt Explorer's embedded data match the prompt markdown (regenerate without `--check` after editing prompts).
- In `starter-projects/fedex-logistics-intelligence-system/app`: `npm ci && npx tsc --noEmit && npm run build`.

## Safety boundaries

- **Do NOT** add secrets, credentials, customer data, package data, employee data, route manifests, or proprietary FedEx internal data.
- **Do NOT** copy private source projects into this repository unless Ari explicitly confirms the target visibility and sharing scope.
- **Do NOT** claim a project is production-ready unless it has live verification, documented owners, approved data handling, and governance signoff.
- Preserve clear language around prototypes, paper-only demos, synthetic data, and human review.

## Documentation style

- Write for non-technical FEC supervisors and managers first.
- Use plain English, short sections, and copyable examples.
- Assume the reader is intelligent but busy and may be brand new to AI.
- Explain acronyms the first time they appear.
- Start each guide with who it is for, when to use it, and what not to do.
- Prefer checklists and templates over abstract policy language.
- Use authentic FedEx terminology (see `docs/fedex-terminology.md`) but never expose internal procedures or systems.

## Current status

Active. Presentation-ready for the regional AI Efficiency group standup.

- ✅ Root README with compelling narrative and quick-start paths
- ✅ 51 FedEx-specific prompts across 10 categories
- ✅ FedEx AI literacy guide aligned with enterprise AI Education program
- ✅ Pilot program template and demo script
- ✅ Logistics Intelligence System with 4 multi-station scenarios
- ✅ Source-owned rebuild builds clean with zero warnings
- ✅ All synthetic data clearly labeled; no production claims
- ✅ CTO review feedback implemented: "FEC supervisors and managers" audience standard (glossary is source of truth), agentic AI agency-ladder guide, TLH/SPH Efficiency Explorer (offline, exact decomposition)
- ✅ Phase 5 & 7 research spikes executed with measured results: the Signal Lab forecast ensemble beat zero-shot Chronos-Bolt (MASE 0.845 vs 0.895 — no pilot earned), and FHE encrypted scoring ran at ~5.3 ms/sample with near-parity accuracy (research track; security review pending)

---

# AGENTS.md — Operating Charter

> Guiding principles for any AI agent (or human) working in this repo. Derived from the Andrej Karpathy engineering philosophy. Tool-neutral: applies whether you drive this repo with Claude Code, goose, or by hand.

## The four rules
1. **Simplicity first.** Write the minimum code that solves the task. No speculative abstractions, no unrequested features, no single-use platforms. Extract a shared module only when there are >= 2 real call-sites today.
2. **Surgical changes, one concern per PR.** Touch only what the task requires. Do not opportunistically reformat, bump unrelated deps, or fix adjacent dead code. Small, reviewable, independently revertable diffs.
3. **Evals are the spec.** Define and run the repo verification (tests, build, typecheck, smoke) BEFORE and AFTER a change. Nothing merges unless it stays green. Keep the generate->verify loop tight and reversible.
4. **Delete > add; fewer dependencies.** Removing code, repos, and dependencies is the highest-leverage move. Every dependency is attack surface you own. Pin and lock what remains. Humans stay in the loop for irreversible / outward-facing / production steps (deletes, credential rotation, infra teardown, deploys).

## Safety
- Never use `git add .` or `git add -A` — stage changed files by explicit path (avoids sweeping in WIP or secrets).
- Never commit secrets; `.env*` stays gitignored (except `.env.example`).
- Treat anything outward-facing or irreversible as draft-then-confirm.

<!-- SPECKIT START -->
Before feature work, read `.specify/memory/constitution.md` and the applicable
`spec.md`, `plan.md`, and `tasks.md`. The constitution is binding; the feature
artifacts provide the exact technologies, structure, commands, and eval gates.
<!-- SPECKIT END -->
