#!/usr/bin/env python3
"""Phase 5 forecast spike — Chronos-Bolt (zero-shot) vs simple baselines.

The experiment named in docs/forecasting-model-license-review.md: a
foundation model earns a pilot only if it beats the simple-ensemble
approach already used by the Dock Efficiency Signal Lab, measured by
walk-forward (rolling-origin) MASE on seeded synthetic weekly fixtures.

Models compared per facility, per origin, horizons 1-4 weeks:
  naive      last observed value (also the MASE scaling reference)
  ensemble   mean of SES, damped Holt, and linear trend — a faithful
             Python port of the Signal Lab's simple forecast blend
  chronos    amazon/chronos-bolt-small, zero-shot, median quantile

Run:  python3 benchmark.py
Synthetic data only. The model is fetched from Hugging Face on first run
and cached; the series themselves never leave the machine.
"""

import json
import time

import numpy as np
import torch
from chronos import BaseChronosPipeline

SEED = 42
N_FACILITIES = 8
N_WEEKS = 30
ORIGINS = 8          # rolling origins: forecast from each of the last 8 weeks
HORIZONS = (1, 2, 3, 4)
MODEL_ID = "amazon/chronos-bolt-small"

rng = np.random.default_rng(SEED)


def synthetic_weekly_series():
    """Seeded weekly efficiency-style series: level + mild trend + noise + shocks."""
    series = []
    for _ in range(N_FACILITIES):
        level = rng.uniform(60, 75)
        trend = rng.uniform(-0.15, 0.20)
        noise = rng.normal(0, 1.2, N_WEEKS)
        y = level + trend * np.arange(N_WEEKS) + noise
        for _ in range(rng.integers(0, 3)):  # occasional shock weeks
            y[rng.integers(5, N_WEEKS)] += rng.choice([-1, 1]) * rng.uniform(3, 6)
        series.append(y)
    return series


# --- the Signal Lab's simple models, ported ---
def ses(y, alpha=0.3):
    s = y[0]
    for v in y[1:]:
        s = alpha * v + (1 - alpha) * s
    return s


def damped_holt(y, alpha=0.4, beta=0.2, phi=0.9, h=1):
    lvl, tr = y[0], y[1] - y[0] if len(y) > 1 else 0.0
    for v in y[1:]:
        prev = lvl
        lvl = alpha * v + (1 - alpha) * (lvl + phi * tr)
        tr = beta * (lvl - prev) + (1 - beta) * phi * tr
    damp = sum(phi ** i for i in range(1, h + 1))
    return lvl + damp * tr

def linear_trend(y, h=1):
    x = np.arange(len(y))
    b, a = np.polyfit(x, y, 1)
    return a + b * (len(y) - 1 + h)


def ensemble(y, h):
    return float(np.mean([ses(y), damped_holt(y, h=h), linear_trend(y, h)]))


def main():
    series = synthetic_weekly_series()

    t0 = time.perf_counter()
    pipeline = BaseChronosPipeline.from_pretrained(MODEL_ID, device_map="cpu",
                                                   torch_dtype=torch.float32)
    load_s = time.perf_counter() - t0

    err = {m: {h: [] for h in HORIZONS} for m in ("naive", "ensemble", "chronos")}
    scale = []  # per-(facility, origin) in-sample one-step naive MAE for MASE
    chronos_ms = []

    for y in series:
        for o in range(ORIGINS):
            cut = N_WEEKS - ORIGINS + o  # train on y[:cut]
            hist = y[:cut]
            scale_val = np.mean(np.abs(np.diff(hist)))

            t0 = time.perf_counter()
            q, _ = pipeline.predict_quantiles(
                torch.tensor(hist, dtype=torch.float32),
                prediction_length=max(HORIZONS),
                quantile_levels=[0.5],
            )
            chronos_ms.append((time.perf_counter() - t0) * 1e3)
            chronos_path = q[0, :, 0].numpy()

            for h in HORIZONS:
                if cut + h > N_WEEKS:
                    continue
                actual = y[cut + h - 1]
                err["naive"][h].append(abs(actual - hist[-1]) / scale_val)
                err["ensemble"][h].append(abs(actual - ensemble(hist, h)) / scale_val)
                err["chronos"][h].append(abs(actual - chronos_path[h - 1]) / scale_val)

    results = {
        "seed": SEED, "facilities": N_FACILITIES, "weeks": N_WEEKS,
        "origins": ORIGINS, "model": MODEL_ID, "model_load_s": round(load_s, 1),
        "chronos_ms_per_forecast": round(float(np.mean(chronos_ms)), 1),
        "mase": {m: {h: round(float(np.mean(v)), 3) for h, v in hs.items() if v}
                 for m, hs in err.items()},
    }
    overall = {m: round(float(np.mean([np.mean(v) for v in hs.values() if v])), 3)
               for m, hs in err.items()}
    results["mase_overall"] = overall
    print(json.dumps(results, indent=2))

    print("\n--- summary (MASE, lower is better; <1 beats naive) ---")
    for m in ("naive", "ensemble", "chronos"):
        per_h = "  ".join(f"h{h}={results['mase'][m][h]}" for h in HORIZONS)
        print(f"{m:9s} overall={overall[m]:.3f}   {per_h}")
    winner = min(overall, key=overall.get)
    print(f"\nwinner on this fixture: {winner}"
          f"  (chronos {'beats' if overall['chronos'] < overall['ensemble'] else 'does NOT beat'}"
          f" the Signal Lab-style ensemble)")
    print(f"chronos cost: {results['chronos_ms_per_forecast']} ms per 4-week forecast (CPU)")


if __name__ == "__main__":
    main()
