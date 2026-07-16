import assert from "node:assert/strict";
import test from "node:test";
import { rollingOriginBacktest } from "../src/backtest.mjs";
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

function backtest(values, overrides = {}) {
  return rollingOriginBacktest({
    observations: daily(values),
    snapshotTime: `2026-07-${String(values.length + 1).padStart(2, "0")}T00:00:00Z`,
    seasonLength: 7,
    alpha: 0.5,
    beta: 0.25,
    ...overrides,
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

test("future and late-available records cannot change or appear in backtest evidence", () => {
  const visible = daily([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
  const hidden = [
    {
      observationId: "SYNTH-OBS-900001",
      serviceDate: "2026-06-30",
      availableAt: "2026-07-20T00:00:00Z",
      value: 1,
    },
    {
      observationId: "SYNTH-OBS-900002",
      serviceDate: "2026-07-11",
      availableAt: "2026-07-11T23:00:00Z",
      value: 1,
    },
  ];
  const common = {
    snapshotTime: "2026-07-11T00:00:00Z",
    seasonLength: 7,
    alpha: 0.5,
    beta: 0.25,
  };

  const left = rollingOriginBacktest({
    ...common,
    observations: [...hidden, ...visible],
  });
  const right = rollingOriginBacktest({
    ...common,
    observations: [
      { ...hidden[0], value: 999_999_999 },
      { ...hidden[1], value: 999_999_999 },
      ...visible,
    ],
  });

  assert.equal(JSON.stringify(left), JSON.stringify(right));
  assert.doesNotMatch(JSON.stringify(left), /900001|900002/);
});

test("rolling-origin point and interval metrics match a hand calculation", () => {
  const result = backtest([10, 12, 14, 14, 16]);
  const model = result.models.find(({ model: name }) => name === "last_value");

  assert.deepEqual(model.evaluation, {
    foldCount: 3,
    observationCount: 5,
    mae: 4 / 3,
    bias: 4 / 3,
    mase: null,
    maseLimitation: "insufficient_scale_history",
    pinball: {
      p10: 1,
      p25: 1,
      p50: 1,
      p75: 0.25,
      p90: 0.1,
    },
    coverage50: 0.5,
    coverage80: 0.5,
    meanWidth50: 1,
    meanWidth80: 1,
    coherence: "not_applicable_single_series",
    limitations: [],
  });
});

test("MASE uses the seven-day in-sample naive scale", () => {
  const result = backtest([10, 20, 10, 20, 10, 20, 10, 20, 10]);
  const model = result.models.find(({ model: name }) => name === "last_value");

  assert.equal(model.evaluation.mae, 10);
  assert.equal(model.evaluation.mase, 1);
  assert.equal(model.evaluation.maseLimitation, null);
});

test("a fold cannot use its own or a later residual for quantiles", () => {
  const left = backtest([10, 12, 14, 100]);
  const right = backtest([10, 12, 14, 0]);
  const leftFold = left.models[0].folds.at(-1);
  const rightFold = right.models[0].folds.at(-1);

  assert.deepEqual(
    {
      p10: leftFold.p10,
      p25: leftFold.p25,
      p50: leftFold.p50,
      p75: leftFold.p75,
      p90: leftFold.p90,
    },
    { p10: 16, p25: 16, p50: 16, p75: 16, p90: 16 },
  );
  assert.deepEqual(
    {
      p10: rightFold.p10,
      p25: rightFold.p25,
      p50: rightFold.p50,
      p75: rightFold.p75,
      p90: rightFold.p90,
    },
    { p10: 16, p25: 16, p50: 16, p75: 16, p90: 16 },
  );
});

test("a delayed target cannot become training or calibration before availability", () => {
  const observations = daily([10, 12, 14, 16, 18]);
  observations[2].availableAt = "2026-07-05T12:00:00Z";
  const result = rollingOriginBacktest({
    observations,
    snapshotTime: "2026-07-07T00:00:00Z",
    seasonLength: 7,
    alpha: 0.5,
    beta: 0.25,
  });
  const folds = result.models[0].folds;

  assert.deepEqual(
    folds.map(({ targetServiceDate }) => targetServiceDate),
    ["2026-07-03"],
  );
  assert.equal(folds[0].limitation, "insufficient_calibration");
  assert.equal(folds[0].p50, null);
});

test("negative empirical quantiles are repaired to ordered nonnegative values", () => {
  const result = backtest([10, 8, 0, 0]);
  const fold = result.models[0].folds.at(-1);

  assert.deepEqual(
    {
      p10: fold.p10,
      p25: fold.p25,
      p50: fold.p50,
      p75: fold.p75,
      p90: fold.p90,
      quantileRepaired: fold.quantileRepaired,
      limitation: fold.limitation,
    },
    {
      p10: 0,
      p25: 0,
      p50: 0,
      p75: 0,
      p90: 0,
      quantileRepaired: true,
      limitation: null,
    },
  );
});

test("insufficient calibration is explicit and output reports every baseline without a winner", () => {
  const result = backtest([10, 12, 14]);

  assert.deepEqual(
    result.models.map(({ model }) => model),
    ["last_value", "level_trend", "seasonal_naive_7"],
  );
  assert.equal(result.winner, null);
  assert.equal(result.models[0].folds[0].limitation, "insufficient_calibration");
  assert.deepEqual(
    {
      p10: result.models[0].folds[0].p10,
      p25: result.models[0].folds[0].p25,
      p50: result.models[0].folds[0].p50,
      p75: result.models[0].folds[0].p75,
      p90: result.models[0].folds[0].p90,
    },
    { p10: null, p25: null, p50: null, p75: null, p90: null },
  );
  assert.equal(
    result.models[0].evaluation.coherence,
    "not_applicable_single_series",
  );
});
