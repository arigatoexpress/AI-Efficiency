# District Subteam Guide — Dock Efficiency Signal Lab

A one-page "how to use it" for each district's subteam. No stats or coding background needed. Print it, hand it out.

---

## What this tool is for

It reads your district's **weekly dock-efficiency numbers** and tells you, in plain English:
1. **Which facilities are real problems** vs. just having a normal off-week.
2. **Who's top and bottom**, and what each gap to goal is **worth in dollars**.
3. **Where it's likely heading** the next few weeks.

Every flag is a **nudge to go look** — your team still makes the call. It runs entirely on your computer; **nothing you load ever leaves the machine**.

---

## Getting started in 4 steps

1. **Open** `index.html` in any web browser (Chrome/Edge). The welcome screen explains the basics — click the **?** in the top-right anytime to see it again.
2. **Load your data** — click **Load CSV…** and pick your district's weekly productivity export (format below).
3. **Read the colored cards** — green = good, amber = watch, red = investigate now.
4. **Open the "Rankings & $ Impact" tab** — work the **bottom list top-down**. Each one shows the likely focus area and the weekly dollar impact.

---

## Getting your data into it (CSV)

You need a simple spreadsheet with one row per facility per week. Two layouts both work:

**Long (easiest):**
```
facility,week,value
0275-NCRS,05/16,64.2
0275-NCRS,05/23,63.3
```

**Wide** (facility, then one column per week):
```
facility,05/09,05/16,05/23
0275-NCRS,65.1,64.2,63.3
```

> **How to make it:** copy the weekly productivity rows for your facilities out of the weekly workbook (e.g. the *Actual Productivity we…* columns) into a new sheet, then **Save As → CSV**. Use ~6 months of weeks (≈26) for best results.

**Optional — make the focus column real:** click **Load Scorecard status…** and load a second CSV of your Scorecard colors:
```
facility,planning,scheduling,execution
0275-NCRS,RED,GREEN,GREEN
0622-RORS,GREEN,RED,RED
```
Now the "Likely focus" column points to your **actual RED sections** (Planning / Scheduling / Execution) instead of a guess.

---

## How to read the five tabs

| Tab | One-line job | What to act on |
|-----|--------------|----------------|
| **Trend & Signals** | Is this facility heading up or down? | Orange line sloping down = worsening |
| **Process Control** | Is a weekly move *real* or just noise? | "Special cause" or "Trending" = go investigate |
| **Momentum** | Stock-chart style change view | Use ROC ("vs a month ago"); ignore MACD/RSI for decisions |
| **Forecast** | Where's it heading? | Trust 1–3 weeks; read the **band**, not the line |
| **Rankings & $ Impact** | Who's top/bottom + the dollars | Work the bottom list; **Draft recap** for shareable text |

---

## Calibrating the dollars

Set the two controls at the top to match how your district reports:
- **Goal line** — your engineered goal (e.g. `68.8`).
- **$ / point / year** — `50000000` ($50M) to match the network recap's method (`gap × $50M ÷ 52 weeks`).

A 5.5-point gap then reads ≈ **−$5.2M/week**, exactly like the weekly recap.

---

## Three rules (keep it safe and credible)

1. **A flag is a question, not an answer.** Pair every red facility with its Scorecard RED cells and the lanefull/rehandle playbook before acting.
2. **Don't chase noise.** If Process Control says "In control," leave it alone.
3. **Keep data local.** Don't post real facility numbers to a shared site or public AI tool. Abstract the codes in anything you share outside the team.

---

*Questions or want a tweak for your district? Contact the Regional AI team. This tool is part of the FedEx AI-Efficiency program — AI should save you time, not replace your judgment.*
