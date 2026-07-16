import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SafeInputError } from "../src/errors.mjs";
import { parseMetricsCsv, parsePolicyJson } from "../src/parse.mjs";
import { assertPublicSafe } from "../src/privacy.mjs";

const header =
  "period,pillar_id,metric_id,metric_label,value,unit,target_type,target_min,target_max,warning_margin";
const valid = [
  header,
  '2026-06,synth_service,synth_on_time_percent,"SYNTH On-time percent",96.2,percent,minimum,95,,1',
].join("\n");

function csv(...rows) {
  return [header, ...rows].join("\n");
}

test("quoted CSV maps to one canonical observation", () => {
  const [row] = parseMetricsCsv(valid);

  assert.deepEqual(row, {
    period: "2026-06",
    pillarId: "synth_service",
    metricId: "synth_on_time_percent",
    metricLabel: "SYNTH On-time percent",
    value: 96.2,
    unit: "percent",
    targetType: "minimum",
    targetMin: 95,
    targetMax: null,
    warningMargin: 1,
  });
});

test("CSV parsing rejects structurally malformed quoting and line endings", () => {
  const row = (label) =>
    `2026-06,synth_service,synth_on_time_percent,${label},96.2,percent,minimum,95,,1`;

  // Unterminated quoted field.
  assert.throws(() => parseMetricsCsv(csv(row('"SYNTH On-time percent'))), {
    code: "CSV_MALFORMED",
  });
  // Bare quote inside an unquoted field.
  assert.throws(() => parseMetricsCsv(csv(row('SY"NTH'))), { code: "CSV_MALFORMED" });
  // Trailing characters after a closing quote.
  assert.throws(() => parseMetricsCsv(csv(row('"SYNTH On-time percent"x'))), {
    code: "CSV_MALFORMED",
  });
  // A lone carriage return is not a line terminator.
  assert.throws(() => parseMetricsCsv(`${header}\r\r\n`), { code: "CSV_MALFORMED" });
  // Non-string input is rejected before any parsing.
  for (const input of [null, undefined, 42, Buffer.from(header)]) {
    assert.throws(() => parseMetricsCsv(input), { code: "CSV_INVALID_INPUT" });
  }
  // CRLF line endings and escaped quotes remain accepted.
  const windows = `${header}\r\n${row('"SYNTH On-time percent"')}\r\n`;
  assert.equal(parseMetricsCsv(windows).length, 1);
});

test("control characters smuggled inside quoted fields are privacy-rejected", () => {
  const row = (label) =>
    `2026-06,synth_service,synth_on_time_percent,${label},96.2,percent,minimum,95,,1`;

  assert.throws(() => parseMetricsCsv(csv(row('"SYNTH\nOn-time"'))), {
    code: "PRIVACY_DIRECT_IDENTIFIER",
  });
  assert.throws(() => parseMetricsCsv(csv(row('"SYNTH\u0000On-time"'))), {
    code: "PRIVACY_DIRECT_IDENTIFIER",
  });
});

test("SafeInputError sanitizes untrusted codes, fields, and row numbers", () => {
  const hostile = new SafeInputError("inject: $(rm -rf /)", ["metric_label", "EVIL\nfield"], 0);
  assert.equal(hostile.code, "SAFE_INPUT_ERROR");
  assert.deepEqual(hostile.fieldNames, ["input", "metric_label"]);
  assert.equal(hostile.rowNumber, null);
  assert.equal(hostile.message, "SAFE_INPUT_ERROR; fields=input,metric_label");

  // Non-positive and non-integer row numbers are dropped, not echoed.
  for (const row of [0, -3, 3.5, Number.NaN, "7"]) {
    assert.equal(new SafeInputError("SCHEMA_X", [], row).rowNumber, null);
  }
  assert.equal(new SafeInputError("SCHEMA_X", [], 7).message, "SCHEMA_X; row=7");
});

test("raw and canonical privacy scans report the same CSV row number", () => {
  const canonical = {
    period: "2026-06",
    pillarId: "synth_service",
    metricId: "synth_on_time_percent",
    metricLabel: "user@example.com",
    value: 96.2,
    unit: "percent",
    targetType: null,
    targetMin: null,
    targetMax: null,
    warningMargin: 0,
  };

  // Both scans describe CSV rows: the first data row after the header is row 2.
  assert.throws(() => assertPublicSafe([canonical]), {
    code: "PRIVACY_DIRECT_IDENTIFIER",
    rowNumber: 2,
  });
  assert.throws(
    () => assertPublicSafe([{ ...canonical, metricLabel: "SYNTH On-time percent" }, canonical]),
    { code: "PRIVACY_DIRECT_IDENTIFIER", rowNumber: 3 },
  );
});

