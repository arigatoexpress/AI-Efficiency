# How It Works: The Offline Analytics Duo

*Part of the [How It Works series](README.md) — real systems, real runs, no mockups.*

## What These Are

Two single-file browser apps that answer the two questions every weekly-number
owner faces:

1. **Dock Efficiency Signal Lab** — *"Is this KPI move real, or just noise?"*
2. **TLH/SPH Efficiency Explorer** — *"Which lever actually moved it?"*

Each one is a single `index.html` — no install, no server, no internet, no
build step. Open the file, it works. Load your own CSV and **the data never
leaves your machine**: the page ships with a Content-Security-Policy of
`connect-src 'none'`, which makes it *impossible* for the page to phone home
even if it wanted to. Our CI checks that header is present on every pull
request.

There is **no AI model in either tool**. The math is textbook statistical
process control and index decomposition — the kind you can check by hand. The
"AI" part of the platform writes prose *about* these numbers; it never produces
the numbers.

## Tool 1: Dock Efficiency Signal Lab

*"Your KPI dropped 3% this week. Panic or noise?"* The Signal Lab runs a weekly
KPI series through three layers, strictest last:

```text
  weekly KPI series (your CSV, or built-in synthetic demo data)
  facility, week, value
        │
        ▼
  ┌───────────────────────────────────────────────────────────────┐
  │ LAYER 1 · Trend & momentum overlays (the quick read)          │
  │   SMA(4) vs SMA(13) baselines · Bollinger(8, 2σ) envelope     │
  │   EMA 4/13 crossovers · ROC · MACD(4,8,3) · RSI               │
  ├───────────────────────────────────────────────────────────────┤
  │ LAYER 2 · Statistical process control (the rigorous verdict)  │
  │   I-MR individuals chart:  σ̂ = MR̄ / 1.128,  limits = ȳ ± 3σ̂ │
  │   Nelson rules 1, 3, 5, 6 (point beyond 3σ; six in a row      │
  │     rising/falling; 2-of-3 beyond 2σ; 4-of-5 beyond 1σ)       │
  │   EWMA (λ=0.2, L=2.7) — catches slow drift                    │
  │   Tabular CUSUM (k=0.5σ, h=5σ) — catches small sustained shift│
  ├───────────────────────────────────────────────────────────────┤
  │ LAYER 3 · Forecast (the "what's next" baseline)               │
  │   Ensemble: SES + Damped Holt (φ=0.9) + OLS linear trend,     │
  │   trend-gated weights, 80% prediction band,                   │
  │   walk-forward backtest scored by MASE vs a Naïve benchmark   │
  └───────────────────────────────────────────────────────────────┘
        │
        ▼
  SVG charts drawn by hand in vanilla JS + a flagged-signal list
  + a deterministic recap paragraph (template logic, no LLM)
```

The layering is the philosophy: momentum overlays give a fast visual read, but
**only an SPC rule violation counts as "real."** A red week inside the control
limits is noise; six quietly-declining weeks that never look dramatic is a
Nelson Rule 3 signal. This ordering came straight from the June CTO review.

The forecast ensemble earned its place with evidence: we benchmarked a
zero-shot foundation model (Chronos-Bolt) against it in a walk-forward test —
[the simple ensemble won](../../starter-projects/forecast-foundation-model-spike/README.md),
so the explainable baseline stayed.

## Tool 2: TLH/SPH Efficiency Explorer

Dock efficiency (SPH — stops or scans per hour) can "improve" two very
different ways: the team got faster, or hours got cut. The Explorer makes the
two levers impossible to confuse, using an exact identity split:

```text
   Volume = TLH × SPH        (TLH: total labor hours)
        │
        ▼   week-over-week, per facility
  ┌─────────────────────────────────────────────────────────────┐
  │  SPH effect (throughput lever, hours held at base):         │
  │      (vol₁ − vol₀) / tlh₀                                   │
  │                                                             │
  │  TLH effect (hours lever, at current volume):               │
  │      vol₁/tlh₁ − vol₁/tlh₀                                  │
  │                                                             │
  │  Exactness check on every render:                           │
  │      SPH effect + TLH effect = sph₁ − sph₀   (< 1e-9 error) │
  └─────────────────────────────────────────────────────────────┘
        │
        ▼
  Per-facility table: purple = throughput lever, blue = hours lever
  Driver tag: ≥65% of the move from one lever → "SPH-driven" /
  "TLH-driven", else "Mixed"  ·  $ translation per SPH-point/year
  Recap: REPLICATE / VERIFY FIRST / INVESTIGATE buckets
```

The decomposition is exact, not approximate — the two effects always sum to the
observed change, and the app verifies that identity on every render and refuses
to show numbers that don't reconcile.

## Proof They Work: A Real Verification Run

The Explorer ships with a Node test harness that loads the actual HTML file,
runs its real JavaScript against a stub DOM, and asserts the math. Captured
from this repo:

```text
$ node starter-projects/tlh-sph-efficiency-explorer/test/run-checks.mjs

PASS  headline cards rendered
PASS  facility table rendered
PASS  status shows exact-split check
PASS  recap has replicate / verify-first / investigate sections
PASS  CSP with connect-src 'none' present
PASS  no network APIs in script

ALL CHECKS PASSED
```

(That's the tail of ~14 checks — the earlier ones assert the exact-sum identity
for every demo facility and the spec's validation cases.)

## Try Them Yourself

- Online with demo data: [Signal Lab](https://raw.githack.com/arigatoexpress/AI-Efficiency/main/starter-projects/dock-efficiency-signal-lab/app/index.html) · [TLH/SPH Explorer](https://raw.githack.com/arigatoexpress/AI-Efficiency/main/starter-projects/tlh-sph-efficiency-explorer/app/index.html)
- With your own numbers: download the repo ZIP, double-click each tool's
  `app/index.html`, and load your CSV — fully offline.

Full project docs: [Signal Lab](../../starter-projects/dock-efficiency-signal-lab/README.md) · [TLH/SPH Explorer](../../starter-projects/tlh-sph-efficiency-explorer/README.md).
