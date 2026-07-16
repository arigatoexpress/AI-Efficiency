# How It Works: Logistics Intelligence System

*Part of the [How It Works series](README.md) — real systems, real runs, no mockups.*

## What This Is

Our most mature project: a full-stack web app, **deployed and publicly reachable
on Google Cloud Run right now**, that shows station risk signals and drafts
shift briefs with Gemini. This page traces one real request through the whole
system — including what happened when we captured it, which is itself a lesson
in how the system is designed to fail safely.

**Live demo:** <https://fedex-logistics-intelligence-system-267358751314.us-east1.run.app>

## The Honest Data Story (read this first)

The dashboard's risk signals — weather, road status, seismic — are **synthetic
demo values hardcoded in the app** (`app/src/data/stations.ts`, 4 stations).
Each value is labeled with the *real public feed it stands in for* (Open-Meteo,
USGS earthquakes, cotrip.org). That is deliberate: the architecture is proven
end to end with data we fully control, and every screen says so.

The real-feed swap is now built and tested: the server ships live adapters for
Open-Meteo, NWS active alerts, and USGS earthquakes (`app/lib/live-signals.ts`,
served at `GET /api/live-signals`), **off by default** — an operator has to set
`LIVE_SIGNALS=on` deliberately. Each source degrades independently (one dead
feed never breaks the response), every value carries a `LIVE public data:`
label, and responses are cached for five minutes per station to stay polite to
the public APIs.

## The Whole System in One Diagram

```text
                         BROWSER (React 19 + Vite)
   ┌────────────────────────────────────────────────────────────────┐
   │  Station picker: Gunnison CO · Memphis TN · Indianapolis IN ·  │
   │  Phoenix AZ                                                    │
   │                                                                │
   │  ┌────────────────┐ ┌───────────────┐ ┌────────────────┐       │
   │  │ ShiftReadiness │ │ StationImpact │ │   RouteWatch   │  ...  │
   │  └────────────────┘ └───────────────┘ └────────────────┘       │
   │        ▲ all panels render labeled SYNTHETIC signals           │
   │        │ from src/data/stations.ts (no live fetch yet)         │
   │                                                                │
   │  ┌──────────────────────── ManagerDrafts ────────────────────┐ │
   │  │ [Pre-shift] [Handoff] [After-action]  → "Draft it" button │ │
   │  └──────────────────────────────┬─────────────────────────── ┘│
   └─────────────────────────────────┼──────────────────────────────┘
                                     │ POST /api/compile-advice-draft
                                     │ { station, weather, road, seismic, topic }
                                     ▼
                    EXPRESS + TYPESCRIPT SERVER (Cloud Run)
   ┌────────────────────────────────────────────────────────────────┐
   │  server.ts — one job: turn signals into a reviewed draft       │
   │                                                                │
   │   system instruction (enforced on every call):                 │
   │   · plain English memo for busy station managers               │
   │   · every recommendation ends "Needs manager verification."    │
   │   · label synthetic/estimated values                           │
   │   · never claim access to package/route/customer data          │
   │                                                                │
   │            ┌── Gemini configured and healthy? ──┐              │
   │        yes │                                    │ no / error   │
   │            ▼                                    ▼              │
   │   ┌─────────────────────┐          ┌─────────────────────────┐ │
   │   │  Gemini 2.5 Flash   │          │ generateFallbackDraft() │ │
   │   │  (@google/genai,    │          │ deterministic rules:    │ │
   │   │  server-side key)   │          │  snow > 6 in → flag     │ │
   │   └──────────┬──────────┘          │  wind > 35 mph → flag   │ │
   │              │                     │  "closed" road → flag   │ │
   │              │                     │  quake M > 2.5 → flag   │ │
   │              │                     └───────────┬─────────────┘ │
   │              └──────────────┬──────────────────┘               │
   │                             ▼                                  │
   │       { draft, source: "gemini" | "fallback", topic }          │
   └─────────────────────────────┬──────────────────────────────────┘
                                 ▼
                    HUMAN REVIEW — a manager edits the draft.
                    The app never sends, posts, or decides anything.
```

## A Real Captured Request

On 2026-07-16 we sent this real request to the live Cloud Run service —
a synthetic winter-storm scenario for Gunnison:

```bash
curl -X POST https://fedex-logistics-intelligence-system-267358751314.us-east1.run.app/api/compile-advice-draft \
  -H "Content-Type: application/json" \
  -d '{"station":"Gunnison, CO","topic":"pre-shift",
       "weather":{"tempF":18,"snowDepthIn":9,"windMph":42,"alert":"Winter Storm Warning"},
       "roadConditions":{"i70Status":"Closed at Vail Pass","us50Status":"Chains required at Monarch Summit"}}'
```

The service returned (verbatim, trimmed only for width):

```text
source: "fallback"   ← Gemini call failed that day; the safety net answered

# Pre-Shift Readiness Brief
Station: Gunnison, CO
Generated: 7/16/2026, 11:43 AM MT

## Public Risk Signals
- Weather alert active: Winter Storm Warning (Needs manager verification.)
- Snow depth at 9 inches may affect feeder schedules. (Synthetic demo value; verify with local conditions.)
- Wind at 42 mph could delay linehaul. (Synthetic demo value; verify with carrier updates.)
- I-70 Vail Pass: reported closure may impact eastbound linehaul. (Verify with cotrip.org and carrier dispatch.)

## Recommended Manager Actions
- Check live road conditions at https://www.cotrip.org/
- Confirm feeder pickup times with local carriers.
- Review sort staffing against possible delay windows.

## Data Notes
- Weather values are synthetic demo data for prototyping.
- Road status is illustrative; always verify with cotrip.org.
- This brief is a draft only. A manager must verify all facts before acting.
```

**Notice what just happened.** The Gemini call errored on the day we captured
this — the deployed build still pointed at the retired `gemini-2.0-flash`
model id — and instead of a broken page a manager still got a usable,
correctly labeled brief from the deterministic fallback, with
`source: "fallback"` stated in the response so nobody mistakes it for model
output. Graceful degradation is not a slide-deck claim here; it fired in
production and we're showing you the capture. (The model id has since been
bumped to `gemini-2.5-flash`, overridable via the `GEMINI_MODEL` env var.)

## Where the Safety Lives

- The Gemini key lives **server-side only** — the browser never sees it.
- The system instruction bans command-console language ("execute", "deploy",
  "override") and forces "Needs manager verification." onto every
  recommendation.
- Every response says whether it came from `gemini` or `fallback`.
- The app has **no write path**: nothing it produces goes anywhere until a
  human copies it out.

## Try It Yourself

1. Open the [live demo](https://fedex-logistics-intelligence-system-267358751314.us-east1.run.app),
   pick a station, and click a draft button.
2. Or run it locally: `cd starter-projects/fedex-logistics-intelligence-system/app`,
   `npm install`, `npm run dev` — works without any API key (you'll get the
   fallback drafts), and with a `GEMINI_API_KEY` in `.env` you get real Gemini
   drafts.

Full project docs: [starter project page](../../starter-projects/fedex-logistics-intelligence-system/README.md).