test("CSV rejects a dataset with zero observation rows at the parse boundary", () => {
  assert.throws(() => parseMetricsCsv(`${header}\n`), {
    code: "SCHEMA_EMPTY_INPUT",
    message: "SCHEMA_EMPTY_INPUT; fields=input",
  });
  assert.throws(() => parseMetricsCsv(header), { code: "SCHEMA_EMPTY_INPUT" });
});

test("CSV schema rejects unknown, reordered, and duplicate headers", () => {
  const row = "2026-06,synth_service,synth_on_time_percent,SYNTH On-time percent,96.2,percent,minimum,95,,1";

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
  const first = "2026-06,synth_service,synth_on_time_percent,SYNTH On-time percent,96.2,percent,minimum,95,,1";

  assert.throws(() => parseMetricsCsv(csv(first, first)), {
    code: "SCHEMA_DUPLICATE_OBSERVATION",
  });
  assert.throws(
    () =>
      parseMetricsCsv(
        csv(
          first,
          "2026-07,synth_service,synth_on_time_percent,SYNTH On-time percent,95.1,percent,minimum,94,,1",
        ),
      ),
    { code: "SCHEMA_UNSTABLE_METRIC" },
  );
});

test("CSV rejects more than 60 distinct monthly periods", () => {
  const rows = Array.from({ length: 61 }, (_, index) => {
    const monthIndex = 5 + index;
    const year = 2021 + Math.floor(monthIndex / 12);
    const month = String((monthIndex % 12) + 1).padStart(2, "0");
    return `${year}-${month},synth_service,synth_on_time_percent,SYNTH On-time percent,96.2,percent,minimum,95,,1`;
  });

  assert.throws(() => parseMetricsCsv(csv(...rows)), {
    code: "SCHEMA_INPUT_SCOPE_EXCEEDED",
  });
});

test("CSV rejects boundary years that cannot produce four-digit derived periods", () => {
  for (const period of ["0000-01", "9999-12"]) {
    assert.throws(
      () =>
        parseMetricsCsv(
          csv(`${period},synth_service,synth_on_time_percent,SYNTH On-time percent,96.2,percent,minimum,95,,1`),
        ),
      { code: "SCHEMA_INVALID_PERIOD" },
    );
  }
});

