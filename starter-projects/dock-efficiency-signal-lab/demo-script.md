# Demo Script — Dock Efficiency Signal Lab

A ~5-minute safe walkthrough for presenting to a district/region team. Uses **synthetic demo data** so it's safe to screen-share.

## Setup (10 sec)
Open `index.html`. It boots on synthetic data — say so up front: *"These are fake facilities; the real version loads our data locally and nothing leaves the machine."* Point at the green **Offline** badge.

## 1. The hook (45 sec) — Trend & Signals tab
- *"We already track weekly productivity. The idea: treat each facility's weekly series the way an analyst treats a stock chart — but using the rigorous quality-control version of those tools."*
- Walk the four cards: latest week vs goal, quarter baseline, 4-week change, and trend regime (golden/death cross). Read the crossover note aloud — emphasize it's **lagging confirmation**.

## 2. The rigor (90 sec) — Process Control (SPC) tab
- *"This is the part we'd actually alert on."* The control band comes from the data's own week-to-week variation, not an arbitrary threshold.
- Switch the Facility dropdown to **0275-NCRS** — point to the orange dot: *"That week broke the 3σ limit — Rule 1, a special-cause outlier. In real life that's an outage or weather week."*
- Switch to **0622-RORS** — show the Nelson rule callouts for sustained drift, and note the **lag-1 autocorrelation** card: *"The tool tells us when 'trends' are partly just inertia — so we don't over-react."*
- Mention EWMA and CUSUM briefly: *"These catch a slow creep below goal weeks before a raw chart would."*

## 3. The translation (45 sec) — Momentum (TA) tab
- *"These are the friendly trading-style indicators — good for explaining the picture. Note we label MACD and RSI 'indicative only' — they don't trigger alerts. ROC is just plain-language month-over-month change."*

## 4. The forward look (60 sec) — Forecast tab
- *"A blend of three simple models, and it only trusts the trend when momentum agrees."* Point at the **momentum gate** card.
- Emphasize the **widening band**: *"Next week is a confident range; six weeks out is directional. We show the band, not a false-precision number."*
- Show the backtest table: *"MASE under 1 means it beats a naïve guess — measured by walk-forward testing, not by curve-fitting."*

## 5. Close (30 sec)
- *"Every signal is an investigation prompt, paired with our lanefull/rehandle playbook — not an auto-decision. And it's fully offline and governed."*
- Invite a pilot: pick 5 facilities, load a real CSV locally, review for two weeks.

## Do / Don't
- **Do** keep real data local; abstract codes in any screenshot that leaves the room.
- **Don't** present a point forecast without its band, or escalate a single-indicator, single-week blip.
