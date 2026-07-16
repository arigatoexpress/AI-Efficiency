import {
  lstat as fsLstat,
  mkdir as fsMkdir,
  open as fsOpen,
  readFile as fsReadFile,
  rename as fsRename,
  rm as fsRm,
  writeFile as fsWriteFile,
} from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { analyzeMetrics } from "./analyze.mjs";
import { SafeInputError } from "./errors.mjs";
import { parseMetricsCsv, parsePolicyJson } from "./parse.mjs";
import { renderMarkdown, stableJson } from "./render.mjs";

const ANALYZER_VERSION = "0.1.0";
const ARGUMENT_FLAGS = new Map([
  ["--input", "input"],
  ["--policy", "policy"],
  ["--output-dir", "outputDirectory"],
  ["--data-classification", "dataClassification"],
]);
const REQUIRED_ARGUMENTS = ["input", "outputDirectory", "dataClassification"];
const DATA_CLASSIFICATIONS = new Set(["synthetic", "scrubbed"]);
const SAFE_ERROR_FIELDS = new Set([
  "analysis",
  "arguments",
  "candidateAssociations",
  "data-classification",
  "input",
  "lagMonths",
  "metricId",
  "metricLabel",
  "metric_id",
  "metric_label",
  "minimumObservations",
  "minimumRecurrences",
  "none",
  "output-dir",
  "period",
  "pillarId",
  "pillar_id",
  "policy",
  "projectionWindow",
  "sourceMetricId",
  "outcomeMetricId",
  "targetMax",
  "targetMin",
  "targetType",
  "target_max",
  "target_min",
  "target_type",
  "unit",
  "value",
  "warningMargin",
  "warning_margin",
]);

function parseArgv(argv) {
  if (!Array.isArray(argv) || argv.length % 2 !== 0) return null;

  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    const key = ARGUMENT_FLAGS.get(flag);
    if (
      key === undefined ||
      Object.hasOwn(values, key) ||
      typeof value !== "string" ||
      value.length === 0 ||
      value.startsWith("--")
    ) {
      return null;
    }
    values[key] = value;
  }

  if (REQUIRED_ARGUMENTS.some((key) => !Object.hasOwn(values, key))) return null;
  if (!DATA_CLASSIFICATIONS.has(values.dataClassification)) return null;
  return values;
}

function emitError(stderr, code, fields) {
  const safeCode = /^[A-Z][A-Z0-9_]*$/.test(code) ? code : "INTERNAL_ERROR";
  const safeFields = [...new Set(fields)]
    .filter((field) => SAFE_ERROR_FIELDS.has(field))
    .sort();
  stderr(`ERROR ${safeCode}: ${safeFields.length > 0 ? safeFields.join(",") : "none"}`);
}

function isPrivacyError(error) {
  return error instanceof SafeInputError && error.code.startsWith("PRIVACY_");
}

function assertAnalysisInvariant(records, analysis, json, markdown) {
  if (
    records.length === 0 ||
    analysis === null ||
    typeof analysis !== "object" ||
    typeof analysis.inputSummary?.analysisPeriod !== "string" ||
    analysis.inputSummary.observationCount !== records.length ||
    typeof json !== "string" ||
    !json.endsWith("\n") ||
    typeof markdown !== "string" ||
    !markdown.endsWith("\n")
  ) {
    throw new Error("analysis invariant");
  }
}

function runtimeIo(io) {
  return {
    readFile: io.readFile ?? fsReadFile,
    writeFile: io.writeFile ?? fsWriteFile,
    rename: io.rename ?? fsRename,
    rm: io.rm ?? fsRm,
    mkdir: io.mkdir ?? fsMkdir,
    lstat: io.lstat ?? fsLstat,
    open: io.open ?? fsOpen,
    stdout: io.stdout ?? ((line) => process.stdout.write(`${line}\n`)),
    stderr: io.stderr ?? ((line) => process.stderr.write(`${line}\n`)),
  };
}

async function outputExists(path, lstat) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

