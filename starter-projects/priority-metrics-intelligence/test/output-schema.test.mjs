import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { isDeepStrictEqual } from "node:util";

const schemaUrl = new URL(
  "../../../specs/001-priority-metrics-intelligence/contracts/analysis-output.schema.json",
  import.meta.url,
);
const goldenUrl = new URL("../fixtures/expected-analysis.json", import.meta.url);

const schema = JSON.parse(await readFile(schemaUrl, "utf8"));
const golden = JSON.parse(await readFile(goldenUrl, "utf8"));

function valueType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
}

function matchesType(value, expected) {
  if (expected === "number") return typeof value === "number" && Number.isFinite(value);
  if (expected === "integer") return Number.isSafeInteger(value);
  if (expected === "object") {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  return valueType(value) === expected;
}

function resolveReference(root, reference) {
  assert.match(reference, /^#\//, `only local schema references are supported: ${reference}`);
  return reference
    .slice(2)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
    .reduce((current, part) => current[part], root);
}

function validateNode(root, nodeSchema, value, path = "$") {
  if (nodeSchema.$ref !== undefined) {
    return validateNode(root, resolveReference(root, nodeSchema.$ref), value, path);
  }

  if (nodeSchema.oneOf !== undefined) {
    const branchResults = nodeSchema.oneOf.map((branch) =>
      validateNode(root, branch, value, path),
    );
    const passingBranches = branchResults.filter((errors) => errors.length === 0);
    return passingBranches.length === 1
      ? []
      : [`${path} must match exactly one oneOf branch`];
  }

  const errors = [];
  if (nodeSchema.type !== undefined && !matchesType(value, nodeSchema.type)) {
    return [`${path} expected ${nodeSchema.type}, received ${valueType(value)}`];
  }
  if (Object.hasOwn(nodeSchema, "const") && !isDeepStrictEqual(value, nodeSchema.const)) {
    errors.push(`${path} must equal ${JSON.stringify(nodeSchema.const)}`);
  }
  if (
    nodeSchema.enum !== undefined &&
    !nodeSchema.enum.some((item) => isDeepStrictEqual(item, value))
  ) {
    errors.push(`${path} is outside the enum`);
  }

  if (typeof value === "string") {
    if (nodeSchema.pattern !== undefined && !new RegExp(nodeSchema.pattern, "u").test(value)) {
      errors.push(`${path} does not match ${nodeSchema.pattern}`);
    }
    if (nodeSchema.minLength !== undefined && value.length < nodeSchema.minLength) {
      errors.push(`${path} is shorter than ${nodeSchema.minLength}`);
    }
    if (nodeSchema.maxLength !== undefined && value.length > nodeSchema.maxLength) {
      errors.push(`${path} is longer than ${nodeSchema.maxLength}`);
    }
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    if (nodeSchema.minimum !== undefined && value < nodeSchema.minimum) {
      errors.push(`${path} is below ${nodeSchema.minimum}`);
    }
    if (nodeSchema.maximum !== undefined && value > nodeSchema.maximum) {
      errors.push(`${path} is above ${nodeSchema.maximum}`);
    }
  }

  if (Array.isArray(value)) {
    if (nodeSchema.minItems !== undefined && value.length < nodeSchema.minItems) {
      errors.push(`${path} has fewer than ${nodeSchema.minItems} items`);
    }
    if (nodeSchema.maxItems !== undefined && value.length > nodeSchema.maxItems) {
      errors.push(`${path} has more than ${nodeSchema.maxItems} items`);
    }
    if (
      nodeSchema.uniqueItems === true &&
      value.some((item, index) =>
        value.slice(index + 1).some((candidate) => isDeepStrictEqual(item, candidate)),
      )
    ) {
      errors.push(`${path} contains duplicate items`);
    }
    if (nodeSchema.items !== undefined) {
      value.forEach((item, index) => {
        errors.push(...validateNode(root, nodeSchema.items, item, `${path}[${index}]`));
      });
    }
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const properties = nodeSchema.properties ?? {};
    for (const required of nodeSchema.required ?? []) {
      if (!Object.hasOwn(value, required)) errors.push(`${path}.${required} is required`);
    }
    if (nodeSchema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.hasOwn(properties, key)) errors.push(`${path}.${key} is not allowed`);
      }
    }
    for (const [key, propertySchema] of Object.entries(properties)) {
      if (Object.hasOwn(value, key)) {
        errors.push(...validateNode(root, propertySchema, value[key], `${path}.${key}`));
      }
    }
  }

  return errors;
}

