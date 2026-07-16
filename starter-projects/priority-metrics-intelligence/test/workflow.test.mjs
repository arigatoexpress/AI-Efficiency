import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { analyzeMetrics } from "../src/analyze.mjs";
import { run } from "../src/cli.mjs";
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

test("missing-current lineage closure zero-pads a lower-boundary period", () => {
  const records = parseMetricsCsv(
    [
      "period,pillar_id,metric_id,metric_label,value,unit,target_type,target_min,target_max,warning_margin",
      "0001-01,synth_service,synth_on_time_percent,SYNTH On-time percent,90,percent,minimum,95,,0",
      "0001-01,synth_flow,synth_late_inbound_count,SYNTH Late inbound count,1,count,,,,",
      "0001-02,synth_flow,synth_late_inbound_count,SYNTH Late inbound count,2,count,,,,",
    ].join("\n"),
  );
  const result = analyzeMetrics({
    records,
    policy: parsePolicyJson("{}"),
    analyzerVersion: "0.1.0",
  });

  assert.deepEqual(result.riskLineages[0].events, [
    { period: "0001-02", classification: "gap", severity: null },
  ]);
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

test("canonical evidence preserves the closed semantic metric definitions", async () => {
  const result = await analyzeFixture();

  assert.deepEqual(result.inputSummary.metricDefinitions, [
    {
      metricId: "synth_damage_percent",
      metricLabel: "SYNTH Damage percent",
      pillarId: "synth_quality",
      unit: "percent",
      semanticDefinition: {
        denominator: "packages_handled",
        kind: "rate",
        numerator: "damaged_packages",
        timeBasis: "monthly_aggregate",
      },
    },
    {
      metricId: "synth_late_inbound_count",
      metricLabel: "SYNTH Late inbound count",
      pillarId: "synth_flow",
      unit: "count",
      semanticDefinition: {
        kind: "measure",
        measure: "late_inbound_packages",
        timeBasis: "monthly_aggregate",
      },
    },
    {
      metricId: "synth_on_time_percent",
      metricLabel: "SYNTH On-time percent",
      pillarId: "synth_service",
      unit: "percent",
      semanticDefinition: {
        denominator: "eligible_packages",
        kind: "rate",
        numerator: "packages_delivered_on_time",
        timeBasis: "monthly_aggregate",
      },
    },
  ]);
});

test("recursively sorts keys and normalizes finite numbers to 15 significant digits", () => {
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
      '  "z": 0.1234567890126',
      "}",
      "",
    ].join("\n"),
  );
});

test("canonical normalization preserves accepted inputs and nonzero risk evidence", () => {
  const value = 1;
  const target = 1.0000000000001;
  const distance = value - target;
  const normalized = JSON.parse(
    stableJson({ distance, status: "at_risk", target, value }),
  );

  assert.equal(normalized.target, target);
  assert.ok(normalized.distance < 0);
  assert.notEqual(normalized.distance, 0);
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
    result.inputSummary.metricDefinitions,
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
    "49fd103e3839fd4a6942bd901fab22adc4123bf15fd9c4db6313b9a011e30d67",
  );
  assert.ok(markdown.endsWith("\n"));
});

test("is byte-deterministic across identical runs and input order", async () => {
  const first = await analyzeFixture();
  const second = await analyzeFixture((records) => [...records].reverse());

  assert.equal(stableJson(first), stableJson(second));
  assert.equal(renderMarkdown(first), renderMarkdown(second));
});

