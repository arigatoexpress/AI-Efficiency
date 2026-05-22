# Google AI Studio Guide

Google AI Studio is useful for fast prototyping with Gemini. It can create
prompts, generate apps in Build mode, preview the result, export code, push to
GitHub, and deploy to Cloud Run.

Official references:

- [Google AI Studio quickstart](https://ai.google.dev/gemini-api/docs/ai-studio-quickstart)
- [Build apps in Google AI Studio](https://ai.google.dev/gemini-api/docs/aistudio-build-mode)
- [Develop full-stack apps](https://ai.google.dev/gemini-api/docs/aistudio-fullstack)
- [Deploying from Google AI Studio](https://ai.google.dev/gemini-api/docs/aistudio-deploying)

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
