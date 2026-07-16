import test from "node:test";
import assert from "node:assert/strict";
import { compareMetrics, evaluateTarget } from "../src/compare.mjs";
import { parseMetricsCsv } from "../src/parse.mjs";

const csvHeader =
  "period,pillar_id,metric_id,metric_label,value,unit,target_type,target_min,target_max,warning_margin";

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

test("evaluates target status and signed boundary distance", () => {
  const cases = [
    [
      { value: 96, targetType: "minimum", targetMin: 95, warningMargin: 1 },
      "on_target",
      1,
    ],
    [
      { value: 94.5, targetType: "minimum", targetMin: 95, warningMargin: 1 },
      "warning",
      -0.5,
    ],
    [
      { value: 93, targetType: "minimum", targetMin: 95, warningMargin: 1 },
      "at_risk",
      -2,
    ],
    [
      { value: 7, targetType: "maximum", targetMax: 5, warningMargin: 1 },
      "at_risk",
      -2,
    ],
    [
      {
        value: 12,
        targetType: "range",
        targetMin: 10,
        targetMax: 20,
        warningMargin: 2,
      },
      "on_target",
      2,
    ],
    [
      {
        value: 12,
        targetType: null,
        targetMin: null,
        targetMax: null,
        warningMargin: 0,
      },
      "no_target",
      null,
    ],
  ];

  for (const [input, status, distance] of cases) {
    const [result] = compareMetrics([
      { ...observation({ period: "2026-06", value: input.value }), ...input },
    ]);

    assert.deepEqual(result.target, { status, distance });
    assert.deepEqual(evaluateTarget(input), { status, distance });
  }
});

test("rejects incompatible metric definitions at the parse boundary", () => {
  const incompatibleDefinitions = [
    csvHeader,
    "2026-05,service,on_time,On-time percent,90,percent,,,,0",
    "2026-06,service,on_time,On-time percent,99,count,,,,0",
  ].join("\n");

  assert.throws(() => parseMetricsCsv(incompatibleDefinitions), {
    code: "SCHEMA_UNSTABLE_METRIC",
  });
});

test("does not substitute the previous available observation for a missing month", () => {
  const comparisons = compareMetrics(
    observationsFrom(new Map([
      ["2026-04", 80],
      ["2026-06", 99],
    ])),
  );

  assert.deepEqual(comparisons[1].mom, {
    baselinePeriod: "2026-05",
    baselineValue: null,
    absoluteChange: null,
    percentageChange: null,
    reason: "insufficient_history",
  });
});

test("looks up December as the previous month for January", () => {
  const comparisons = compareMetrics(
    observationsFrom(new Map([
      ["2025-12", 90],
      ["2026-01", 99],
    ])),
  );

  assert.deepEqual(comparisons[1].mom, {
    baselinePeriod: "2025-12",
    baselineValue: 90,
    absoluteChange: 9,
    percentageChange: 10,
    reason: null,
  });
});
