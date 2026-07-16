import assert from "node:assert/strict";
import {
  access,
  mkdtemp,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { run } from "../src/cli.mjs";

const FIXTURE = new URL("../fixtures/synthetic-input.json", import.meta.url);

async function sandbox() {
  return mkdtemp(join(tmpdir(), "decision-lab-"));
}

function capture() {
  const stdout = [];
  const stderr = [];
  return {
    stdout,
    stderr,
    io: {
      stdout: (line) => stdout.push(line),
      stderr: (line) => stderr.push(line),
    },
  };
}

function argv(inputPath, outputPath, classification = "synthetic") {
  return [
    "--input",
    inputPath,
    "--output-dir",
    outputPath,
    "--data-classification",
    classification,
  ];
}

test("CLI rejects closed-argv violations before file I/O", async () => {
  for (const args of [
    [],
    ["positional"],
    ["--unknown", "x", "--input", "y"],
    ["--input", "a", "--input", "b", "--output-dir", "c", "--data-classification", "synthetic"],
    ["--input", "a", "--output-dir", "b", "--data-classification", "live"],
  ]) {
    let read = false;
    const captured = capture();
    const code = await run(args, {
      ...captured.io,
      readFile: async () => {
        read = true;
        throw new Error("must not read");
      },
    });
    assert.equal(code, 2);
    assert.equal(read, false);
    assert.deepEqual(captured.stderr, ["ERROR CLI_USAGE: arguments"]);
  }
});

test("CLI atomically publishes exactly two private artifacts", async (context) => {
  const root = await sandbox();
  context.after(() => rm(root, { recursive: true, force: true }));
  const inputPath = new URL(FIXTURE).pathname;
  const outputPath = join(root, "result");
  const captured = capture();

  assert.equal(await run(argv(inputPath, outputPath), captured.io), 0);
  const names = (await (await import("node:fs/promises")).readdir(outputPath)).sort();
  assert.deepEqual(names, ["analysis.json", "brief.md"]);
  assert.match(await readFile(join(outputPath, "analysis.json"), "utf8"), /"winner": null/);
  assert.match(await readFile(join(outputPath, "brief.md"), "utf8"), /Forecast Evidence/);
  assert.equal((await stat(outputPath)).mode & 0o777, 0o700);
  assert.equal((await stat(join(outputPath, "analysis.json"))).mode & 0o777, 0o600);
  assert.equal((await stat(join(outputPath, "brief.md"))).mode & 0o777, 0o600);
  assert.deepEqual(captured.stdout, ["OK operations-decision-analysis: synthetic output written"]);
  assert.deepEqual(captured.stderr, []);
  await assert.rejects(access(`${outputPath}.lock`));
  await assert.rejects(access(`${outputPath}.tmp`));
});

test("existing output, temp, and lock are never overwritten or deleted", async (context) => {
  const root = await sandbox();
  context.after(() => rm(root, { recursive: true, force: true }));
  const inputPath = new URL(FIXTURE).pathname;

  for (const suffix of ["", ".tmp", ".lock"]) {
    const outputPath = join(root, `case-${suffix.length}`);
    const blocker = `${outputPath}${suffix}`;
    await mkdir(dirname(blocker), { recursive: true });
    await writeFile(blocker, "KEEP", "utf8");
    const captured = capture();
    assert.equal(await run(argv(inputPath, outputPath), captured.io), 6);
    assert.equal(await readFile(blocker, "utf8"), "KEEP");
    assert.doesNotMatch(captured.stderr.join("\n"), new RegExp(root));
  }
});

test("privacy failures return exit 4 without rejected-value or path echo", async (context) => {
  const root = await sandbox();
  context.after(() => rm(root, { recursive: true, force: true }));
  const unsafePath = join(root, "unsafe.json");
  const input = JSON.parse(await readFile(FIXTURE, "utf8"));
  input.notes = "REJECTED PERSON";
  await writeFile(unsafePath, JSON.stringify(input), "utf8");
  const captured = capture();

  assert.equal(await run(argv(unsafePath, join(root, "result")), captured.io), 4);
  assert.doesNotMatch(captured.stderr.join("\n"), /REJECTED PERSON|unsafe\.json/);
  assert.deepEqual(captured.stdout, []);
});

test("owned temp and lock clean up after a coordinated publication failure", async () => {
  const root = await sandbox();
  const outputPath = join(root, "result");
  const captured = capture();
  let writes = 0;
  const code = await run(argv(new URL(FIXTURE).pathname, outputPath), {
    ...captured.io,
    writeFile: async (...args) => {
      writes += 1;
      if (writes === 2) throw new Error("second write fails");
      return writeFile(...args);
    },
  });

  assert.equal(code, 6);
  await assert.rejects(access(outputPath));
  await assert.rejects(access(`${outputPath}.tmp`));
  await assert.rejects(access(`${outputPath}.lock`));
  await rm(root, { recursive: true, force: true });
});

test("runtime source remains offline, advisory, clockless, and model-free", async () => {
  const sourceFiles = ["analyze.mjs", "backtest.mjs", "cli.mjs", "feasibility.mjs", "forecast.mjs", "plan.mjs", "render.mjs", "schema.mjs"];
  const source = (
    await Promise.all(
      sourceFiles.map((name) => readFile(new URL(`../src/${name}`, import.meta.url), "utf8")),
    )
  ).join("\n");
  assert.doesNotMatch(
    source,
    /node:(?:http|https|net|tls|dgram|dns|child_process)|\bfetch\s*\(|\bWebSocket\b|process\.env|Date\.now|Math\.random|openai|anthropic/i,
  );
});
