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
