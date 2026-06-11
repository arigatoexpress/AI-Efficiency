# Gemini Enterprise — Day-One Readiness

Last reviewed: 2026-06-11

We have requested Gemini Enterprise access from the organization's team. This
page is the plan for the gap between "requested" and "granted": what we prepare
now, what we do the day access lands, and what stays gated no matter what the
license enables.

**Who this is for:** FEC supervisors and managers first; an engineering section
follows. **What not to do:** do not buy seats, connect data sources, or promise
capabilities before the org team confirms the edition and terms.

Official references:

- [Gemini Enterprise product page](https://cloud.google.com/gemini-enterprise)
- [Register and manage ADK agents](https://docs.cloud.google.com/gemini/enterprise/docs/register-and-manage-an-adk-agent)
- [Register and manage A2A agents](https://docs.cloud.google.com/gemini/enterprise/docs/register-and-manage-an-a2a-agent)
- [Agent Development Kit docs](https://google.github.io/adk-docs/)

## What Gemini Enterprise Is (Plain English)

Gemini Enterprise is Google's workplace AI platform: a company-managed front
door where team members chat with Gemini models, use prebuilt agents, and —
with admin approval — use custom agents the company builds. The part that
matters for us: it is **managed by the organization**, with admin controls over
who can use what and which data sources are connected. That is the environment
our governance posture has been waiting for.

It ships in several editions (Business; Standard, Plus, and Frontline at last
check). **Which edition we get decides what we can do — confirm with the org
team before planning around any specific feature.**

## Why We Are Ready (What's Already Done)

The repo was built so that enterprise access is a connection step, not a
rebuild:

| Asset | Status | Day-one use |
| --- | --- | --- |
| [51-prompt library](../../prompts/README.md) | Ready | Works as-is in the Gemini Enterprise chat — same prompts, now under company management. |
| [Daily Ops Playbook](../daily-ops-playbook.md) | Ready | The daily routine, unchanged — just run inside the approved tool. |
| [ADK shift-brief agent starter kit](../../starter-projects/adk-shift-brief-agent/README.md) | Built + tested offline | Our first registrable custom agent: ADK-built agents can be registered into Gemini Enterprise by an admin. |
| [Agency-ladder guide](agentic-ai-for-operations.md) | Ready | The shared language for deciding how much autonomy any agent gets. |
| [Governance checklist](../governance/project-review-checklist.md) | Ready | The review every connected agent or data source goes through first. |

## Day-One Checklist (When Access Lands)

Managers and the team lead:

1. **Confirm the basics with the org team:** edition, seat count, who the
   admin is, and the data-protection terms that apply to prompts and outputs.
2. **Move daily prompting into Gemini Enterprise.** Same prompt library, same
   Safe Prompt Rule — the win is that usage now happens inside a
   company-managed tool instead of personal accounts.
3. **Re-read the data rules.** Enterprise access changes who manages the tool,
   not what belongs in it: confidential, customer, package, route, employee,
   and security data stay out until governance explicitly approves a connected,
   classified path.

Engineers (with the admin):

4. **Verify the agent path:** confirm whether our edition supports registering
   custom agents, and whether the admin will register the
   [shift-brief agent](../../starter-projects/adk-shift-brief-agent/README.md)
   (ADK registration or A2A connection are the two documented routes).
5. **Run the kit against an approved key.** The kit is tested offline today;
   first live run happens under the enterprise account, not a personal key.
6. **Start the governance review** for that one agent using the
   [project review checklist](../governance/project-review-checklist.md) —
   read-only tools, public/synthetic data, human review on every output.

## What Does NOT Change

- **The data boundary.** A license is not a data approval. Internal package,
  route, customer, employee, pricing, and security data stay out of every
  agent and prompt until FedEx IT and AI governance approve a classified path.
- **Human review.** Every draft keeps its "Needs manager verification" line,
  in or out of Gemini Enterprise.
- **Agent autonomy.** Agents stay at the supervised rungs of the
  [agency ladder](agentic-ai-for-operations.md): they draft and analyze; they
  do not send, dispatch, or change anything.

## Accuracy Notes

Product facts above are described conservatively as of the review date and
change quickly: editions, features, agent-registration availability, and terms
depend on Google's current offering and our organization's agreement. Confirm
against the official references and the org team before committing to
specifics in a pilot.
