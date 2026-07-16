# Pilot Validation Worksheet — Signal Lab and TLH/SPH Explorer

Use this worksheet to run the first real-data validation of two offline tools
during a pilot, using **only scrubbed weekly aggregates you provide locally**:

- the [Dock Efficiency Signal Lab](../starter-projects/dock-efficiency-signal-lab/README.md) — is a weekly KPI move statistically real?
- the [TLH/SPH Efficiency Explorer](../starter-projects/tlh-sph-efficiency-explorer/README.md) — which lever moved: throughput (SPH) or hours (TLH)?

## What this is

A one-page-per-tool checklist plus a sign-off record. It exists because both
tools ship validated on synthetic data, and the TLH/SPH Explorer's own status
note says it needs one real, locally-loaded weekly export during a pilot
before its outputs inform a real review. This worksheet is that validation.

## Who it is for

An FEC supervisor or manager running a small, approved pilot — no statistics
or coding background needed. If you have not proposed the pilot yet, start
with the [AI Pilot Program Template](pilot-program-template.md).

## When to use it

After a pilot is approved and you have permission to pull one weekly
operations export. Plan for about an hour.

## What not to do

- **Do not load raw operational exports unchanged.** Scrub first (below).
- **Do not commit your CSV or a filled-in copy of this worksheet to the repo.**
  Only synthetic data ships here; real numbers stay on your machine.
- **Do not treat any flag or decomposition as a conclusion.** Every output is
  a prompt to investigate, and a manager verifies before anything is shared
  or acted on.
- **Do not use individual-level data.** These tools are for facility/shift
  aggregates — never employee hours, performance, or identities.

## Safe data rules (read before touching data)

Both apps are single HTML files that run fully offline — a
Content-Security-Policy (`connect-src 'none'`) blocks all network calls, and
loaded CSVs live in browser memory only (closing the tab discards them).
Verify once yourself: open the browser's Network tab while loading a CSV and
confirm zero requests.

"Scrubbed aggregate" means, concretely:

| Keep | Remove / replace |
|------|------------------|
| Weekly facility-level totals (one value, or TLH + SPH, per facility per week) | Employee names, IDs, or individual hours |
| Week labels (e.g. `05/30/26`) | Tracking numbers, customer or package data |
| Region/district labels (optional) | Real facility codes **if the file will leave a controlled machine** — replace with abstract codes like `PILOT-01` (keep a private mapping) |

## Worksheet A — Signal Lab (is the move real?)

**You need:** one weekly productivity KPI per facility, ideally ~13–26 weeks
(the shipped synthetic example carries 26 weeks per facility; the quarter
baseline needs 13). Columns are auto-detected:

```
facility,week,value
PILOT-01,05/30/26,88.2
PILOT-01,06/06/26,90.1
```

Optional: add `region` and `district` columns for the scope filter; load a
second CSV of Scorecard colors (`facility,planning,scheduling,execution`) to
make "Likely focus" reflect real RED sections. Synthetic examples of both
shapes ship in the tool folder (`app/sample-data.csv`, `app/sample-scorecard.csv`).

**Steps:**

- [ ] Open `starter-projects/dock-efficiency-signal-lab/app/index.html` in a browser (no install, no internet).
- [ ] Confirm the offline guarantee in the Network tab (zero requests).
- [ ] Click **Load CSV…** and load your scrubbed file.
- [ ] Sanity-check a few weeks against the source export by eye.
- [ ] Record the results below.

**Record (per facility):**

| Facility (scrubbed code) | Weeks loaded | SPC state (in control / signal) | Signals that fired (Nelson rules, EWMA, CUSUM) | Manager agrees it matches operational memory? | Follow-up needed |
|---|---|---|---|---|---|
| | | | | | |

## Worksheet B — TLH/SPH Explorer (which lever moved?)

**You need:** the two most recent weeks of TLH (Total Labor Hours) and SPH
(shipments/stops per hour) per facility — more weeks are fine; the app
compares each facility's two most recent:

```
facility,week,tlh,sph
PILOT-01,06/06/26,3470,12.05
PILOT-01,06/13/26,3492,13.32
```

**Steps:**

- [ ] Open `starter-projects/tlh-sph-efficiency-explorer/app/index.html` in a browser.
- [ ] Confirm the offline guarantee in the Network tab (zero requests).
- [ ] Click **Load CSV…** and load your scrubbed file.
- [ ] Check that the app's exact-split check passes (it verifies the math identity on every render).
- [ ] Record the results below.

**Record (per facility):**

| Facility (scrubbed code) | SPH change | SPH effect (throughput) | TLH effect (hours) | Driver tag | If hours-driven: service and volume verified held? | Verdict (replicate / verify first / investigate) |
|---|---|---|---|---|---|---|
| | | | | | | |

**The sharp edge:** an hours-driven gain is not automatically a productivity
win. Before calling it one, verify that service, safety, and volume held —
that check is a human step, not something the tool can see.

## Interpretation guardrails

- A statistical signal means "worth investigating," never "something is
  definitely wrong" — pair flags with operational memory and the relevant
  playbook.
- The decomposition math is exact; the *story* behind a move still needs a
  human check (weather week, holiday, one-off event).
- Small samples widen uncertainty; read each app's Method & Caveats tab.
- Dollar figures are planning translations ($/point/year ÷ 52), not realized
  savings or accounting numbers.

## Pilot validation record

| Field | Entry |
|---|---|
| Date of validation | |
| Data owner / approver | |
| Source export (describe, do not attach) | |
| How it was scrubbed | |
| Facilities included (count) | |
| Weeks covered | |
| Offline guarantee verified (Network tab) | yes / no |
| Signal Lab: outputs matched operational reality? | |
| TLH/SPH: decomposition matched operational reality? | |
| Discrepancies found and resolved | |
| Decision: may outputs inform a real review? | yes / no / not yet — why |
| Manager sign-off (name, date) | |

If either tool's outputs did **not** match operational reality, stop and note
the discrepancy in the tool's pilot feedback channel before relying on it —
that is the validation working, not failing.

---

*Both tools are prototypes, not official or production FedEx systems. Every
output is a draft that requires manager verification. See each tool's
`governance-review.md` and the
[project review checklist](governance/project-review-checklist.md).*
