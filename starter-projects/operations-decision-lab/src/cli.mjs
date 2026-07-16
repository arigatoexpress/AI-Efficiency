import {
  lstat as fsLstat,
  mkdir as fsMkdir,
  open as fsOpen,
  readFile as fsReadFile,
  rename as fsRename,
  rm as fsRm,
  writeFile as fsWriteFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeDecisionLab } from "./analyze.mjs";
import { SafeInputError } from "./errors.mjs";
import { renderMarkdown, stableJson } from "./render.mjs";
import { parseInputJson } from "./schema.mjs";

const ANALYZER_VERSION = "0.1.0";
const MAX_INPUT_BYTES = 4 * 1024 * 1024;
const FLAGS = new Map([
  ["--input", "input"],
  ["--output-dir", "outputDirectory"],
  ["--data-classification", "dataClassification"],
]);
const REQUIRED = ["input", "outputDirectory", "dataClassification"];
const CLASSIFICATIONS = new Set(["synthetic", "scrubbed"]);

function parseArgv(argv) {
  if (!Array.isArray(argv) || argv.length % 2 !== 0) return null;
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    const key = FLAGS.get(flag);
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
  if (REQUIRED.some((key) => !Object.hasOwn(values, key))) return null;
  if (!CLASSIFICATIONS.has(values.dataClassification)) return null;
  return values;
}

function runtimeIo(io) {
  return {
    lstat: io.lstat ?? fsLstat,
    mkdir: io.mkdir ?? fsMkdir,
    open: io.open ?? fsOpen,
    readFile: io.readFile ?? fsReadFile,
    rename: io.rename ?? fsRename,
    rm: io.rm ?? fsRm,
    writeFile: io.writeFile ?? fsWriteFile,
    stdout: io.stdout ?? ((line) => process.stdout.write(`${line}\n`)),
    stderr: io.stderr ?? ((line) => process.stderr.write(`${line}\n`)),
  };
}

function emitError(stderr, code, field) {
  const safeCode = /^[A-Z][A-Z0-9_]*$/.test(code) ? code : "INTERNAL_ERROR";
  const safeField = new Set(["analysis", "arguments", "input", "output-dir"]).has(field)
    ? field
    : "input";
  stderr(`ERROR ${safeCode}: ${safeField}`);
}

async function existing(path, lstat) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function privacyError(error) {
  return error instanceof SafeInputError && error.code.startsWith("PRIVACY_");
}

export async function run(argv, io = {}) {
  const parsed = parseArgv(argv);
  const runtime = runtimeIo(io);
  if (parsed === null) {
    emitError(runtime.stderr, "CLI_USAGE", "arguments");
    return 2;
  }

  let inputText;
  try {
    const metadata = await runtime.lstat(parsed.input);
    if (!metadata.isFile() || metadata.size > MAX_INPUT_BYTES) {
      emitError(runtime.stderr, "SCHEMA_INPUT_SCOPE_EXCEEDED", "input");
      return 3;
    }
    inputText = await runtime.readFile(parsed.input, "utf8");
  } catch {
    emitError(runtime.stderr, "FILE_READ", "input");
    return 6;
  }

  let input;
  let analysisJson;
  let briefMarkdown;
  try {
    input = parseInputJson(inputText);
    const analysis = analyzeDecisionLab(input, {
      analyzerVersion: ANALYZER_VERSION,
      dataClassification: parsed.dataClassification,
    });
    analysisJson = stableJson(analysis);
    briefMarkdown = renderMarkdown(analysis);
    if (!analysisJson.endsWith("\n") || !briefMarkdown.endsWith("\n")) {
      throw new Error("analysis invariant");
    }
  } catch (error) {
    if (error instanceof SafeInputError) {
      emitError(runtime.stderr, error.code, error.fieldPath);
      return privacyError(error) ? 4 : 3;
    }
    emitError(runtime.stderr, "ANALYSIS_INVARIANT", "analysis");
    return 5;
  }

  const outputDirectory = resolve(parsed.outputDirectory);
  const temporaryDirectory = `${outputDirectory}.tmp`;
  const lockPath = `${outputDirectory}.lock`;
  try {
    if (await existing(outputDirectory, runtime.lstat)) {
      emitError(runtime.stderr, "OUTPUT_EXISTS", "output-dir");
      return 6;
    }
    if (await existing(temporaryDirectory, runtime.lstat)) {
      emitError(runtime.stderr, "OUTPUT_TEMP_EXISTS", "output-dir");
      return 6;
    }
    await runtime.mkdir(dirname(outputDirectory), { recursive: true, mode: 0o700 });
  } catch {
    emitError(runtime.stderr, "FILE_WRITE", "output-dir");
    return 6;
  }

  let lockHandle;
  try {
    lockHandle = await runtime.open(lockPath, "wx", 0o600);
  } catch (error) {
    emitError(
      runtime.stderr,
      error?.code === "EEXIST" ? "OUTPUT_LOCKED" : "FILE_WRITE",
      "output-dir",
    );
    return 6;
  }

  let temporaryCreated = false;
  let failure = null;
  try {
    if (await existing(outputDirectory, runtime.lstat)) {
      failure = "OUTPUT_EXISTS";
    } else {
      await runtime.mkdir(temporaryDirectory, { recursive: false, mode: 0o700 });
      temporaryCreated = true;
      await runtime.writeFile(join(temporaryDirectory, "analysis.json"), analysisJson, {
        encoding: "utf8",
        mode: 0o600,
        flag: "wx",
      });
      await runtime.writeFile(join(temporaryDirectory, "brief.md"), briefMarkdown, {
        encoding: "utf8",
        mode: 0o600,
        flag: "wx",
      });
      if (await existing(outputDirectory, runtime.lstat)) {
        failure = "OUTPUT_EXISTS";
      } else {
        await runtime.rename(temporaryDirectory, outputDirectory);
        temporaryCreated = false;
      }
    }
  } catch {
    failure = "FILE_WRITE";
  } finally {
    if (temporaryCreated) {
      try {
        await runtime.rm(temporaryDirectory, { recursive: true, force: true });
      } catch {
        failure = "FILE_WRITE";
      }
    }
    try {
      await lockHandle.close();
    } catch {
      failure = "FILE_WRITE";
    }
    try {
      await runtime.rm(lockPath, { force: true });
    } catch {
      failure = "FILE_WRITE";
    }
  }

  if (failure !== null) {
    emitError(runtime.stderr, failure, "output-dir");
    return 6;
  }

  runtime.stdout(
    `OK operations-decision-analysis: ${parsed.dataClassification} output written`,
  );
  return 0;
}

const invokedPath = process.argv[1] === undefined ? null : resolve(process.argv[1]);
if (invokedPath === fileURLToPath(import.meta.url)) {
  process.exitCode = await run(process.argv.slice(2));
}
