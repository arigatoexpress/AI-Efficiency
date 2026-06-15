# FedEx AI Literacy Guide

Last reviewed: 2026-05-27

This guide aligns with FedEx's enterprise **AI Education and Literacy program** (launched December 2025) and translates it into practical, operations-focused guidance for station and hub managers.

## Why AI Literacy Matters at FedEx

FedEx handles millions of shipments daily across Express, Ground, and Freight networks. The company generates over **2 petabytes of data per day** from its physical network. AI is not replacing FEC supervisors and managers — it is becoming a tool that helps managers make faster, better-informed decisions with cleaner data and clearer communication.

> "The future of business is being shaped by data and AI more than ever before. As FedEx continues its evolution into an AI-powered enterprise, our people remain at the heart of everything we do."  
> — Raj Subramaniam, President and CEO, FedEx Corporation

## What This Guide Is

- A practical companion to FedEx's formal AI training (internal modules + Accenture LearnVantage)
- Operations-specific examples you can use today
- Safety-first boundaries that protect you, your team, and the company

## What This Guide Is Not

- A replacement for FedEx's official AI training or compliance programs
- Permission to use any AI tool with confidential data
- A technical coding manual

## The FedEx AI Fluency Framework

FedEx's program builds fluency across three levels. This guide focuses on the first two, which apply to most FEC supervisors and managers.

| Level | What You Learn | FedEx Example |
|-------|---------------|---------------|
| **Awareness** | What AI is, what it can and cannot do, how to use it safely | Using Gemini to draft a shift handoff from scrubbed notes |
| **Application** | Using AI in your daily work with approved tools and data | Generating a pre-peak contingency brief with synthetic data |
| **Leadership** | Embedding AI into team operations and cross-functional workflows | Designing a pilot program for predictive load signals (requires governance approval) |

## 5 Operations Tasks AI Can Help With Today

### 1. Shift Briefings and Handoffs
Turn rough notes into a clean, consistent format. See [Daily Operations Prompts](../prompts/daily-operations.md).

### 2. Safety Communication
Draft huddle briefs, seasonal alerts, and near-miss reports. See [Safety and Compliance Prompts](../prompts/safety-and-compliance.md).

### 3. Peak and Surge Planning
Build contingency plans, staffing scenarios, and contractor coordination notes. See [Peak Season Prompts](../prompts/peak-season-and-surge.md).

### 4. Customer and Contractor Communication
Draft service alerts, escalation responses, and ISP briefings. See [Customer and Contractor Prompts](../prompts/customer-and-contractor-comms.md).

### 5. Process Improvement Documentation
Turn observations into structured improvement proposals with owners and metrics. See [Process Improvement Prompts](../prompts/process-improvement.md).

## The FedEx AI Safety Rules

These align with FedEx's "Safety Above All" value and the company's responsible AI approach.

### Never Paste Into Unapproved AI Tools
- Customer names, addresses, phone numbers, signatures, or photos
- Real tracking numbers or package details
- Route manifests or facility security details
- Employee records or performance data
- Pricing, contract terms, or bid information
- Passwords, API keys, or credentials

### Always Verify Before Acting
- AI can draft quickly. It can also invent facts.
- Check dates, numbers, names, and operational details against internal systems.
- If the AI says something you did not provide, treat it as unverified.

### Human Owns Every Decision
- AI drafts. Managers decide.
- Never send AI-written material externally without human review.
- Never let AI make safety, disciplinary, staffing, legal, or financial decisions.

## Approved Tools at FedEx

| Tool | Best For | What to Know |
|------|----------|-------------|
| **Gemini** (Google) | Drafting, research, Google ecosystem work, AI Studio prototyping | Check with your IT team on availability and data-handling rules for your region |
| **Microsoft 365 Copilot** | Work inside Outlook, Teams, Word, Excel, PowerPoint | Uses only content you have permission to access |
| **ChatGPT** (if approved) | Drafting, analysis, project workspaces | Confirm enterprise agreement and data retention policy with IT |
| **FedEx Internal AI Tools** | FedEx-specific workflows, Dataworks, approved pilots | Follow internal training and access controls |

## Getting Started in 10 Minutes

1. Open an approved AI tool.
2. Copy the [shift handoff prompt](../prompts/daily-operations.md#shift-handoff).
3. Replace the placeholder with scrubbed notes from a recent shift (remove all names, addresses, tracking numbers).
4. Review the output. Check for invented facts.
5. Edit it with your voice. Add specifics from your internal knowledge.
6. Save the prompt if it worked. Share it with your team.

## Source

- [FedEx AI Education and Literacy Program Announcement](https://newsroom.fedex.com/newsroom/global-english/fedex-empowers-global-workforce-with-ai-education-and-literacy-program) (FedEx Newsroom, December 2, 2025)
- [FedEx Dataworks](https://www.fedex.com/en-us/dataworks.html)
- [FedEx and ServiceNow AI Supply Chain Collaboration](https://newsroom.fedex.com/newsroom/global/fedex-and-servicenow-expand-strategic-collaboration-with-new-ai-powered-supply-chain-solution) (FedEx Newsroom, May 5, 2026)
- [FedEx AI-Powered Post-Purchase Solutions](https://newsroom.fedex.com/newsroom/global-english/fedex-to-offer-access-to-ai-powered-post-purchase-solutions-for-enterprises) (FedEx Newsroom, February 2, 2026)
- [Presentation proof points](presentation-proof-points.md)
