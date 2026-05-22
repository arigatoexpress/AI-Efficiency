# FedEx Ops Bid Assistant

## Status

AI Studio source awaiting export. Not production. Not approved for live bid,
pricing, customer, procurement, or contractual use.

## AI Studio App

```text
https://ai.studio/apps/6f606096-3be8-4ed9-a3d8-a0b27fde25af
```

Checked on 2026-05-22: unauthenticated access redirects to Google sign-in before
the app contents are visible.

## Intended Use

This starter is for a non-technical operations manager workflow that helps
organize bid or opportunity information into a clearer review packet.

The assistant should help with:

- intake questions;
- readiness checklists;
- missing-information lists;
- operational constraints;
- draft internal summaries;
- go/no-go discussion prep.

It should not:

- submit bids;
- set prices;
- make binding commitments;
- promise service levels;
- use confidential customer data in an unapproved tool;
- replace legal, procurement, sales, finance, or governance review.

## Recommended First Demo

Use a synthetic scenario:

```text
A regional operations team is evaluating whether it can support a hypothetical
new recurring pickup/delivery opportunity. The team needs to identify missing
information, operational constraints, review owners, and next steps before any
formal decision.
```

Show that the app produces:

- clean intake summary;
- missing data questions;
- operational risk checklist;
- review-owner list;
- next-step plan.

## Source Export Checklist

When exporting from AI Studio, add:

- generated source or GitHub export link;
- screenshots with synthetic data only;
- original prompt used to create the app;
- model and tools used;
- whether Gemini API calls are server-side only;
- data classification notes;
- known limitations;
- governance review status.

## Production Gates

This cannot move beyond prototype until:

- approved data categories are documented;
- app access is controlled;
- source is reviewed;
- AI outputs are clearly drafts;
- human approval is required before any external communication;
- official owners are named;
- governance signs off on the workflow.
