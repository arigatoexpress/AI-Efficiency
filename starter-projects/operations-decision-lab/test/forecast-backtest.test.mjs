import assert from "node:assert/strict";
import test from "node:test";
import { forecastBaselines } from "../src/forecast.mjs";

function daily(values, startDay = 1) {
  return values.map((value, index) => {
    const day = String(startDay + index).padStart(2, "0");
    return {
      observationId: `SYNTH-OBS-${String(index + 1).padStart(3, "0")}`,
      serviceDate: `2026-07-${day}`,
      availableAt: `2026-07-${day}T23:00:00Z`,
      value,
    };
  });
}

test("all named baselines produce exact one-step points in stable order", () => {
  const result = forecastBaselines({
    observations: daily([10, 12, 14, 16, 18, 20, 22, 24]),
    seasonLength: 7,
    alpha: 0.5,
    beta: 0.25,
  });

  assert.deepEqual(result, [
    { model: "last_value", point: 24, limitation: null, clamped: false },
    { model: "level_trend", point: 26, limitation: null, clamped: false },
    { model: "seasonal_naive_7", point: 12, limitation: null, clamped: false },
  ]);
});

test("seasonal baseline is unavailable rather than disguised as a fallback", () => {
  const result = forecastBaselines({
    observations: daily([10, 11, 12, 13, 14, 15]),
    seasonLength: 7,
    alpha: 0.5,
    beta: 0.25,
  });
  assert.deepEqual(result.find(({ model }) => model === "seasonal_naive_7"), {
    model: "seasonal_naive_7",
    point: null,
    limitation: "insufficient_history",
    clamped: false,
  });
});

test("negative additive forecasts clamp to zero with disclosure", () => {
  const result = forecastBaselines({
    observations: daily([10, 8, 6, 4, 2, 0]),
    seasonLength: 7,
    alpha: 0.5,
    beta: 0.25,
  });
  assert.deepEqual(result.find(({ model }) => model === "level_trend"), {
    model: "level_trend",
    point: 0,
    limitation: null,
    clamped: true,
  });
});

test("baseline input order and chronology are explicit invariants", () => {
  assert.throws(
    () =>
      forecastBaselines({
        observations: daily([10, 11, 12]).reverse(),
        seasonLength: 7,
        alpha: 0.5,
        beta: 0.25,
      }),
    { code: "FORECAST_INVALID_HISTORY" },
  );
});
