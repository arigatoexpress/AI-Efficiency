import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseMetricsCsv, parsePolicyJson } from "../src/parse.mjs";
import { assertPublicSafe } from "../src/privacy.mjs";

const header =
  "period,pillar_id,metric_id,metric_label,value,unit,target_type,target_min,target_max,warning_margin";
const valid = [
  header,
  '2026-06,service,on_time,"On-time percent",96.2,percent,minimum,95,,1',
].join("\n");

function csv(...rows) {
  return [header, ...rows].join("\n");
}

test("quoted CSV maps to one canonical observation", () => {
  const [row] = parseMetricsCsv(valid);

  assert.deepEqual(row, {
    period: "2026-06",
    pillarId: "service",
    metricId: "on_time",
    metricLabel: "On-time percent",
    value: 96.2,
    unit: "percent",
    targetType: "minimum",
    targetMin: 95,
    targetMax: null,
    warningMargin: 1,
  });
});

test("CSV schema rejects unknown, reordered, and duplicate headers", () => {
  const row = "2026-06,service,on_time,On-time percent,96.2,percent,minimum,95,,1";

  assert.throws(
    () => parseMetricsCsv(`notes,${header}\nx,${row}`),
    { code: "SCHEMA_INVALID_CSV_HEADER" },
  );
  assert.throws(
    () => parseMetricsCsv(`${header.replace("period,pillar_id", "pillar_id,period")}\n${row}`),
    { code: "SCHEMA_INVALID_CSV_HEADER" },
  );
  assert.throws(
    () => parseMetricsCsv(`${header},metric_id\n${row},on_time`),
    { code: "SCHEMA_DUPLICATE_CSV_HEADER" },
  );
});

test("CSV rejects duplicate observation keys and unstable metric definitions", () => {
  const first = "2026-06,service,on_time,On-time percent,96.2,percent,minimum,95,,1";

  assert.throws(() => parseMetricsCsv(csv(first, first)), {
    code: "SCHEMA_DUPLICATE_OBSERVATION",
  });
  assert.throws(
    () =>
      parseMetricsCsv(
        csv(
          first,
          "2026-07,service,on_time,On-time percent,95.1,minutes,minimum,95,,1",
        ),
      ),
    { code: "SCHEMA_UNSTABLE_METRIC" },
  );
});

test("CSV rejects malformed target definitions", () => {
  assert.throws(
    () =>
      parseMetricsCsv(
        csv("2026-06,service,on_time,On-time percent,96.2,percent,minimum,,,1"),
      ),
    { code: "SCHEMA_INVALID_TARGET" },
  );
  assert.throws(
    () =>
      parseMetricsCsv(
        csv("2026-06,service,on_time,On-time percent,96.2,percent,range,98,95,1"),
      ),
    { code: "SCHEMA_INVALID_TARGET" },
  );
});

test("policy is closed and applies deterministic defaults", () => {
  assert.deepEqual(parsePolicyJson("{}"), {
    projectionWindow: 6,
    minimumRecurrences: 3,
    candidateAssociations: [],
  });
  assert.throws(() => parsePolicyJson('{"notes":"x"}'), {
    code: "SCHEMA_UNKNOWN_POLICY_FIELD",
  });
});

test("policy rejects duplicate association keys and malformed ranges", () => {
  const association = {
    sourceMetricId: "volume",
    outcomeMetricId: "on_time",
    lagMonths: 1,
    minimumObservations: 6,
  };

  assert.throws(
    () =>
      parsePolicyJson(
        JSON.stringify({ candidateAssociations: [association, association] }),
      ),
    { code: "SCHEMA_DUPLICATE_ASSOCIATION" },
  );
  assert.throws(() => parsePolicyJson('{"projectionWindow":2}'), {
    code: "SCHEMA_INVALID_POLICY_VALUE",
  });
  assert.throws(() => parsePolicyJson('{"projectionWindow":null}'), {
    code: "SCHEMA_INVALID_POLICY_VALUE",
  });
});

test("privacy rejects forbidden fields without echoing rejected values", () => {
  const rows = [
    { ...parseMetricsCsv(valid)[0], employee_id: "SYNTH-UNSAFE-999" },
  ];

  assert.throws(() => assertPublicSafe(rows), (error) => {
    assert.equal(error.code, "PRIVACY_FORBIDDEN_FIELD");
    assert.doesNotMatch(error.message, /SYNTH-UNSAFE-999/);
    return true;
  });
});

test("privacy rejects direct-identifier patterns without creating output", () => {
  const workdir = mkdtempSync(join(tmpdir(), "priority-metrics-validation-"));
  const output = join(workdir, "output");
  const records = [
    { ...parseMetricsCsv(valid)[0], metricLabel: "Contact synth@example.invalid" },
  ];

  try {
    assert.throws(() => assertPublicSafe(records), (error) => {
      assert.equal(error.code, "PRIVACY_DIRECT_IDENTIFIER");
      assert.doesNotMatch(error.message, /synth@example\.invalid/);
      return true;
    });
    assert.equal(existsSync(output), false);
  } finally {
    rmSync(workdir, { recursive: true, force: true });
  }
});
