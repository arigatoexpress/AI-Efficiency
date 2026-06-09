# FedEx Logistics Intelligence System — App

A public-data decision-support prototype for station-level FEC supervisors and managers.

## What This Is

This is a small full-stack web app that gives managers one calm place to review public external risk signals before a shift — weather, road conditions, and regional disruption context.

It is **not** a production FedEx system. It does **not** connect to internal package, route, employee, customer, security, or facility systems.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment example and add your Gemini API key (optional)
cp .env.example .env
# Edit .env and set GEMINI_API_KEY=your_key_here

# 3. Run the dev server
npm run dev

# 4. Open http://localhost:5173
```

The dev proxy forwards `/api` calls to the Express server on port 3000.

## Build for Production

```bash
npm run build
npm start
```

This creates:
- `dist/client/` — Vite-built React frontend
- `dist/server.cjs` — Compiled Express server

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React 18 UI   │────▶│  Express Server │────▶│  Gemini API     │
│   (Vite build)  │◄────│  (Node/CJS)     │◄────│  (server-side)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐
│  Public data    │
│  (synthetic     │
│   demo values)  │
└─────────────────┘
```

## Features

| Panel | Purpose |
| --- | --- |
| Shift Readiness | Top three public risks for the next shift. |
| Station Impact | Possible dock, yard, staffing, or handoff effects. |
| Route Watch | Public road/weather context without claiming internal route knowledge. |
| Manager Drafts | Generates pre-shift, handoff, and after-action briefs with Gemini. |
| Source Trail | Lists every data source and whether it needs human verification. |

## Safety Framing

- Every screen includes a **"Prototype only"** banner.
- All synthetic values are **clearly labeled**.
- No button implies live dispatch, rerouting, or official authority.
- Every draft includes **"Needs manager verification."**
- API keys are **server-side only**.

## Data Sources

- National Weather Service forecasts and alerts
- Open-Meteo weather model forecasts
- USGS earthquake event data
- COtrip public road conditions
- Public FedEx location pages
- Gunnison-Crested Butte Regional Airport public details

## Tech Stack

- React 18 + TypeScript + Vite
- Express + TypeScript + tsx (dev) / esbuild (prod)
- @google/genai SDK for Gemini drafts
- No external map libraries (keeps bundle small)
- CSS custom properties (no heavy UI framework)

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | No | Enables AI draft generation. Falls back to local templates if missing. |
| `PORT` | No | Server port. Defaults to 3000. |

## Governance Notes

- Do not use with real package tracking, customer records, employee records, or production route manifests.
- Do not use for live dispatch commands or safety decisions without a human owner.
- Keep the repo public-safe: no secrets, no internal data.
