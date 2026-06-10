# Demo Script — Forecast Foundation-Model Spike

~2 minutes, for a technical or governance audience. Synthetic data throughout.

## 1. The setup (30 sec)
*"Our roadmap has a rule: a fancy forecasting model has to* earn *a pilot by beating the simple, explainable ensemble our Signal Lab already uses — measured properly, walk-forward, on fixtures. We ran that match: Amazon's Chronos-Bolt foundation model, zero-shot, against SES + damped Holt + linear trend."*

## 2. The result (45 sec)
- *"The simple ensemble won: MASE 0.876 versus 0.895 overall. Both comfortably beat naive."*
- *"The foundation model's one clear win was the 4-week horizon — worth remembering, not worth switching for."*
- *"And note what didn't matter: speed. Thirteen milliseconds per forecast on a plain CPU. If we ever switch, it won't be performance holding us back."*

## 3. The point (30 sec)
*"This is the governance story as much as a modeling story: the gate stopped us from adopting a 48-million-parameter model on hype, with one afternoon of measurement. The ensemble stays; the re-test trigger is written down — a real need for 4+ week outlooks, re-run on a real series, locally."*

## Do / Don't
- **Do** present the caveats with the numbers (synthetic fixture, smallest model variant, small sample).
- **Don't** generalize to "foundation models don't work" — the claim is only that *this one didn't earn a pilot on this evidence.*
