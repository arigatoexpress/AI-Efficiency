# Google AI Studio Guide

Last reviewed: 2026-05-22

Google AI Studio is useful for fast prototyping with Gemini. It can create
prompts, generate apps in Build mode, preview the result, export code, push to
GitHub, and deploy to Cloud Run.

Official references:

- [Google AI Studio at I/O 2026](https://blog.google/innovation-and-ai/technology/developers-tools/google-ai-studio-io-2026/)
- [Google AI Studio quickstart](https://ai.google.dev/gemini-api/docs/ai-studio-quickstart)
- [Build apps in Google AI Studio](https://ai.google.dev/gemini-api/docs/aistudio-build-mode)
- [Develop full-stack apps](https://ai.google.dev/gemini-api/docs/aistudio-fullstack)
- [Deploying from Google AI Studio](https://ai.google.dev/gemini-api/docs/aistudio-deploying)

## What Changed At Google I/O 2026

Google announced several AI Studio updates:

- Workspace integrations for apps built in AI Studio.
- Export to Google Antigravity for local development.
- Custom asset generation through the Build agent.
- Preview-window editing by annotating the app directly.
- A Google AI Studio mobile app for building and previewing on the go.
- Native Android app generation in the Build tab.
- In-browser Android emulator and ADB support.
- Google Play Internal Test Track support.
- No-cost deployment for the first two apps for new builders, with limits and
  plan details subject to Google terms.

For this team, the most useful point is simple: AI Studio can quickly turn an
idea into a demo. It does not make the demo approved for real FedEx data or
production use.

## How We Use It

Use AI Studio for:

- quick prototypes;
- non-sensitive demos;
- testing prompts;
- exploring a workflow before asking engineering for production support.

Do not use AI Studio for:

- confidential data;
- real customer/package/employee data;
- production operational actions;
- unmanaged external sharing;
- anything that needs official approval before use.

## Prototype Workflow

1. Write the use case in plain English.
2. Use synthetic or scrubbed sample data.
3. Build the first app in AI Studio.
4. Save the link in the relevant starter-project folder.
5. Export or push code to GitHub when ready for review.
6. Add a demo script and governance checklist.
7. Ask IT/governance what must change before a pilot.

## Beginner Prompt For AI Studio

```text
Build a simple internal prototype for operations managers.

Purpose:
[describe the task]

Users:
Non-technical operations managers.

Data:
Use synthetic sample data only.

Requirements:
- plain-English interface;
- no login or real data integration yet;
- no external sends;
- no production actions;
- clear "prototype only" banner;
- output includes "Needs verification" when information is missing.
```

## Sharing Rules

Before sharing an AI Studio app:

- confirm the app contains no secrets;
- confirm the app contains no sensitive data;
- check whether API calls may count toward the owner's usage or cost;
- confirm viewers are allowed to see the generated code;
- document who has access and why.

## Current AI Studio App

Starter reference:

```text
https://ai.studio/apps/6f606096-3be8-4ed9-a3d8-a0b27fde25af
```

Unauthenticated access redirects to Google sign-in. To make this repo useful for
review, export the AI Studio app code or add screenshots that reveal no
sensitive data. Then update the starter project folder with:

- source link;
- screenshots;
- demo script;
- data classification;
- review checklist;
- owner.

## Production Note

AI Studio can deploy apps to Cloud Run and can store Gemini API keys as
server-side secrets. That is helpful, but it does not make a prototype approved
for production. Production still needs company review for data handling,
security, access control, monitoring, ownership, and support.

## Export Review Checklist

Before adding an AI Studio app to this repo:

- Check for API keys, secrets, and private links.
- Replace real data with synthetic examples.
- Add a README using [the documentation standard](../documentation-standard.md).
- Add a demo script.
- Add governance-review notes.
- State whether the app can read Workspace data.
- State whether the app can take actions or only draft outputs.
