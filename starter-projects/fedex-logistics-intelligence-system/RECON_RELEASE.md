# RECON Release Boundary

**RECON** is the standalone release identity for the Station Ops Intelligence / former Logistics Intelligence dashboard.

The broader `AI-Efficiency` repository is legacy program history; the current FedEx manager/adoption program lives in [`arigatoexpress/Ops-AI-Library`](https://github.com/arigatoexpress/Ops-AI-Library). This branch exists to keep the tested application source shippable until RECON receives its own repository.

## Product contract

RECON is a **read-only decision-support prototype** for manager briefings. It:

- uses public or clearly labeled synthetic data only;
- can consume live public Open-Meteo, NWS, and USGS signals when explicitly enabled;
- can draft manager prose through Gemini/Vertex AI;
- falls back deterministically when model access is unavailable;
- never routes packages, changes dispatch, sends customer communications, or represents an official FedEx production system;
- requires human verification before operational use.

## Runtime boundary

Recommended GCP layout:

```text
FedEx prototype / sandbox GCP project
├── recon-dashboard
└── fedex-delivery-markets

Sapphire GCP project
└── Sapphire services only
```

RECON and Delivery Markets may share a **project** if governance approves the sandbox, but they do not share service accounts, secrets, mutable stores, or runtime state.

## Cloud Run service

Recommended service name: `recon-dashboard`.

Build context:

```text
starter-projects/fedex-logistics-intelligence-system/app
```

The existing server already supports both AI Studio and Vertex AI authentication. Prefer Vertex AI / ADC for durable GCP deployment:

```text
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_CLOUD_PROJECT=<approved-project-id>
GOOGLE_CLOUD_LOCATION=us-central1
```

Optional public feeds remain a separate switch:

```text
LIVE_SIGNALS=on
```

## Promotion checks

Before routing demo traffic to a new revision:

1. Repository CI is green.
2. `GET /api/health` returns `status: ok` and does not expose credentials.
3. `POST /api/compile-advice-draft` returns `source: gemini` when Gemini is intended to be enabled, or `source: fallback` with the manager-review footer when it is not.
4. If `LIVE_SIGNALS=on`, `GET /api/live-signals?station=GUC` returns labeled public-source data and per-source health.
5. Switching demo stations clears an existing generated draft so no station can display another station's brief.
6. No internal FedEx package, customer, employee, manifest, route, facility, or security data is present.

## Migration target

When repository creation is available, extract this app into a dedicated `recon-dashboard` repository with its existing tests and deployment contract. Do not move it into Ops AI Library or Sapphire.
