import test from "node:test";
import assert from "node:assert/strict";
import { traceRiskLineages } from "../src/risk-lineage.mjs";
import { findPatterns } from "../src/patterns.mjs";
import { parseMetricsCsv } from "../src/parse.mjs";

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

test("tracks warning severity inside an active lineage without opening from warning alone", () => {
  const comparisons = [
    comparison("on_time", "2025-12", "warning", -0.5),
    comparison("on_time", "2026-01", "at_risk", -3),
    comparison("on_time", "2026-02", "warning", -0.5),
    comparison("on_time", "2026-03", "at_risk", -2),
    comparison("on_time", "2026-04", "on_target", 1),
  ];

  assert.deepEqual(traceRiskLineages(comparisons), [
    {
      metricId: "on_time",
      originPeriod: "2026-01",
      originSeverity: 3,
      events: [
        { period: "2026-02", classification: "improved_at_risk", severity: 0.5 },
        { period: "2026-03", classification: "worsened", severity: 2 },
        { period: "2026-04", classification: "recovered", severity: 0 },
      ],
      outcome: "recovered",
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

function observations(metricId, periods, values) {
  return periods.map((period, index) => ({
    metricId,
    period,
    value: values[index],
  }));
}

const sourcePeriods = [
  "2025-07",
  "2025-08",
  "2025-09",
  "2025-10",
  "2025-11",
  "2025-12",
  "2026-01",
  "2026-02",
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
];
const outcomePeriods = sourcePeriods;
const extendedHistoryPeriods = ["2025-05", "2025-06", ...sourcePeriods];
const olderGapHistoryPeriods = ["2025-03", ...extendedHistoryPeriods];
const gappedHistoryPeriods = ["2025-05", "2025-06", ...sourcePeriods].filter(
  (period) => period !== "2025-10",
);
const configuredAssociation = {
  sourceMetricId: "late_inbound",
  outcomeMetricId: "on_time",
  lagMonths: 1,
  minimumObservations: 6,
};

function recordsWithOlderGap() {
  return [
    ...observations(
      "late_inbound",
      olderGapHistoryPeriods,
      olderGapHistoryPeriods.map((_, index) => index + 1),
    ),
    ...observations(
      "on_time",
      olderGapHistoryPeriods,
      olderGapHistoryPeriods.map((_, index) => olderGapHistoryPeriods.length - index),
    ),
  ];
}

test("reports only recurrence events meeting the configured threshold", () => {
  const records = [
    ...observations("damage", sourcePeriods, sourcePeriods.map(() => 1)),
    ...observations("on_time", sourcePeriods, sourcePeriods.map(() => 1)),
    ...observations(
      "short_history",
      sourcePeriods.slice(1),
      sourcePeriods.slice(1).map(() => 1),
    ),
    ...observations(
      "gapped_history",
      gappedHistoryPeriods,
      gappedHistoryPeriods.map(() => 1),
    ),
  ];
  const comparisons = [
    comparison("damage", "2025-09", "at_risk", -1),
    comparison("damage", "2026-03", "at_risk", -2),
    comparison("damage", "2026-07", "at_risk", -1),
    comparison("on_time", "2026-01", "at_risk", -2),
    comparison("on_time", "2026-02", "on_target", 1),
    comparison("on_time", "2026-03", "at_risk", -1),
    comparison("short_history", "2026-01", "at_risk", -2),
    comparison("short_history", "2026-03", "at_risk", -1),
    comparison("short_history", "2026-07", "at_risk", -1),
    comparison("gapped_history", "2026-01", "at_risk", -2),
    comparison("gapped_history", "2026-03", "at_risk", -1),
    comparison("gapped_history", "2026-07", "at_risk", -1),
  ];

  assert.deepEqual(
    findPatterns(records, comparisons, {
      minimumRecurrences: 3,
      candidateAssociations: [],
    }),
    {
      recurrences: [
        {
          metricId: "damage",
          eventCount: 3,
          periods: ["2025-09", "2026-03", "2026-07"],
        },
      ],
      candidateAssociations: [],
    },
  );
});

test("calculates a configured Pearson association at the exact calendar lag", () => {
  const records = [
    ...observations(
      "late_inbound",
      sourcePeriods,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    ),
    ...observations(
      "on_time",
      outcomePeriods,
      [13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    ),
  ];

  const result = findPatterns(records, [], {
    minimumRecurrences: 3,
    candidateAssociations: [configuredAssociation],
  });

  assert.deepEqual(result.candidateAssociations[0], {
    type: "candidate_association",
    sourceMetricId: "late_inbound",
    outcomeMetricId: "on_time",
    lagMonths: 1,
    observationCount: 12,
    coefficient: -1,
    periodPairs: [
      { sourcePeriod: "2025-07", outcomePeriod: "2025-08" },
      { sourcePeriod: "2025-08", outcomePeriod: "2025-09" },
      { sourcePeriod: "2025-09", outcomePeriod: "2025-10" },
      { sourcePeriod: "2025-10", outcomePeriod: "2025-11" },
      { sourcePeriod: "2025-11", outcomePeriod: "2025-12" },
      { sourcePeriod: "2025-12", outcomePeriod: "2026-01" },
      { sourcePeriod: "2026-01", outcomePeriod: "2026-02" },
      { sourcePeriod: "2026-02", outcomePeriod: "2026-03" },
      { sourcePeriod: "2026-03", outcomePeriod: "2026-04" },
      { sourcePeriod: "2026-04", outcomePeriod: "2026-05" },
      { sourcePeriod: "2026-05", outcomePeriod: "2026-06" },
      { sourcePeriod: "2026-06", outcomePeriod: "2026-07" },
    ],
    limitation: null,
  });
});

test("uses only the exact trailing 13-month windows for association evidence", () => {
  const records = [
    ...observations(
      "late_inbound",
      extendedHistoryPeriods,
      extendedHistoryPeriods.map((_, index) => index + 1),
    ),
    ...observations(
      "on_time",
      extendedHistoryPeriods,
      extendedHistoryPeriods.map((_, index) => extendedHistoryPeriods.length - index),
    ),
  ];

  const [result] = findPatterns(records, [], {
    minimumRecurrences: 3,
    candidateAssociations: [configuredAssociation],
  }).candidateAssociations;

  assert.equal(result.observationCount, 12);
  assert.equal(result.coefficient, -1);
  assert.equal(result.limitation, null);
  assert.deepEqual(
    result.periodPairs,
    sourcePeriods.slice(0, -1).map((sourcePeriod, index) => ({
      sourcePeriod,
      outcomePeriod: outcomePeriods[index + 1],
    })),
  );
});

test("ignores a gap older than the trailing window for recurrence eligibility", () => {
  const comparisons = [
    comparison("late_inbound", "2025-09", "at_risk", -1),
    comparison("late_inbound", "2026-03", "at_risk", -2),
    comparison("late_inbound", "2026-07", "at_risk", -1),
  ];

  const result = findPatterns(recordsWithOlderGap(), comparisons, {
    minimumRecurrences: 3,
    candidateAssociations: [],
  });

  assert.deepEqual(result.recurrences, [
    {
      metricId: "late_inbound",
      eventCount: 3,
      periods: ["2025-09", "2026-03", "2026-07"],
    },
  ]);
});

test("ignores a gap older than the trailing windows for association evidence", () => {
  const [result] = findPatterns(recordsWithOlderGap(), [], {
    minimumRecurrences: 3,
    candidateAssociations: [configuredAssociation],
  }).candidateAssociations;

  assert.equal(result.observationCount, 12);
  assert.equal(result.coefficient, -1);
  assert.equal(result.limitation, null);
});

test("does not search metric pairs that were not configured", () => {
  const records = [
    ...observations("late_inbound", sourcePeriods, sourcePeriods.map((_, index) => index + 1)),
    ...observations("on_time", outcomePeriods, outcomePeriods.map((_, index) => 13 - index)),
  ];

  const result = findPatterns(records, [], {
    minimumRecurrences: 3,
    candidateAssociations: [],
  });

  assert.deepEqual(result.candidateAssociations, []);
});

test("returns zero variance as an explicit association limitation", () => {
  const records = [
    ...observations("late_inbound", sourcePeriods, sourcePeriods.map(() => 2)),
    ...observations("on_time", outcomePeriods, outcomePeriods.map((_, index) => 13 - index)),
  ];

  const [result] = findPatterns(records, [], {
    minimumRecurrences: 3,
    candidateAssociations: [configuredAssociation],
  }).candidateAssociations;

  assert.equal(result.observationCount, 12);
  assert.equal(result.coefficient, null);
  assert.equal(result.limitation, "zero_variance");
  assert.deepEqual(
    result.periodPairs,
    sourcePeriods.slice(0, -1).map((sourcePeriod, index) => ({
      sourcePeriod,
      outcomePeriod: outcomePeriods[index + 1],
    })),
  );
});

test("returns a period gap limitation when a configured metric misses the latest month", () => {
  const sourceHistoryMissingLatest = ["2025-06", ...sourcePeriods.slice(0, -1)];
  const records = [
    ...observations(
      "late_inbound",
      sourceHistoryMissingLatest,
      sourceHistoryMissingLatest.map((_, index) => index + 1),
    ),
    ...observations("on_time", outcomePeriods, outcomePeriods.map((_, index) => 13 - index)),
  ];

  const [result] = findPatterns(records, [], {
    minimumRecurrences: 3,
    candidateAssociations: [configuredAssociation],
  }).candidateAssociations;

  assert.equal(result.observationCount, 13);
  assert.equal(result.coefficient, null);
  assert.equal(result.limitation, "period_gap");
  assert.deepEqual(
    result.periodPairs,
    sourceHistoryMissingLatest.map((sourcePeriod, index) => ({
      sourcePeriod,
      outcomePeriod: outcomePeriods[index],
    })),
  );
});

test("returns a period gap limitation for nonconsecutive configured history", () => {
  const records = [
    ...observations(
      "late_inbound",
      gappedHistoryPeriods,
      gappedHistoryPeriods.map((_, index) => index + 1),
    ),
    ...observations("on_time", outcomePeriods, outcomePeriods.map((_, index) => 13 - index)),
  ];

  const [result] = findPatterns(records, [], {
    minimumRecurrences: 3,
    candidateAssociations: [configuredAssociation],
  }).candidateAssociations;

  assert.equal(result.coefficient, null);
  assert.equal(result.limitation, "period_gap");
});

test("returns an insufficient history limitation before association analysis", () => {
  const shortSourcePeriods = sourcePeriods.slice(1);
  const shortOutcomePeriods = outcomePeriods.slice(1);
  const records = [
    ...observations(
      "late_inbound",
      shortSourcePeriods,
      shortSourcePeriods.map((_, index) => index + 1),
    ),
    ...observations(
      "on_time",
      shortOutcomePeriods,
      shortOutcomePeriods.map((_, index) => 12 - index),
    ),
  ];

  const [result] = findPatterns(records, [], {
    minimumRecurrences: 3,
    candidateAssociations: [configuredAssociation],
  }).candidateAssociations;

  assert.equal(result.observationCount, 11);
  assert.equal(result.coefficient, null);
  assert.equal(result.limitation, "insufficient_history");
  assert.deepEqual(
    result.periodPairs,
    shortSourcePeriods.slice(0, -1).map((sourcePeriod, index) => ({
      sourcePeriod,
      outcomePeriod: shortOutcomePeriods[index + 1],
    })),
  );
});

test("returns an insufficient observation limitation after the history gate", () => {
  const records = [
    ...observations("late_inbound", sourcePeriods, sourcePeriods.map((_, index) => index + 1)),
    ...observations("on_time", outcomePeriods, outcomePeriods.map((_, index) => 13 - index)),
  ];

  const [result] = findPatterns(records, [], {
    minimumRecurrences: 3,
    candidateAssociations: [{ ...configuredAssociation, lagMonths: 8 }],
  }).candidateAssociations;

  assert.equal(result.observationCount, 5);
  assert.equal(result.coefficient, null);
  assert.equal(result.limitation, "insufficient_observations");
  assert.deepEqual(
    result.periodPairs,
    sourcePeriods.slice(0, 5).map((sourcePeriod, index) => ({
      sourcePeriod,
      outcomePeriod: outcomePeriods[index + 8],
    })),
  );
});

function consecutivePeriods(count, startYear = 2024, startMonth = 1) {
  return Array.from({ length: count }, (_, index) => {
    const absoluteMonth = startYear * 12 + startMonth - 1 + index;
    const year = Math.floor(absoluteMonth / 12);
    const month = (absoluteMonth % 12) + 1;
    return `${year}-${String(month).padStart(2, "0")}`;
  });
}

test("Pearson is translation-stable for accepted high-offset parsed values", () => {
  const periods = consecutivePeriods(14);
  const sourceTokens = [
    "999999999999.005",
    "999999999999.004",
    "999999999999.006",
    "999999999999.004",
    "999999999999.003",
    "999999999999.005",
    "999999999999.005",
    "999999999999.005",
    "999999999999.008",
    "999999999999.002",
    "999999999999.006",
    "999999999999.002",
    "999999999999.006",
    "999999999999.006",
  ];
  const outcomeTokens = [
    "999999999999.000",
    "999999999999.000",
    "999999999999.000",
    "999999999999.007",
    "999999999999.005",
    "999999999999.004",
    "999999999999.000",
    "999999999999.004",
    "999999999999.004",
    "999999999999.009",
    "999999999999.008",
    "999999999999.001",
    "999999999999.006",
    "999999999999.008",
  ];
  const header =
    "period,pillar_id,metric_id,metric_label,value,unit,target_type,target_min,target_max,warning_margin";
  const rows = periods.flatMap((period, index) => [
    `${period},synth_flow,synth_late_inbound_count,SYNTH Late inbound count,${sourceTokens[index]},count,,,,`,
    `${period},synth_flow,synth_packages_per_paid_hour,SYNTH Packages per paid hour,${outcomeTokens[index]},ratio,,,,`,
  ]);
  const records = parseMetricsCsv([header, ...rows].join("\n"));
  const [result] = findPatterns(records, [], {
    minimumRecurrences: 3,
    candidateAssociations: [
      {
        sourceMetricId: "synth_late_inbound_count",
        outcomeMetricId: "synth_packages_per_paid_hour",
        lagMonths: 1,
        minimumObservations: 13,
      },
    ],
  }).candidateAssociations;

  assert.equal(result.limitation, null);
  assert.equal(result.observationCount, 13);
  assert.ok(Math.abs(result.coefficient - 0.07429456977961686) <= 1e-12);
});

test("retains enough aligned history for a lag-eight association after the latest 13-month gate", () => {
  const periods = consecutivePeriods(14);
  const [result] = findPatterns(
    [
      ...observations("late_inbound", periods, periods.map((_, index) => index + 1)),
      ...observations("on_time", periods, periods.map((_, index) => index + 10)),
    ],
    [],
    {
      minimumRecurrences: 3,
      candidateAssociations: [
        { ...configuredAssociation, lagMonths: 8, minimumObservations: 6 },
      ],
    },
  ).candidateAssociations;

  assert.equal(result.observationCount, 6);
  assert.equal(result.coefficient, 1);
  assert.equal(result.limitation, null);
});

test("retains 25 periods for a lag-twelve association with 13 required observations", () => {
  const periods = consecutivePeriods(25);
  const [result] = findPatterns(
    [
      ...observations("late_inbound", periods, periods.map((_, index) => index + 1)),
      ...observations("on_time", periods, periods.map((_, index) => 100 - index)),
    ],
    [],
    {
      minimumRecurrences: 3,
      candidateAssociations: [
        { ...configuredAssociation, lagMonths: 12, minimumObservations: 13 },
      ],
    },
  ).candidateAssociations;

  assert.equal(result.observationCount, 13);
  assert.equal(result.coefficient, -1);
  assert.equal(result.limitation, null);
});

test("scaled Pearson remains stable for finite extreme values", () => {
  const values = sourcePeriods.map((_, index) => (index % 2 === 0 ? 1e308 : -1e308));
  const [result] = findPatterns(
    [
      ...observations("late_inbound", sourcePeriods, values),
      ...observations("on_time", sourcePeriods, values),
    ],
    [],
    { minimumRecurrences: 3, candidateAssociations: [configuredAssociation] },
  ).candidateAssociations;

  assert.ok(Number.isFinite(result.coefficient));
  assert.equal(result.limitation, null);
});

test("unexpected non-finite association arithmetic degrades to numeric overflow", () => {
  const values = sourcePeriods.map((_, index) => (index === 4 ? Infinity : index + 1));
  const [result] = findPatterns(
    [
      ...observations("late_inbound", sourcePeriods, values),
      ...observations("on_time", sourcePeriods, sourcePeriods.map((_, index) => index + 1)),
    ],
    [],
    { minimumRecurrences: 3, candidateAssociations: [configuredAssociation] },
  ).candidateAssociations;

  assert.equal(result.coefficient, null);
  assert.equal(result.limitation, "numeric_overflow");
});

test("pattern results contain no causal vocabulary", () => {
  const result = findPatterns(
    [
      ...observations(
        "late_inbound",
        sourcePeriods,
        sourcePeriods.map((_, index) => index + 1),
      ),
      ...observations("on_time", outcomePeriods, outcomePeriods.map((_, index) => 13 - index)),
    ],
    [],
    {
      minimumRecurrences: 3,
      candidateAssociations: [configuredAssociation],
    },
  );

  assert.doesNotMatch(JSON.stringify(result), /cause|driver|prediction/i);
});