export async function run(argv, io = {}) {
  const parsed = parseArgv(argv);
  const runtime = runtimeIo(io);
  if (parsed === null) {
    emitError(runtime.stderr, "CLI_USAGE", ["arguments"]);
    return 2;
  }

  let inputText;
  try {
    inputText = await runtime.readFile(parsed.input, "utf8");
  } catch {
    emitError(runtime.stderr, "FILE_READ", ["input"]);
    return 6;
  }

  let policyText = "{}";
  if (parsed.policy !== undefined) {
    try {
      policyText = await runtime.readFile(parsed.policy, "utf8");
    } catch {
      emitError(runtime.stderr, "FILE_READ", ["policy"]);
      return 6;
    }
  }

  let records;
  let policy;
  try {
    records = parseMetricsCsv(inputText);
    policy = parsePolicyJson(policyText);
  } catch (error) {
    if (error instanceof SafeInputError) {
      emitError(runtime.stderr, error.code, error.fieldNames);
      return isPrivacyError(error) ? 4 : 3;
    }
    emitError(runtime.stderr, "ANALYSIS_INVARIANT", ["analysis"]);
    return 5;
  }

  let analysisJson;
  let briefMarkdown;
  try {
    const analysis = analyzeMetrics({
      records,
      policy,
      analyzerVersion: ANALYZER_VERSION,
      dataClassification: parsed.dataClassification,
    });
    analysisJson = stableJson(analysis);
    briefMarkdown = renderMarkdown(analysis);
    assertAnalysisInvariant(records, analysis, analysisJson, briefMarkdown);
  } catch {
    emitError(runtime.stderr, "ANALYSIS_INVARIANT", ["analysis"]);
    return 5;
  }

  const outputDirectory = resolve(parsed.outputDirectory);
  const temporaryDirectory = `${outputDirectory}.tmp`;
  const lockPath = `${outputDirectory}.lock`;
  let lockHandle;
  try {
    await runtime.mkdir(dirname(outputDirectory), { recursive: true });
    lockHandle = await runtime.open(lockPath, "wx");
  } catch (error) {
    emitError(
      runtime.stderr,
      error?.code === "EEXIST" ? "OUTPUT_LOCKED" : "FILE_WRITE",
      ["output-dir"],
    );
    return 6;
  }

  let temporaryCreated = false;
  let publicationError = null;
  try {
    if (await outputExists(outputDirectory, runtime.lstat)) {
      publicationError = "OUTPUT_EXISTS";
    } else {
      await runtime.mkdir(temporaryDirectory, { recursive: false });
      temporaryCreated = true;
      await runtime.writeFile(join(temporaryDirectory, "analysis.json"), analysisJson, "utf8");
      await runtime.writeFile(join(temporaryDirectory, "brief.md"), briefMarkdown, "utf8");
      if (await outputExists(outputDirectory, runtime.lstat)) {
        publicationError = "OUTPUT_EXISTS";
      } else {
        await runtime.rename(temporaryDirectory, outputDirectory);
        temporaryCreated = false;
      }
    }
  } catch {
    publicationError = "FILE_WRITE";
  } finally {
    if (temporaryCreated) {
      try {
        await runtime.rm(temporaryDirectory, { recursive: true, force: true });
      } catch {
        publicationError = "FILE_WRITE";
      }
    }
    try {
      await lockHandle.close();
    } catch {
      publicationError = "FILE_WRITE";
    }
    try {
      await runtime.rm(lockPath, { force: true });
    } catch {
      publicationError = "FILE_WRITE";
    }
  }

  if (publicationError !== null) {
    emitError(runtime.stderr, publicationError, ["output-dir"]);
    return 6;
  }

  runtime.stdout(
    `OK priority-metrics-analysis: ${parsed.dataClassification} output written`,
  );
  return 0;
}

const invokedPath = process.argv[1] === undefined ? null : resolve(process.argv[1]);
if (invokedPath === fileURLToPath(import.meta.url)) {
  process.exitCode = await run(process.argv.slice(2));
}
