import test from "node:test";
import assert from "node:assert/strict";
import { projectBaselines } from "../src/project.mjs";

function monthly(metricId, values, startYear = 2025, startMonth = 7) {
  return values.map((value, index) => {
    const absoluteMonth = startYear * 12 + startMonth - 1 + index;
    const year = Math.floor(absoluteMonth / 12);
    const month = (absoluteMonth % 12) + 1;
    return {
      metricId,
      period: `${year}-${String(month).padStart(2, "0")}`,
      value,
    };
  });
}

test("projects the latest value with median recent drift", () => {
  const [result] = projectBaselines(monthly("metric_a", [10, 12, 13, 16]), {
    projectionWindow: 4,
  });

  assert.deepEqual(result, {
    metricId: "metric_a",
    targetPeriod: "2025-11",
    method: "median_recent_drift",
    inputPeriods: ["2025-07", "2025-08", "2025-09", "2025-10"],
    projectedValue: 18,
    limitation: null,
  });
});

test("averages two distinct middle drifts for an even difference count", () => {
  const [result] = projectBaselines(monthly("metric_a", [10, 12, 16]), {
    projectionWindow: 3,
  });

  assert.equal(result.projectedValue, 19);
});

test("uses the median drift instead of an extreme change", () => {
  const [result] = projectBaselines(monthly("metric_a", [10, 11, 12, 100, 101, 102]), {
    projectionWindow: 6,
  });

  assert.equal(result.projectedValue, 103);
  assert.equal(result.method, "median_recent_drift");
});

test("returns numeric overflow when finite inputs produce non-finite differences", () => {
  const [result] = projectBaselines(
    monthly("metric_a", [Number.MAX_VALUE, -Number.MAX_VALUE, Number.MAX_VALUE]),
    { projectionWindow: 3 },
  );

  assert.deepEqual(result, {
    metricId: "metric_a",
    targetPeriod: "2025-10",
    method: "median_recent_drift",
    inputPeriods: ["2025-07", "2025-08", "2025-09"],
    projectedValue: null,
    limitation: "numeric_overflow",
  });
});

test("returns numeric overflow when a finite drift makes the projection overflow", () => {
  const maximum = Number.MAX_VALUE;
  const [result] = projectBaselines(
    monthly("metric_a", [maximum / 2, maximum * 0.75, maximum]),
    { projectionWindow: 3 },
  );

  assert.equal(result.projectedValue, null);
  assert.equal(result.limitation, "numeric_overflow");
});

test("uses only the exact trailing projection window", () => {
  const [result] = projectBaselines(
    monthly("metric_a", [1000, 10, 11, 12, 13, 14, 15]),
    { projectionWindow: 6 },
  );

  assert.deepEqual(result.inputPeriods, [
    "2025-08",
    "2025-09",
    "2025-10",
    "2025-11",
    "2025-12",
    "2026-01",
  ]);
  assert.equal(result.projectedValue, 16);
});

test("ignores a gap older than the exact trailing projection window", () => {
  const [result] = projectBaselines([
    { metricId: "metric_a", period: "2025-01", value: 1000 },
    ...monthly("metric_a", [10, 11, 12, 13, 14, 15]),
  ], { projectionWindow: 6 });

  assert.equal(result.limitation, null);
  assert.deepEqual(result.inputPeriods, [
    "2025-07",
    "2025-08",
    "2025-09",
    "2025-10",
    "2025-11",
    "2025-12",
  ]);
  assert.equal(result.projectedValue, 16);
});

test("returns a period gap limitation for a gap inside the selected window", () => {
  const records = monthly("metric_a", [10, 11, 12, 13, 14, 15]).filter(
    ({ period }) => period !== "2025-10",
  );

  assert.deepEqual(projectBaselines(records, { projectionWindow: 6 }), [
    {
      metricId: "metric_a",
      targetPeriod: "2026-01",
      method: "median_recent_drift",
      inputPeriods: ["2025-07", "2025-08", "2025-09", "2025-11", "2025-12"],
      projectedValue: null,
      limitation: "period_gap",
    },
  ]);
});

test("returns an insufficient history limitation with fewer than three periods", () => {
  assert.deepEqual(projectBaselines(monthly("metric_b", [10, 12]), {
    projectionWindow: 6,
  }), [
    {
      metricId: "metric_b",
      targetPeriod: "2025-09",
      method: "median_recent_drift",
      inputPeriods: ["2025-07", "2025-08"],
      projectedValue: null,
      limitation: "insufficient_history",
    },
  ]);
});

test("sorts projections by metric ID", () => {
  const result = projectBaselines([
    ...monthly("metric_z", [1, 2, 3]),
    ...monthly("metric_a", [4, 5, 6]),
  ], { projectionWindow: 3 });

  assert.deepEqual(result.map(({ metricId }) => metricId), ["metric_a", "metric_z"]);
});
