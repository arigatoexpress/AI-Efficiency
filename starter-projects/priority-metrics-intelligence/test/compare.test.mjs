import test from "node:test";
import assert from "node:assert/strict";
import { compareMetrics } from "../src/compare.mjs";

function observation({ period, value, metricId = "on_time", unit = "percent" }) {
  return {
    period,
    pillarId: "service",
    metricId,
    metricLabel: metricId === "on_time" ? "On-time percent" : "Package count",
    value,
    unit,
    targetType: null,
    targetMin: null,
    targetMax: null,
    warningMargin: 0,
  };
}

function observationsFrom(byPeriod, options = {}) {
  return [...byPeriod].map(([period, value]) => observation({ period, value, ...options }));
}

test("computes exact positive month-over-month and year-over-year changes", () => {
  const byPeriod = new Map([
    ["2025-06", 80],
    ["2026-05", 90],
    ["2026-06", 99],
  ]);

  const june = compareMetrics(observationsFrom(byPeriod))[2];

  assert.deepEqual(june.mom, {
    baselinePeriod: "2026-05",
    baselineValue: 90,
    absoluteChange: 9,
    percentageChange: 10,
    reason: null,
  });
  assert.deepEqual(june.yoy, {
    baselinePeriod: "2025-06",
    baselineValue: 80,
    absoluteChange: 19,
    percentageChange: 23.75,
    reason: null,
  });
});

test("preserves exact negative changes", () => {
  const comparisons = compareMetrics(
    observationsFrom(
      new Map([
        ["2025-06", 120],
        ["2026-05", 100],
        ["2026-06", 90],
      ]),
      { metricId: "package_count", unit: "count" },
    ),
  );

  assert.deepEqual(comparisons[2].mom, {
    baselinePeriod: "2026-05",
    baselineValue: 100,
    absoluteChange: -10,
    percentageChange: -10,
    reason: null,
  });
  assert.equal(comparisons[2].yoy.percentageChange, -25);
});

test("keeps absolute change and marks percentage from a zero baseline", () => {
  const [baseline, current] = compareMetrics(
    observationsFrom(new Map([
      ["2026-05", 0],
      ["2026-06", 7],
    ])),
  );

  assert.equal(baseline.period, "2026-05");
  assert.deepEqual(current.mom, {
    baselinePeriod: "2026-05",
    baselineValue: 0,
    absoluteChange: 7,
    percentageChange: null,
    reason: "zero_baseline",
  });
});

test("marks exact missing comparison periods as insufficient history", () => {
  const [current] = compareMetrics([observation({ period: "2026-06", value: 99 })]);

  assert.deepEqual(current.mom, {
    baselinePeriod: "2026-05",
    baselineValue: null,
    absoluteChange: null,
    percentageChange: null,
    reason: "insufficient_history",
  });
  assert.deepEqual(current.yoy, {
    baselinePeriod: "2025-06",
    baselineValue: null,
    absoluteChange: null,
    percentageChange: null,
    reason: "insufficient_history",
  });
});

test("sorts comparisons by metric ID then period and preserves units", () => {
  const comparisons = compareMetrics([
    observation({ period: "2026-06", value: 99 }),
    observation({
      period: "2026-06",
      value: 700,
      metricId: "package_count",
      unit: "count",
    }),
    observation({ period: "2026-05", value: 90 }),
  ]);

  assert.deepEqual(
    comparisons.map(({ metricId, period, unit }) => ({ metricId, period, unit })),
    [
      { metricId: "on_time", period: "2026-05", unit: "percent" },
      { metricId: "on_time", period: "2026-06", unit: "percent" },
      { metricId: "package_count", period: "2026-06", unit: "count" },
    ],
  );
});
