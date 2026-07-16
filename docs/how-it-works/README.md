# How It Works — Real Systems, Real Runs

This series answers one question with evidence: **"has anyone actually built
anything with AI here?"** Yes — and every page in this series shows the real
thing working: actual architecture diagrams of code that exists in this repo,
actual commands you can run today, and actual captured output (including one
production failure that the system handled exactly as designed).

Nothing on these pages is a mockup. Where a system uses synthetic demo data,
the page says so and shows you where the label lives in the code.

## The Platform on One Page

```text
                        ┌─────────────────────────────────────────────┐
                        │            IDEAS COME IN THE DOOR           │
                        │   pilot template · idea intake · CTO call   │
                        └──────────────────────┬──────────────────────┘
                                               │
       ┌───────────────────────────────────────┼─────────────────────────────────────┐
       │                                       │                                     │
       ▼                                       ▼                                     ▼
┌──────────────────┐            ┌─────────────────────────────┐        ┌──────────────────────────┐
│  EVERYDAY LAYER  │            │   DECISION-SUPPORT LAYER    │        │       AGENT LAYER        │
│  (no install)    │            │   (real apps, no AI in the  │        │  (AI with hard rails)    │
│                  │            │    numbers)                 │        │                          │
│ 52 prompts       │            │                             │        │ Logistics Intelligence   │
│ + Prompt         │            │ Signal Lab ──── "is the     │        │   Gemini drafts briefs   │
│   Explorer       │            │   SPC + Nelson   KPI move   │        │   on Cloud Run — LIVE    │
│ + prompts.json   │            │   rules          real?"     │        │                          │
│   (for agents)   │            │                             │        │ ADK Shift-Brief Agent    │
│                  │            │ TLH/SPH ─────── "which      │        │   read-only tools,       │
│ any model:       │            │   Explorer       lever      │        │   CI-tested guardrails,  │
│ Gemini, Copilot, │            │   exact split    moved it?" │        │   Gemini Enterprise-     │
│ ChatGPT, Claude  │            │                             │        │   ready                  │
│                  │            │ Priority Metrics CLI        │        │                          │
│                  │            │   targets · risk lineage ·  │        │                          │
│                  │            │   95 tests                  │        │                          │
└────────┬─────────┘            └──────────────┬──────────────┘        └────────────┬─────────────┘
         │                                     │                                    │
         │            deterministic math makes the FACTS; AI only drafts PROSE      │
         └─────────────────────────────────────┼────────────────────────────────────┘
                                               ▼
                        ┌─────────────────────────────────────────────┐
                        │            HUMAN REVIEW — ALWAYS            │
                        │  every output labeled · every draft says    │
                        │      "Needs manager verification."          │
                        └──────────────────────┬──────────────────────┘
                                               ▼
                        ┌─────────────────────────────────────────────┐
                        │                GOVERNANCE GATE              │
                        │  public/synthetic data only · checklists ·  │
                        │  CI checks on every PR · internal data and  │
                        │  actions stay gated until FedEx approves    │
                        └─────────────────────────────────────────────┘
```

## The Walkthroughs

Read in any order; each stands alone.

| Page | The system | What you'll see working |
| --- | --- | --- |
| [A Prompt, Start to Finish](a-prompt-in-action.md) | The prompt library | A real template → filled scenario → unedited AI output → the human step |
| [Logistics Intelligence System](logistics-intelligence-system.md) | Deployed Cloud Run app | A real captured request to the live service — and its graceful fallback firing in production |
| [The Offline Analytics Duo](signal-lab-and-efficiency-explorer.md) | Signal Lab + TLH/SPH Explorer | The actual SPC rules and the exact decomposition formula, plus a passing verification run |
| [Priority Metrics Intelligence](priority-metrics-intelligence.md) | Deterministic metrics CLI | A real end-to-end run: CSV in, risk lineage and manager brief out |
| [The ADK Shift-Brief Agent](adk-shift-brief-agent.md) | Our first true AI agent | The agent loop, the five read-only tools, and the CI-enforced guardrail test run |

## The Design Rules You'll See Everywhere

Five rules repeat across every system, because they're the platform:

1. **Deterministic math makes the facts; AI drafts the prose.** If prose and
   numbers disagree, the numbers win.
2. **Every output is labeled** — synthetic vs public vs forecast, `gemini` vs
   `fallback`, source labels that travel with the data.
3. **A human owns every decision.** Nothing here sends, posts, deploys, or
   decides.
4. **Guardrails are tests, not promises.** CI runs the docs checks, the
   guardrail checks, and the app build on every pull request.
5. **Evidence before adoption.** A fancier model must beat the simple baseline
   in a walk-forward benchmark before it earns a pilot —
   [the first challenger didn't](../../starter-projects/forecast-foundation-model-spike/README.md).
