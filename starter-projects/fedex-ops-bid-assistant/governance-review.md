# FedEx Ops Bid Assistant Governance Review Notes

## Current Data

Use synthetic or non-sensitive opportunity descriptions only.

Do not use:

- real customer names;
- pricing;
- contract terms;
- confidential opportunity details;
- proprietary capacity data;
- employee data;
- package or route-sensitive data;
- internal financial assumptions.

## Main Risks

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Binding commitment | AI may draft language that sounds official. | Require human and legal/commercial review before sending. |
| Pricing leakage | Bid data can be sensitive. | Do not enter real pricing or deal economics. |
| Operational overpromise | AI may imply capacity or service levels. | Require source verification and owner approval. |
| Data exposure | Public or unapproved tools may retain data. | Use synthetic data until approved. |
| Confusing draft with decision | A summary may look authoritative. | Label outputs as drafts and include "Needs verification." |

## Required Reviews

- AI governance.
- Data privacy.
- Security.
- Legal/compliance if customer-facing language or bid terms are involved.
- Business owner for the operational process.

## Minimum Safe Pilot

- Synthetic scenarios only.
- Internal review only.
- No customer-facing output.
- No pricing.
- No production system integration.
- Measured success: time saved creating intake packets and fewer missing
  questions during review.
