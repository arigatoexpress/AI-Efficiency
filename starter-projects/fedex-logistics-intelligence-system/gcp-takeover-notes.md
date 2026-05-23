# GCP Takeover Notes

These notes describe what was verified from Google Cloud without publishing
private infrastructure details.

## Verified On 2026-05-22

- The relevant Cloud Run service is named `fedex-logistics-intelligence-system`.
- The service is in Google Cloud Run and is labeled as managed by Google AI
  Studio.
- The public URL is:
  `https://fedex-logistics-intelligence-system-s77j6bxyra-ue.a.run.app`
- The AI Studio app link is:
  `https://ai.studio/apps/6f606096-3be8-4ed9-a3d8-a0b27fde25af`
- The deployed artifact available from Cloud Run is compiled output, not clean
  editable source.

## What Was Inspected

- Cloud Run service metadata.
- Public HTTP response headers.
- Public app HTML.
- Generated build artifact structure.
- Browser snapshot of the deployed UI.

The inspected deployment contained:

```text
index.html
assets/
server.cjs
package.json
```

## Current Technical Assessment

The current deployment is useful as a visual prototype. It should not become the
canonical source of truth because it is compiled output.

Use it to learn the product direction, then either:

1. export the original AI Studio source to GitHub; or
2. rebuild clean source from [the AI Studio V2 prompt](ai-studio-v2-prompt.md).

## Live UI Patch On 2026-05-22

A small live patch was applied to the compiled AI Studio artifact to fix map
control visibility on laptop-sized screens.

What changed:

- map legend, quick preset controls, and zoom controls now render above the map
  layers;
- the map card no longer stretches into a large blank area;
- the browser no longer restores an old scroll position after the app rewrites
  the URL with map coordinates;
- a backup of the previous compiled artifact was kept before replacing the live
  artifact.

This is still a compiled-artifact patch, not clean source ownership. The next
proper engineering step is still to export or rebuild the source.

## Live UI Patch On 2026-05-23

A cache-busted `ops-map-control-fix-v4.css` patch was deployed to the Cloud Run
app.

What changed:

- the app now links to a new v4 stylesheet path, so browsers do not keep using
  the older cached map-control CSS;
- quick presets stay in the top-left of the map;
- zoom controls stay in the top-right of the map;
- the legend moves to the lower-right on desktop and becomes a readable
  full-width bottom panel on phone-sized screens;
- a small inline favicon prevents the previous favicon 404 console noise;
- the unused plaintext AI key environment variable was removed from the Cloud
  Run revision.

Verified immediately after that deployment:

- live Cloud Run revision advanced to `fedex-logistics-intelligence-system-00004-wld`;
- live HTML references `ops-map-control-fix-v4.css`;
- fresh browser console showed zero errors;
- Playwright geometry checks confirmed the map, presets, zoom controls, and
  legend are all visible at `1366x768` and `390x844`.

This remains a compiled-artifact hotfix. The durable source-code path is still
to export the original AI Studio source or rebuild the app as a normal reviewed
source tree. The later v5 readback below supersedes the v4 console-clean claim.

## Live Readback On 2026-05-23

A later read-only Cloud Run and Playwright pass found that the public service
had advanced to revision `fedex-logistics-intelligence-system-00005-4vs` from
the AI Studio compiled `version-5` artifact.

Confirmed:

- public route returned `200`;
- current HTML title is `FedEx RECON Logistics Intelligence System`;
- map preset controls, zoom controls, and legend are visible in the browser;
- the page shows a visible `PROTOTYPE ONLY` banner;
- Cloud Run source is still a compiled AI Studio artifact, not editable source.

Still not production-safe:

- `/favicon.ico` returns `404` and causes browser console noise;
- page copy still includes command-console language such as reroute commands;
- page copy still includes fake CCTV/security labels;
- station metrics still show synthetic package rates and conveyor capacity
  without making the synthetic boundary obvious enough;
- old v4 stylesheet-specific language in these notes should not be used as the
  latest live proof because the current artifact is v5.

Do not broaden the demo until
[`live-readiness-audit-2026-05-23.md`](live-readiness-audit-2026-05-23.md) is
closed in source or by an explicitly reversible Cloud Run hotfix.

## Do Not Commit

Do not commit:

- Google Cloud project IDs unless they are intentionally public;
- GCS bucket paths;
- service account emails;
- API keys;
- generated minified bundles as the main source;
- private screenshots;
- local browser artifacts.

## Safe Read-Only Commands

These command shapes are useful for an owner who already has access:

```bash
gcloud run services list --platform=managed
gcloud run services describe SERVICE_NAME --region=REGION
curl -I PUBLIC_CLOUD_RUN_URL
```

If source is exported from AI Studio, add it as a normal source tree with a
README and `.env.example`. Do not add secret values.
