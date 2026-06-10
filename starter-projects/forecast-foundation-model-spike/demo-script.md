# Demo Script — Forecast Foundation-Model Spike

~2 minutes, for a technical or governance audience. Synthetic data throughout.

## 1. The setup (30 sec)
*"Our roadmap has a rule: a fancy forecasting model has to* earn *a pilot by beating the explainable ensemble our Signal Lab already uses — measured properly, walk-forward, on fixtures. We ran that match: Amazon's Chronos-Bolt foundation model, zero-shot, against a faithful port of the lab's tuned, momentum-gated ensemble."*

## 2. The result (45 sec)
- *"The ensemble won: MASE 0.845 versus 0.895 overall, ahead at one through three weeks — the four-week mark was effectively a tie, with Chronos a hair lower. Both comfortably beat naive."*
- *"And note what didn't matter: speed. About fifty milliseconds per forecast on a plain CPU. If we ever switch, it won't be performance holding us back."*

## 3. The point (30 sec)
*"This is the governance story as much as a modeling story: the gate stopped us from adopting a 48-million-parameter model on hype, with one afternoon of measurement. The ensemble stays; the re-test trigger is written down — a real need for 4+ week outlooks, re-run on a real series, locally."*

## Do / Don't
- **Do** present the caveats with the numbers (synthetic fixture, smallest model variant, small sample).
- **Don't** generalize to "foundation models don't work" — the claim is only that *this one didn't earn a pilot on this evidence.*