async function workspace(t, name) {
  const directory = await mkdtemp(join(tmpdir(), `priority-metrics-${name}-`));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

function cliHarness(overrides = {}) {
  const stdout = [];
  const stderr = [];
  return {
    stdout,
    stderr,
    io: {
      readFile,
      writeFile,
      rename,
      rm,
      stdout: (line) => stdout.push(line),
      stderr: (line) => stderr.push(line),
      ...overrides,
    },
  };
}

function validArgs(outputDirectory, extra = []) {
  return [
    "--input",
    new URL("../fixtures/synthetic-monthly-metrics.csv", import.meta.url).pathname,
    "--policy",
    new URL("../fixtures/synthetic-policy.json", import.meta.url).pathname,
    "--output-dir",
    outputDirectory,
    "--data-classification",
    "synthetic",
    ...extra,
  ];
}

test("runs the complete workflow and atomically publishes exactly both artifacts", async (t) => {
  const directory = await workspace(t, "valid");
  const outputDirectory = join(directory, "nested", "analysis");
  const events = [];
  const harness = cliHarness({
    writeFile: async (path, contents, options) => {
      assert.equal(await readFile(`${outputDirectory}.lock`, "utf8"), "");
      events.push(`write:${basename(path)}`);
      await writeFile(path, contents, options);
    },
    rename: async (source, destination) => {
      events.push(`rename:${basename(source)}:${basename(destination)}`);
      await rename(source, destination);
    },
  });

  const code = await run(validArgs(outputDirectory), harness.io);

  assert.equal(code, 0);
  assert.deepEqual(harness.stderr, []);
  assert.match(harness.stdout.join("\n"), /^OK priority-metrics-analysis:/);
  assert.deepEqual((await readdir(outputDirectory)).sort(), ["analysis.json", "brief.md"]);
  assert.equal(
    await readFile(join(outputDirectory, "analysis.json"), "utf8"),
    await fixture("expected-analysis.json"),
  );
  assert.match(await readFile(join(outputDirectory, "brief.md"), "utf8"),
    /^# Priority Metrics Brief\n/,
  );
  assert.deepEqual(events, [
    "write:analysis.json",
    "write:brief.md",
    "rename:analysis.tmp:analysis",
  ]);
  await assert.rejects(readFile(`${outputDirectory}.tmp`, "utf8"), { code: "ENOENT" });
  await assert.rejects(readFile(`${outputDirectory}.lock`, "utf8"), { code: "ENOENT" });
});

test("rejects unknown, positional, duplicate, missing, and invalid arguments before I/O", async () => {
  const rejectedValue = "SYNTH-REJECTED-ARGV-998877";
  const cases = [
    [],
    ["--unknown", rejectedValue],
    [rejectedValue],
    ["--input", rejectedValue, "--input", "other"],
    ["--input"],
    [
      "--input",
      "--policy",
      "--output-dir",
      "output",
      "--data-classification",
      "synthetic",
    ],
    [
      "--input",
      rejectedValue,
      "--output-dir",
      "output",
      "--data-classification",
      rejectedValue,
    ],
  ];

  for (const args of cases) {
    let reads = 0;
    const harness = cliHarness({
      readFile: async () => {
        reads += 1;
        throw new Error("must not read");
      },
    });

    assert.equal(await run(args, harness.io), 2);
    assert.deepEqual(harness.stdout, []);
    assert.deepEqual(harness.stderr, ["ERROR CLI_USAGE: arguments"]);
    assert.doesNotMatch(harness.stderr.join("\n"), /SYNTH-REJECTED-ARGV-998877/);
    assert.equal(reads, 0);
  }
});

test("uses stable schema, privacy, invariant, and file-I/O exit codes without echo", async (t) => {
  const directory = await workspace(t, "exit-codes");
  const input = join(directory, "metrics.csv");
  const output = join(directory, "output");
  const secret = "SYNTH-REJECTED-SECRET-998877";
  const header =
    "period,pillar_id,metric_id,metric_label,value,unit,target_type,target_min,target_max,warning_margin";
  const args = (inputPath = input) => [
    "--input",
    inputPath,
    "--output-dir",
    output,
    "--data-classification",
    "scrubbed",
  ];

  const cases = [
    {
      expectedCode: 3,
      expectedError: "ERROR SCHEMA_INVALID_CSV_HEADER: none",
      contents: `${secret}\n`,
    },
    {
      expectedCode: 3,
      expectedError: "ERROR SCHEMA_INVALID_LABEL: metric_label",
      contents: `${header}\n2026-06,synth_service,synth_on_time_percent,Bad?label,96.2,percent,minimum,95,,1\n`,
    },
    {
      expectedCode: 4,
      expectedError: "ERROR PRIVACY_DIRECT_IDENTIFIER: metric_label",
      contents: `${header}\n2026-06,synth_service,synth_on_time_percent,123 Secret Street,96.2,percent,minimum,95,,1\n`,
    },
    {
      expectedCode: 5,
      expectedError: "ERROR ANALYSIS_INVARIANT: analysis",
      contents: `${header}\n`,
    },
  ];

  for (const scenario of cases) {
    await writeFile(input, scenario.contents, "utf8");
    const harness = cliHarness();
    assert.equal(await run(args(), harness.io), scenario.expectedCode);
    assert.deepEqual(harness.stdout, []);
    assert.deepEqual(harness.stderr, [scenario.expectedError]);
    assert.doesNotMatch(harness.stderr.join("\n"), /SYNTH-REJECTED|123 Secret Street/);
    await assert.rejects(readdir(output), { code: "ENOENT" });
  }

  const missingInput = join(directory, `${secret}.csv`);
  const harness = cliHarness();
  assert.equal(await run(args(missingInput), harness.io), 6);
  assert.deepEqual(harness.stdout, []);
  assert.deepEqual(harness.stderr, ["ERROR FILE_READ: input"]);
  assert.doesNotMatch(harness.stderr.join("\n"), /SYNTH-REJECTED-SECRET-998877/);
  await assert.rejects(readdir(output), { code: "ENOENT" });
});

test("CLI privacy failures for names, facilities, emails, and tracking shapes publish nothing and echo nothing", async (t) => {
  const directory = await workspace(t, "privacy-catalog");
  const input = join(directory, "metrics.csv");
  const header =
    "period,pillar_id,metric_id,metric_label,value,unit,target_type,target_min,target_max,warning_margin";
  const cases = [
    "2026-06,synth_service,john_smith,SYNTH On-time percent,96.2,percent,minimum,95,,1",
    "2026-06,denver_station,synth_on_time_percent,SYNTH On-time percent,96.2,percent,minimum,95,,1",
    "2026-06,synth_service,synth_on_time_percent,manager@example.invalid,96.2,percent,minimum,95,,1",
    "2026-06,synth_service,synth_on_time_percent,SYNTH On-time percent,9007199254740993,percent,minimum,95,,1",
  ];

  for (const [index, row] of cases.entries()) {
    const output = join(directory, `output-${index}`);
    await writeFile(input, `${header}\n${row}\n`, "utf8");
    const harness = cliHarness();
    const code = await run(
      [
        "--input",
        input,
        "--output-dir",
        output,
        "--data-classification",
        "scrubbed",
      ],
      harness.io,
    );

    assert.equal(code, 4);
    assert.deepEqual(harness.stdout, []);
    assert.doesNotMatch(
      harness.stderr.join("\n"),
      /john_smith|denver_station|manager@example\.invalid|9007199254740993/,
    );
    await assert.rejects(readdir(output), { code: "ENOENT" });
  }
});

test("CLI rejects configured metric references absent from observations before publication", async (t) => {
  const directory = await workspace(t, "missing-policy-metric");
  const output = join(directory, "output");
  const policy = join(directory, "policy.json");
  await writeFile(
    policy,
    JSON.stringify({
      candidateAssociations: [
        {
          sourceMetricId: "synth_late_inbound_count",
          outcomeMetricId: "synth_on_time_percent",
          lagMonths: 1,
          minimumObservations: 6,
        },
      ],
    }),
    "utf8",
  );
  const harness = cliHarness();
  const code = await run(
    [
      "--input",
      new URL("../fixtures/synthetic-monthly-metrics.csv", import.meta.url).pathname,
      "--policy",
      policy,
      "--output-dir",
      output,
      "--data-classification",
      "synthetic",
    ],
    {
      ...harness.io,
      readFile: async (path, options) => {
        const contents = await readFile(path, options);
        if (String(path).endsWith("synthetic-monthly-metrics.csv")) {
          return contents
            .split("\n")
            .filter((line) => !line.includes("synth_late_inbound_count"))
            .join("\n");
        }
        return contents;
      },
    },
  );

  assert.equal(code, 3);
  assert.deepEqual(harness.stdout, []);
  assert.deepEqual(harness.stderr, ["ERROR SCHEMA_UNKNOWN_METRIC_REFERENCE: metricId"]);
  await assert.rejects(readdir(output), { code: "ENOENT" });
});

test("rejects an existing output directory without changing it", async (t) => {
  const directory = await workspace(t, "existing-output");
  const outputDirectory = join(directory, "analysis");
  await mkdir(outputDirectory);
  await writeFile(join(outputDirectory, "sentinel.txt"), "keep", "utf8");
  let renames = 0;
  const harness = cliHarness({
    rename: async () => {
      renames += 1;
    },
  });

  assert.equal(await run(validArgs(outputDirectory), harness.io), 6);
  assert.deepEqual(harness.stdout, []);
  assert.deepEqual(harness.stderr, ["ERROR OUTPUT_EXISTS: output-dir"]);
  assert.deepEqual((await readdir(outputDirectory)).sort(), ["sentinel.txt"]);
  assert.equal(await readFile(join(outputDirectory, "sentinel.txt"), "utf8"), "keep");
  assert.equal(renames, 0);
  await assert.rejects(readdir(`${outputDirectory}.tmp`), { code: "ENOENT" });
  await assert.rejects(readFile(`${outputDirectory}.lock`, "utf8"), { code: "ENOENT" });
});

test("a pre-existing sibling lock blocks publication and remains untouched", async (t) => {
  const directory = await workspace(t, "lock-collision");
  const outputDirectory = join(directory, "analysis");
  const lockPath = `${outputDirectory}.lock`;
  await writeFile(lockPath, "stale-owner", "utf8");
  let renames = 0;
  const harness = cliHarness({
    rename: async () => {
      renames += 1;
    },
  });

  assert.equal(await run(validArgs(outputDirectory), harness.io), 6);
  assert.deepEqual(harness.stdout, []);
  assert.deepEqual(harness.stderr, ["ERROR OUTPUT_LOCKED: output-dir"]);
  assert.equal(await readFile(lockPath, "utf8"), "stale-owner");
  assert.equal(renames, 0);
  await assert.rejects(readdir(outputDirectory), { code: "ENOENT" });
  await assert.rejects(readdir(`${outputDirectory}.tmp`), { code: "ENOENT" });
});

test("rechecks the destination under lock immediately before rename", async (t) => {
  const directory = await workspace(t, "late-destination");
  const outputDirectory = join(directory, "analysis");
  let writes = 0;
  let renames = 0;
  const harness = cliHarness({
    writeFile: async (path, contents, options) => {
      writes += 1;
      await writeFile(path, contents, options);
      if (writes === 2) {
        assert.equal(await readFile(`${outputDirectory}.lock`, "utf8"), "");
        await mkdir(outputDirectory);
        await writeFile(join(outputDirectory, "sentinel.txt"), "preserve", "utf8");
      }
    },
    rename: async () => {
      renames += 1;
    },
  });

  assert.equal(await run(validArgs(outputDirectory), harness.io), 6);
  assert.deepEqual(harness.stdout, []);
  assert.deepEqual(harness.stderr, ["ERROR OUTPUT_EXISTS: output-dir"]);
  assert.equal(renames, 0);
  assert.deepEqual((await readdir(outputDirectory)).sort(), ["sentinel.txt"]);
  assert.equal(await readFile(join(outputDirectory, "sentinel.txt"), "utf8"), "preserve");
  await assert.rejects(readdir(`${outputDirectory}.tmp`), { code: "ENOENT" });
  await assert.rejects(readFile(`${outputDirectory}.lock`, "utf8"), { code: "ENOENT" });
});

test("cleans the sibling temporary directory after write and rename failures", async (t) => {
  const directory = await workspace(t, "cleanup");
  const secret = "SYNTH-REJECTED-FS-998877";

  for (const failurePoint of ["write", "rename"]) {
    const outputDirectory = join(directory, failurePoint);
    let writes = 0;
    let renames = 0;
    const harness = cliHarness({
      writeFile: async (path, contents, options) => {
        writes += 1;
        if (writes === 2) {
          assert.equal(await readFile(`${outputDirectory}.lock`, "utf8"), "");
          if (failurePoint === "write") throw new Error(secret);
        }
        await writeFile(path, contents, options);
      },
      rename: async (source, destination) => {
        renames += 1;
        if (failurePoint === "rename") throw new Error(secret);
        await rename(source, destination);
      },
    });

    assert.equal(await run(validArgs(outputDirectory), harness.io), 6);
    assert.deepEqual(harness.stdout, []);
    assert.deepEqual(harness.stderr, ["ERROR FILE_WRITE: output-dir"]);
    assert.doesNotMatch(harness.stderr.join("\n"), /SYNTH-REJECTED-FS-998877/);
    await assert.rejects(readdir(outputDirectory), { code: "ENOENT" });
    await assert.rejects(readdir(`${outputDirectory}.tmp`), { code: "ENOENT" });
    await assert.rejects(readFile(`${outputDirectory}.lock`, "utf8"), { code: "ENOENT" });
    assert.equal(renames, failurePoint === "rename" ? 1 : 0);
  }
});

test("processes the full 60-period catalog history through the CLI", async (t) => {
  const directory = await workspace(t, "smoke");
  const input = join(directory, "metrics.csv");
  const output = join(directory, "analysis");
  const rows = [
    "period,pillar_id,metric_id,metric_label,value,unit,target_type,target_min,target_max,warning_margin",
  ];
  for (let offset = 0; offset < 60; offset += 1) {
    const date = new Date(Date.UTC(2021, offset, 1));
    const period = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    rows.push(
      `${period},synth_flow,synth_late_inbound_count,SYNTH Late inbound count,${offset},count,,,,0`,
    );
  }
  await writeFile(input, `${rows.join("\n")}\n`, "utf8");
  const harness = cliHarness();

  const code = await run([
    "--input",
    input,
    "--output-dir",
    output,
    "--data-classification",
    "synthetic",
  ], harness.io);

  assert.equal(code, 0);
  assert.deepEqual(harness.stderr, []);
  const analysis = JSON.parse(await readFile(join(output, "analysis.json"), "utf8"));
  assert.equal(analysis.inputSummary.observationCount, 60);
  assert.deepEqual((await readdir(output)).sort(), ["analysis.json", "brief.md"]);
  await assert.rejects(readFile(`${output}.lock`, "utf8"), { code: "ENOENT" });
});

test("source remains offline and excludes network and child-process interfaces", async () => {
  const sourceDirectory = new URL("../src/", import.meta.url);
  const files = (await readdir(sourceDirectory)).filter((name) => name.endsWith(".mjs"));
  const source = (
    await Promise.all(files.map((name) => readFile(new URL(name, sourceDirectory), "utf8")))
  ).join("\n");

  assert.doesNotMatch(
    source,
    /\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon|exec|execFile|spawn|fork)\b|\bchild_process\b|node:(?:http|https|net|tls|dgram)|https?:\/\/|\b(?:ollama|openai|anthropic)\b/i,
  );
});
