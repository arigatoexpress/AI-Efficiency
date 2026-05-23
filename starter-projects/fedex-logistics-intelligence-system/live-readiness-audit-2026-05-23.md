# Live Readiness Audit - 2026-05-23

## Scope

This audit covers the public Cloud Run prototype:

```text
https://fedex-logistics-intelligence-system-s77j6bxyra-ue.a.run.app
```

It is a read-only audit. No source, Cloud Run traffic, IAM, data, or runtime
settings were changed.

## Live Readback

| Check | Result |
| --- | --- |
| Public HTTP route | `200` |
| Cloud Run service | `fedex-logistics-intelligence-system` |
| Region | `us-east1` |
| Latest ready revision | `fedex-logistics-intelligence-system-00005-4vs` |
| Source artifact | AI Studio compiled `version-5` bundle |
| Browser render | Page renders; map controls and legend are visible |
| Browser console | Three `/favicon.ico` 404 errors |

## Blockers Before Broad Demo

1. Remove command-console language.

   Replace "reroute command", "CMD logs", and similar copy with manager draft
   and verification language.

2. Remove fake CCTV and security language.

   Replace "CCTV", "monitoring lock", "verified secure", and "authorized
   personnel" style labels with public-source or synthetic-overlay wording.

3. Label synthetic metrics directly.

   Package rates, conveyor capacity, vehicle tags, and load metrics must say
   `synthetic` where displayed.

4. Fix the favicon route.

   Add an inline favicon or real `/favicon.ico` so browser smoke does not carry
   avoidable console errors.

5. Replace the compiled artifact with source-owned code.

   The current artifact is useful for a demo, but it is not a maintainable
   source of truth.

## Safe Deployment Gate

Do not call the app production-ready until all of these are true:

- source exists in a reviewable GitHub repo or reviewed starter tree;
- `npm ci --ignore-scripts` or equivalent dependency guard is documented for
  rebuilds;
- browser smoke passes with zero console errors at desktop and phone sizes;
- the first viewport says `public-data decision-support prototype`;
- all synthetic values are visibly labeled;
- no UI button or input implies live dispatch, rerouting, package tracking, or
  official FedEx authority;
- rollback is documented as the prior Cloud Run revision:
  `fedex-logistics-intelligence-system-00005-4vs`.

## Recommended Next Build

Rebuild this as a small source-owned app with five panels:

- Shift Readiness
- Station Impact
- Route Watch
- Manager Drafts
- Source Trail

Keep the current map as visual inspiration, not as the production source tree.