function clone(value) {
  return structuredClone(value);
}

function assertValid(value) {
  assert.deepEqual(validateNode(schema, schema, value), []);
}

function assertInvalid(value, label) {
  assert.notDeepEqual(validateNode(schema, schema, value), [], label);
}

test("analysis output schema is a closed offline Draft 2020-12 contract", () => {
  assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.inputSummary.$ref, "#/$defs/inputSummary");
  assert.equal(schema.$defs.inputSummary.additionalProperties, false);
});

test("golden canonical output validates against every nested contract", () => {
  assertValid(golden);
});

test("nested output shapes reject missing, malformed, and additional fields", () => {
  const mutations = [
    ["missing input summary field", (value) => delete value.inputSummary.analysisPeriod],
    ["bad analysis period", (value) => (value.inputSummary.analysisPeriod = "2026-13")],
    ["input summary extension", (value) => (value.inputSummary.sourcePath = "/private")],
    [
      "missing rate denominator",
      (value) => delete value.inputSummary.metricDefinitions[0].semanticDefinition.denominator,
    ],
    [
      "measure with rate property",
      (value) =>
        (value.inputSummary.metricDefinitions[1].semanticDefinition.numerator = "packages"),
    ],
    ["comparison number as text", (value) => (value.comparisons[0].mom.baselineValue = "2.2")],
    ["comparison extension", (value) => (value.comparisons[0].target.note = "guess")],
    ["gap with numeric severity", (value) => {
      value.riskLineages[0].events[0] = {
        classification: "gap",
        period: "2025-12",
        severity: 1,
      };
    }],
    ["invalid lineage outcome", (value) => (value.riskLineages[0].outcome = "closed")],
    ["recurrence extension", (value) => (value.patterns.recurrences[0].cause = "weather")],
    [
      "invalid period pair",
      (value) => (value.patterns.candidateAssociations[0].periodPairs[0].sourcePeriod = "June"),
    ],
    [
      "coefficient with limitation",
      (value) => (value.patterns.candidateAssociations[0].limitation = "period_gap"),
    ],
    ["projection value as text", (value) => (value.projections[0].projectedValue = "1.7")],
    ["duplicate projection periods", (value) => {
      value.projections[0].inputPeriods[1] = value.projections[0].inputPeriods[0];
    }],
    ["unknown limitation code", (value) => value.limitations.push("model_guess")],
    ["unknown provenance method", (value) => value.provenance.methods.push("black_box")],
    ["provenance extension", (value) => (value.provenance.generatedAt = "now")],
  ];

  for (const [label, mutate] of mutations) {
    const candidate = clone(golden);
    mutate(candidate);
    assertInvalid(candidate, label);
  }
});

test("metric definitions enforce exact source-controlled catalog tuples", () => {
  const mutations = [
    ["mismatched catalog label", (definition) => (definition.metricLabel = "SYNTH Other percent")],
    ["mismatched catalog pillar", (definition) => (definition.pillarId = "synth_service")],
    [
      "mismatched catalog numerator",
      (definition) => (definition.semanticDefinition.numerator = "packages_delivered"),
    ],
    ["mismatched catalog unit", (definition) => (definition.unit = "ratio")],
  ];

  for (const [label, mutate] of mutations) {
    const candidate = clone(golden);
    mutate(candidate.inputSummary.metricDefinitions[0]);
    assertInvalid(candidate, label);
  }
});

test("nullability branches accept explicit limited forms and reject mixed forms", () => {
  const limited = clone(golden);
  limited.comparisons[0].mom = {
    absoluteChange: null,
    baselinePeriod: "2026-05",
    baselineValue: null,
    percentageChange: null,
    reason: "insufficient_history",
  };
  limited.comparisons[0].target = { distance: null, status: "no_target" };
  limited.patterns.candidateAssociations[0].coefficient = null;
  limited.patterns.candidateAssociations[0].limitation = "zero_variance";
  limited.projections[0].projectedValue = null;
  limited.projections[0].limitation = "period_gap";
  assertValid(limited);

  limited.projections[0].projectedValue = 1.7;
  assertInvalid(limited, "a projection cannot mix a value with a limitation");
});
