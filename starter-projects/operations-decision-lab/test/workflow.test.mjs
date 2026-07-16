import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { analyzeDecisionLab } from "../src/analyze.mjs";
import { renderMarkdown, stableJson } from "../src/render.mjs";

function isoDay(index) {
  return new Date(Date.UTC(2026, 5, 1 + index)).toISOString().slice(0, 10);
}

function input() {
  return {
    schemaVersion: "1.0.0",
    provenance: {
      snapshotTime: "2026-07-15T12:00:00Z",
      targetStart: "2026-07-16T00:00:00Z",
      targetEnd: "2026-07-17T00:00:00Z",
      serviceDate: "2026-07-16",
      policyVersion: "policy-v1",
      modelVersion: "baseline-v1",
    },
    forecast: {
      entityId: "SYNTH-STATION-01",
      quantityId: "packages_tendered",
      unit: "packages",
      seasonLength: 7,
      observations: Array.from({ length: 35 }, (_, index) => ({
        observationId: `SYNTH-OBS-${String(index + 1).padStart(3, "0")}`,
        serviceDate: isoDay(index),
        availableAt: `${isoDay(index)}T23:00:00Z`,
        value: 100 + (index % 7) * 5 + index,
      })),
    },
    resources: {
      vehicles: [
        {
          vehicleId: "SYNTH-VEHICLE-01",
          capacityUnits: 500,
          availableStart: "2026-07-16T06:00:00Z",
          availableEnd: "2026-07-16T18:00:00Z",
          maxRouteMinutes: 600,
        },
      ],
      laborShifts: [
        {
          shiftId: "SYNTH-SHIFT-01",
          startTime: "2026-07-16T06:00:00Z",
          endTime: "2026-07-16T18:00:00Z",
          maxOnRoadMinutes: 600,
        },
      ],
    },
    demandGroups: [
      {
        demandGroupId: "SYNTH-DEMAND-01",
        packages: 120,
        cubeUnits: 200,
        serviceMinutes: 60,
        windowStart: "2026-07-16T08:00:00Z",
        windowEnd: "2026-07-16T12:00:00Z",
        required: true,
      },
    ],
    plans: [
      {
        planId: "SYNTH-PLAN-01",
        planVersion: "plan-v1",
        snapshotTime: "2026-07-15T12:00:00Z",
        releaseTime: "2026-07-16T07:00:00Z",
        routes: [
          {
            routeId: "SYNTH-ROUTE-01",
            vehicleId: "SYNTH-VEHICLE-01",
            shiftId: "SYNTH-SHIFT-01",
            visits: [
              {
                sequence: 1,
                demandGroupId: "SYNTH-DEMAND-01",
                arrivalTime: "2026-07-16T08:30:00Z",
                departureTime: "2026-07-16T09:30:00Z",
              },
            ],
          },
        ],
      },
    ],
    policy: { earliestReleaseTime: "2026-07-16T06:30:00Z" },
  };
}

function analyze(value = input()) {
  return analyzeDecisionLab(value, {
    analyzerVersion: "0.1.0",
    dataClassification: "synthetic",
  });
}

test("canonical analysis publishes only 002-A forecast and supplied-plan evidence", () => {
  const result = analyze();
  assert.deepEqual(Object.keys(result), [
    "schemaVersion",
    "analyzerVersion",
    "provenance",
    "validation",
    "forecasts",
    "feasibility",
    "limitations",
    "methods",
  ]);
  assert.deepEqual(result.forecasts.parameters, {
    seasonLength: 7,
    levelTrendAlpha: 0.5,
    levelTrendBeta: 0.25,
  });
  assert.deepEqual(
    result.forecasts.models.map(({ model }) => model),
    ["last_value", "level_trend", "seasonal_naive_7"],
  );
  assert.equal(result.forecasts.winner, null);
  assert.equal(result.feasibility[0].status, "feasible");
  assert.deepEqual(result.limitations, [
    "baseline_models_only",
    "single_series_no_model_selection",
    "supplied_plans_only",
  ]);
  assert.doesNotMatch(
    JSON.stringify(result),
    /recommendation|scenario|sensitivity|sendTime|productivity|objective|cvar/i,
  );
});

test("forward quantiles and evaluation remain ordered, finite, and deterministic", () => {
  const first = analyze();
  const second = analyze(structuredClone(input()));
  assert.equal(stableJson(first), stableJson(second));

  for (const model of first.forecasts.models) {
    const values = ["p10", "p25", "p50", "p75", "p90"]
      .map((name) => model.forecast[name])
      .filter((value) => value !== null);
    assert.deepEqual(values, [...values].sort((left, right) => left - right));
    assert.ok(values.every((value) => Number.isFinite(value) && value >= 0));
  }
});

test("stable JSON uses 15 significant digits and rejects non-finite numbers", () => {
  assert.equal(
    stableJson({ z: -0, a: 0.000000000001234567890123 }),
    '{\n  "a": 1.234567890123e-12,\n  "z": 0\n}\n',
  );
  assert.throws(() => stableJson({ value: Number.POSITIVE_INFINITY }), {
    message: "NON_FINITE_NUMBER",
  });
});

test("Markdown renders canonical evidence without inventing deferred claims", () => {
  const result = analyze();
  const markdown = renderMarkdown(result);
  assert.match(markdown, /^# Operations Decision Lab Brief\n/);
  assert.match(markdown, /## Forecast Evidence/);
  assert.match(markdown, /## Supplied-Plan Feasibility/);
  assert.match(markdown, /baseline_models_only/);
  assert.doesNotMatch(markdown, /recommended plan|dispatch|CVaR|sensitivity/i);
  assert.ok(markdown.endsWith("\n"));
});

test("published output schema is closed and fixes the three-model tuple", () => {
  const schema = JSON.parse(
    readFileSync(
      new URL(
        "../../../specs/002-operations-decision-lab/contracts/analysis-output.schema.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const objectSchemas = [schema, ...Object.values(schema.$defs)].filter(
    (value) => value.type === "object",
  );
  assert.ok(objectSchemas.length > 5);
  assert.ok(objectSchemas.every((value) => value.additionalProperties === false));
  assert.equal(schema.$defs.forecasts.properties.winner.const, null);
  assert.deepEqual(
    schema.$defs.forecastModels.prefixItems.map(
      (item) => item.properties.model.const,
    ),
    ["last_value", "level_trend", "seasonal_naive_7"],
  );
  assert.equal(schema.$defs.forecastModels.items, false);
});