test("CSV rejects malformed target definitions", () => {
  assert.throws(
    () =>
      parseMetricsCsv(
        csv("2026-06,synth_service,synth_on_time_percent,SYNTH On-time percent,96.2,percent,minimum,,,1"),
      ),
    { code: "SCHEMA_INVALID_TARGET" },
  );
  assert.throws(
    () =>
      parseMetricsCsv(
        csv("2026-06,synth_service,synth_on_time_percent,SYNTH On-time percent,96.2,percent,range,98,95,1"),
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

test("policy rejects duplicate JSON members at every object depth", () => {
  assert.throws(
    () => parsePolicyJson('{"projectionWindow":6,"projectionWindow":7}'),
    { code: "SCHEMA_DUPLICATE_JSON_MEMBER" },
  );
  assert.throws(
    () =>
      parsePolicyJson(
        '{"candidateAssociations":[{"sourceMetricId":"volume","sourceMetric\\u0049d":"packages","outcomeMetricId":"on_time","lagMonths":1,"minimumObservations":6}]}',
      ),
    { code: "SCHEMA_DUPLICATE_JSON_MEMBER" },
  );
});

test("CSV accepts only canonical decimal number tokens", () => {
  for (const token of ["0x10", "0b10", "01", "+1", "Infinity"]) {
    assert.throws(
      () =>
        parseMetricsCsv(
          csv(`2026-06,synth_service,synth_on_time_percent,SYNTH On-time percent,${token},percent,minimum,95,,1`),
        ),
      { code: "SCHEMA_INVALID_NUMBER" },
    );
  }
});

test("closed metric catalog rejects arbitrary identities and definition changes without echo", () => {
  const rejectedRows = [
    "2026-06,synth_service,john_smith,SYNTH On-time percent,96.2,percent,minimum,95,,1",
    "2026-06,denver_station,synth_on_time_percent,SYNTH On-time percent,96.2,percent,minimum,95,,1",
    "2026-06,synth_service,fxg123,SYNTH On-time percent,96.2,percent,minimum,95,,1",
    "2026-06,synth_service,synth_on_time_percent,Denver Station,96.2,percent,minimum,95,,1",
    "2026-06,synth_service,synth_on_time_percent,SYNTH On-time percent,96.2,hours,minimum,95,,1",
  ];

  for (const rejectedRow of rejectedRows) {
    assert.throws(() => parseMetricsCsv(csv(rejectedRow)), (error) => {
      assert.equal(error.code, "PRIVACY_UNAPPROVED_DEFINITION");
      assert.doesNotMatch(error.message, /john_smith|denver_station|fxg123|Denver Station/);
      return true;
    });
  }
});

test("raw tracking-shaped numeric tokens are privacy-rejected before numeric conversion", () => {
  for (const token of ["123456789012", "9007199254740992", "9007199254740993"]) {
    assert.throws(
      () =>
        parseMetricsCsv(
          csv(
            `2026-06,synth_service,synth_on_time_percent,SYNTH On-time percent,${token},percent,minimum,95,,1`,
          ),
        ),
      (error) => {
        assert.equal(error.code, "PRIVACY_DIRECT_IDENTIFIER");
        assert.doesNotMatch(error.message, new RegExp(token));
        return true;
      },
    );
  }
});

test("numeric domain rejects overflow-scale, sub-resolution, and precision-collapse tokens", () => {
  for (const token of ["1e308", "-1e308", "1e-13", "1.234567890123456"]) {
    assert.throws(
      () =>
        parseMetricsCsv(
          csv(
            `2026-06,synth_service,synth_on_time_percent,SYNTH On-time percent,${token},percent,minimum,95,,1`,
          ),
        ),
      { code: "SCHEMA_INVALID_NUMBER" },
    );
  }
});

test("policy requires at least three recurrences and a feasible lagged evidence window", () => {
  assert.throws(() => parsePolicyJson('{"minimumRecurrences":2}'), {
    code: "SCHEMA_INVALID_POLICY_VALUE",
  });
  assert.throws(
    () =>
      parsePolicyJson(
        JSON.stringify({
          candidateAssociations: [
            {
              sourceMetricId: "synth_late_inbound_count",
              outcomeMetricId: "synth_on_time_percent",
              lagMonths: 12,
              minimumObservations: 49,
            },
          ],
        }),
      ),
    { code: "SCHEMA_INVALID_POLICY_VALUE" },
  );
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

test("attacker-controlled field names are replaced by a generic marker", () => {
  const recordField = "employee_tracking_number";
  const policyField = "customer_email_address";
  const row = { ...parseMetricsCsv(valid)[0], [recordField]: "SYNTH-UNSAFE-999" };

  assert.throws(() => assertPublicSafe([row]), (error) => {
    assert.equal(error.code, "PRIVACY_FORBIDDEN_FIELD");
    assert.deepEqual(error.fieldNames, ["input"]);
    assert.doesNotMatch(error.message, /employee_tracking_number/);
    return true;
  });
  assert.throws(
    () => parsePolicyJson(`{"${policyField}":"SYNTH-UNSAFE-999"}`),
    (error) => {
      assert.equal(error.code, "SCHEMA_UNKNOWN_POLICY_FIELD");
      assert.deepEqual(error.fieldNames, ["input"]);
      assert.doesNotMatch(error.message, /customer_email_address/);
      return true;
    },
  );
});

test("privacy requires complete canonical records with canonical types", () => {
  const missingMetric = { ...parseMetricsCsv(valid)[0] };
  delete missingMetric.metricId;

  assert.throws(() => assertPublicSafe([missingMetric]), {
    code: "PRIVACY_INVALID_RECORD",
  });
  assert.throws(
    () => assertPublicSafe([{ ...parseMetricsCsv(valid)[0], value: "96.2" }]),
    { code: "PRIVACY_INVALID_RECORD" },
  );
});

test("privacy rejects canonical-record numeric fields outside the safe domain", () => {
  const observation = parseMetricsCsv(valid)[0];

  assert.throws(
    () => assertPublicSafe([{ ...observation, targetMin: 1e308 }]),
    { code: "PRIVACY_INVALID_RECORD" },
  );
});

test("privacy scans malformed periods for direct identifiers without echo", () => {
  const rejected = "synth@example.invalid";

  assert.throws(
    () => assertPublicSafe([{ ...parseMetricsCsv(valid)[0], period: rejected }]),
    (error) => {
      assert.equal(error.code, "PRIVACY_DIRECT_IDENTIFIER");
      assert.doesNotMatch(error.message, /synth@example\.invalid/);
      return true;
    },
  );
});

test("CSV parsing rejects address-shaped controlled labels at the boundary", () => {
  const rejected = "123 Main Street";

  assert.throws(
    () =>
      parseMetricsCsv(
        csv(`2026-06,synth_service,synth_on_time_percent,${rejected},96.2,percent,minimum,95,,1`),
      ),
    (error) => {
      assert.equal(error.code, "PRIVACY_DIRECT_IDENTIFIER");
      assert.doesNotMatch(error.message, /123 Main Street/);
      return true;
    },
  );
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
