import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { analyzeMetrics } from "../src/analyze.mjs";
import { parseMetricsCsv, parsePolicyJson } from "../src/parse.mjs";
import { renderMarkdown, stableJson } from "../src/render.mjs";

const fixturesUrl = new URL("../fixtures/", import.meta.url);

async function fixture(name) {
  return readFile(new URL(name, fixturesUrl), "utf8");
}

async function analyzeFixture(recordsTransform = (records) => records) {
  const records = recordsTransform(
    parseMetricsCsv(await fixture("synthetic-monthly-metrics.csv")),
  );
  const policy = parsePolicyJson(await fixture("synthetic-policy.json"));
  return analyzeMetrics({
    records,
    policy,
    analyzerVersion: "0.1.0",
    dataClassification: "synthetic",
  });
}

function observation(metricId, period, value) {
  return {
    period,
    pillarId: "synth_service",
    metricId,
    metricLabel: "SYNTH Metric",
    value,
    unit: "count",
    targetType: null,
    targetMin: null,
    targetMax: null,
    warningMargin: 0,
  };
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

test("uses the dataset-wide latest period and discloses a missing current metric", () => {
  const result = analyzeMetrics({
    records: [
      observation("synth_current", "2026-04", 1),
      observation("synth_current", "2026-05", 2),
      observation("synth_current", "2026-06", 3),
      {
        ...observation("synth_missing", "2026-03", 4),
        targetType: "minimum",
        targetMin: 10,
      },
      {
        ...observation("synth_missing", "2026-04", 5),
        targetType: "minimum",
        targetMin: 10,
      },
      {
        ...observation("synth_missing", "2026-05", 6),
        targetType: "minimum",
        targetMin: 10,
      },
    ],
    policy: {
      projectionWindow: 3,
      minimumRecurrences: 3,
      candidateAssociations: [],
    },
    analyzerVersion: "0.1.0",
    dataClassification: "scrubbed",
  });

  assert.equal(result.inputSummary.analysisPeriod, "2026-06");
  assert.deepEqual(
    result.comparisons.map(({ metricId, period }) => ({ metricId, period })),
    [{ metricId: "synth_current", period: "2026-06" }],
  );
  assert.deepEqual(result.limitations, ["missing_current_period:synth_missing"]);
  assert.deepEqual(result.riskLineages, [
    {
      metricId: "synth_missing",
      originPeriod: "2026-03",
      originSeverity: 6,
      events: [
        { period: "2026-04", classification: "improved_at_risk", severity: 5 },
        { period: "2026-05", classification: "improved_at_risk", severity: 4 },
        { period: "2026-06", classification: "gap", severity: null },
      ],
      outcome: "untraceable",
    },
  ]);
  assert.deepEqual(
    result.projections.find(({ metricId }) => metricId === "synth_missing"),
    {
      metricId: "synth_missing",
      targetPeriod: "2026-06",
      method: "median_recent_drift",
      inputPeriods: ["2026-03", "2026-04", "2026-05"],
      projectedValue: null,
      limitation: "missing_current_period",
    },
  );
  assert.equal(result.provenance.dataClassification, "scrubbed");
});

test("keeps semantic result order and emits exact canonical golden JSON", async () => {
  const result = await analyzeFixture();
  const expected = await fixture("expected-analysis.json");

  assert.deepEqual(Object.keys(result), [
    "schemaVersion",
    "analyzerVersion",
    "inputSummary",
    "comparisons",
    "riskLineages",
    "patterns",
    "projections",
    "limitations",
    "provenance",
  ]);
  assert.equal(stableJson(result), expected);
  assert.doesNotMatch(expected, /timestamp|generatedAt|generated_at|hostPath|host_path/i);
});

test("recursively sorts keys and rounds only floating noise to 12 decimals", () => {
  assert.equal(
    stableJson({ z: 0.1234567890126, a: { z: 1, a: 2 }, c: [0.1 + 0.2] }),
    [
      "{",
      '  "a": {',
      '    "a": 2,',
      '    "z": 1',
      "  },",
      '  "c": [',
      "    0.3",
      "  ],",
      '  "z": 0.123456789013',
      "}",
      "",
    ].join("\n"),
  );
});

test("rejects unexpected non-finite numbers during canonical normalization", () => {
  for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
    assert.throws(() => stableJson({ value }), {
      name: "RangeError",
      message: "NON_FINITE_NUMBER",
    });
  }
});

test("renders only canonical analysis facts in the required Markdown sections", async () => {
  const result = await analyzeFixture();
  const markdown = renderMarkdown(result);
  const factCollections = [
    result.comparisons,
    result.riskLineages,
    result.patterns.recurrences,
    result.patterns.candidateAssociations,
    result.projections,
  ];

  assert.match(markdown, /^# Priority Metrics Brief\n/);
  for (const heading of [
    "Confirmed Observations",
    "Risks",
    "Candidate Associations",
    "Baseline Outlook",
    "Missing Evidence",
    "Suggested Review Questions",
  ]) {
    assert.ok(markdown.includes(`## ${heading}\n`));
  }
  assert.ok(markdown.includes(`- Analysis period: \`${result.inputSummary.analysisPeriod}\``));
  for (const collection of factCollections) {
    for (const fact of collection) {
      const canonicalInlineFact = JSON.stringify(JSON.parse(stableJson(fact)));
      assert.ok(markdown.includes(`- \`${canonicalInlineFact}\``));
    }
  }
  assert.doesNotMatch(markdown, /cause|driver|guarantee/i);
  assert.equal(
    sha256(markdown),
    "c63897fa1084379e652f82f98d4eba8a8600f38ff5c179b4eaabd89d82572398",
  );
  assert.ok(markdown.endsWith("\n"));
});

test("is byte-deterministic across identical runs and input order", async () => {
  const first = await analyzeFixture();
  const second = await analyzeFixture((records) => [...records].reverse());

  assert.equal(stableJson(first), stableJson(second));
  assert.equal(renderMarkdown(first), renderMarkdown(second));
});
