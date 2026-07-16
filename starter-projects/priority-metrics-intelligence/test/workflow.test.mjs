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
      contents: `${header}\n2026-06,service,on_time,Bad?label,96.2,percent,minimum,95,,1\n`,
    },
    {
      expectedCode: 4,
      expectedError: "ERROR PRIVACY_DIRECT_IDENTIFIER: metricLabel",
      contents: `${header}\n2026-06,service,on_time,123 Secret Street,96.2,percent,minimum,95,,1\n`,
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

test("processes 10,000 valid rows through the CLI without a timing threshold", async (t) => {
  const directory = await workspace(t, "smoke");
  const input = join(directory, "metrics.csv");
  const output = join(directory, "analysis");
  const rows = [
    "period,pillar_id,metric_id,metric_label,value,unit,target_type,target_min,target_max,warning_margin",
  ];
  for (let metric = 0; metric < 100; metric += 1) {
    for (let offset = 0; offset < 100; offset += 1) {
      const date = new Date(Date.UTC(2018, offset, 1));
      const period = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
      rows.push(
        `${period},synthetic,metric_${String(metric).padStart(3, "0")},SYNTH Metric ${metric},${metric + offset},count,,,,0`,
      );
    }
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
  assert.equal(analysis.inputSummary.observationCount, 10_000);
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
