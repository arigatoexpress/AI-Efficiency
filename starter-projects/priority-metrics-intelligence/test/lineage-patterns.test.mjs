import test from "node:test";
import assert from "node:assert/strict";
import { traceRiskLineages } from "../src/risk-lineage.mjs";

function comparison(metricId, period, status, distance) {
  return {
    metricId,
    period,
    target: { status, distance },
  };
}

test("traces worsening, improvement at risk, and recovery from the original breach", () => {
  const comparisons = [
    comparison("on_time", "2026-01", "at_risk", -2),
    comparison("on_time", "2026-02", "at_risk", -3),
    comparison("on_time", "2026-03", "at_risk", -1),
    comparison("on_time", "2026-04", "on_target", 0),
  ];

  assert.deepEqual(traceRiskLineages(comparisons), [
    {
      metricId: "on_time",
      originPeriod: "2026-01",
      originSeverity: 2,
      events: [
        { period: "2026-02", classification: "worsened", severity: 3 },
        { period: "2026-03", classification: "improved_at_risk", severity: 1 },
        { period: "2026-04", classification: "recovered", severity: 0 },
      ],
      outcome: "recovered",
    },
  ]);
});

test("keeps an equal-severity consecutive breach active as persisted", () => {
  const comparisons = [
    comparison("damage", "2026-01", "at_risk", -1),
    comparison("damage", "2026-02", "at_risk", -1),
  ];

  assert.deepEqual(traceRiskLineages(comparisons), [
    {
      metricId: "damage",
      originPeriod: "2026-01",
      originSeverity: 1,
      events: [
        { period: "2026-02", classification: "persisted", severity: 1 },
      ],
      outcome: "active",
    },
  ]);
});

test("closes a discontinuous lineage and opens a new lineage at the next breach", () => {
  const comparisons = [
    comparison("scan_quality", "2026-01", "at_risk", -2),
    comparison("scan_quality", "2026-03", "at_risk", -1),
  ];

  assert.deepEqual(traceRiskLineages(comparisons), [
    {
      metricId: "scan_quality",
      originPeriod: "2026-01",
      originSeverity: 2,
      events: [
        { period: "2026-02", classification: "gap", severity: null },
      ],
      outcome: "untraceable",
    },
    {
      metricId: "scan_quality",
      originPeriod: "2026-03",
      originSeverity: 1,
      events: [],
      outcome: "active",
    },
  ]);
});

test("lineage results contain no causal vocabulary", () => {
  const result = traceRiskLineages([
    comparison("on_time", "2026-01", "at_risk", -2),
    comparison("on_time", "2026-02", "on_target", 1),
  ]);

  assert.doesNotMatch(JSON.stringify(result), /cause|driver|prediction/i);
});
