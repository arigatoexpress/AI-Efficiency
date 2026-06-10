#!/usr/bin/env python3
"""FHE private-scoring spike — Phase 7 benchmark (Zama Concrete ML).

Implements the research spike from docs/fhe-zama-research.md:
  1. synthetic dataset of AI idea submissions (seeded, no real data)
  2. simple numeric features
  3. small baseline model (scikit-learn logistic regression)
  4. the same model compiled to FHE with Concrete ML
  5. compare accuracy + latency: clear vs FHE-simulated vs FHE-executed
  6. emit a machine-readable results block for the writeup

Run:  python3 benchmark.py
No network calls. Everything is local and synthetic.
"""

import json
import time

import numpy as np
from sklearn.linear_model import LogisticRegression as SkLogReg
from sklearn.model_selection import train_test_split

from concrete.ml.sklearn import LogisticRegression as FheLogReg

SEED = 42
N = 600
FHE_EXECUTE_SAMPLES = 30  # encrypted inference is slow; benchmark a subset

rng = np.random.default_rng(SEED)


def synthetic_idea_submissions(n: int):
    """Synthetic 'AI idea intake' rows -> features a triage model might score.

    Features (all numeric, all plausible intake-form answers):
      hours_saved   estimated manager-hours saved per week (0-20)
      team_size     people affected (1-50)
      sensitivity   data sensitivity class (0=public .. 3=restricted)
      effort        implementation effort (1=copy a prompt .. 5=new system)
      external      uses an unapproved external tool (0/1)
      endorsed      a manager has endorsed the idea (0/1)
    Label: 1 = advance to pilot review, from a noisy scoring rule.
    """
    hours_saved = rng.uniform(0, 20, n)
    team_size = rng.integers(1, 51, n).astype(float)
    sensitivity = rng.integers(0, 4, n).astype(float)
    effort = rng.integers(1, 6, n).astype(float)
    external = rng.integers(0, 2, n).astype(float)
    endorsed = rng.integers(0, 2, n).astype(float)

    score = (
        0.35 * hours_saved / 20
        + 0.20 * np.minimum(team_size, 25) / 25
        + 0.25 * endorsed
        - 0.30 * sensitivity / 3
        - 0.25 * (effort - 1) / 4
        - 0.15 * external
        + rng.normal(0, 0.08, n)  # label noise so accuracy < 100%
    )
    X = np.column_stack([hours_saved, team_size, sensitivity, effort, external, endorsed])
    y = (score > np.median(score)).astype(int)
    return X, y


def main():
    X, y = synthetic_idea_submissions(N)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=SEED, stratify=y
    )

    results = {"seed": SEED, "n_total": N, "n_test": len(y_test)}

    # --- baseline: plain scikit-learn ---
    clear_model = SkLogReg(max_iter=2000)
    clear_model.fit(X_train, y_train)
    t0 = time.perf_counter()
    clear_pred = clear_model.predict(X_test)
    clear_ms = (time.perf_counter() - t0) / len(y_test) * 1e3
    results["clear_accuracy"] = float((clear_pred == y_test).mean())
    results["clear_ms_per_sample"] = clear_ms

    # --- Concrete ML: same model, quantized then compiled to FHE ---
    fhe_model = FheLogReg(n_bits=8, max_iter=2000)
    fhe_model.fit(X_train, y_train)

    quant_pred = fhe_model.predict(X_test)  # quantized, still clear
    results["quantized_clear_accuracy"] = float((quant_pred == y_test).mean())

    t0 = time.perf_counter()
    circuit = fhe_model.compile(X_train)
    results["compile_s"] = time.perf_counter() - t0

    t0 = time.perf_counter()
    circuit.client.keygen(force=True)
    results["keygen_s"] = time.perf_counter() - t0

    sim_pred = fhe_model.predict(X_test, fhe="simulate")
    results["fhe_simulated_accuracy"] = float((sim_pred == y_test).mean())

    # encrypted end-to-end on a subset (encrypt -> run -> decrypt per sample)
    subset = X_test[:FHE_EXECUTE_SAMPLES]
    t0 = time.perf_counter()
    exec_pred = fhe_model.predict(subset, fhe="execute")
    exec_ms = (time.perf_counter() - t0) / len(subset) * 1e3
    results["fhe_executed_samples"] = len(subset)
    results["fhe_executed_ms_per_sample"] = exec_ms
    results["fhe_vs_clear_slowdown_x"] = exec_ms / clear_ms if clear_ms else None
    results["fhe_executed_matches_simulated"] = bool(
        (exec_pred == sim_pred[:FHE_EXECUTE_SAMPLES]).all()
    )

    print(json.dumps(results, indent=2))

    print("\n--- summary ---")
    print(f"clear accuracy:          {results['clear_accuracy']:.3f}")
    print(f"quantized accuracy:      {results['quantized_clear_accuracy']:.3f}")
    print(f"FHE simulated accuracy:  {results['fhe_simulated_accuracy']:.3f}")
    print(f"clear latency:           {results['clear_ms_per_sample']:.4f} ms/sample")
    print(f"FHE executed latency:    {results['fhe_executed_ms_per_sample']:.1f} ms/sample "
          f"({results['fhe_vs_clear_slowdown_x']:.0f}x slower, n={results['fhe_executed_samples']})")
    print(f"compile: {results['compile_s']:.1f}s   keygen: {results['keygen_s']:.1f}s")
    print(f"executed == simulated on subset: {results['fhe_executed_matches_simulated']}")


if __name__ == "__main__":
    main()
