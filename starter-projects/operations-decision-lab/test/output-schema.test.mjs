import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { isDeepStrictEqual } from "node:util";

const schema = JSON.parse(
  await readFile(
    new URL(
      "../../../specs/002-operations-decision-lab/contracts/analysis-output.schema.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const golden = JSON.parse(
  await readFile(new URL("../fixtures/expected-analysis.json", import.meta.url), "utf8"),
);

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
  assert.match(reference, /^#\//);
  return reference
    .slice(2)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
    .reduce((current, part) => current[part], root);
}

function validateNode(root, nodeSchema, value, path = "$") {
  if (nodeSchema === true) return [];
  if (nodeSchema === false) return [`${path} is not allowed`];
  if (nodeSchema.$ref !== undefined) {
    return validateNode(root, resolveReference(root, nodeSchema.$ref), value, path);
  }

  const errors = [];
  if (nodeSchema.oneOf !== undefined) {
    const passing = nodeSchema.oneOf.filter(
      (branch) => validateNode(root, branch, value, path).length === 0,
    );
    if (passing.length !== 1) errors.push(`${path} must match exactly one oneOf branch`);
  }
  if (nodeSchema.type !== undefined && !matchesType(value, nodeSchema.type)) {
    return [...errors, `${path} expected ${nodeSchema.type}, received ${valueType(value)}`];
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
      errors.push(`${path} does not match its pattern`);
    }
    if (nodeSchema.maxLength !== undefined && value.length > nodeSchema.maxLength) {
      errors.push(`${path} is too long`);
    }
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    if (nodeSchema.minimum !== undefined && value < nodeSchema.minimum) {
      errors.push(`${path} is below minimum`);
    }
    if (nodeSchema.maximum !== undefined && value > nodeSchema.maximum) {
      errors.push(`${path} is above maximum`);
    }
  }

  if (Array.isArray(value)) {
    if (nodeSchema.minItems !== undefined && value.length < nodeSchema.minItems) {
      errors.push(`${path} has too few items`);
    }
    if (nodeSchema.maxItems !== undefined && value.length > nodeSchema.maxItems) {
      errors.push(`${path} has too many items`);
    }
    if (
      nodeSchema.uniqueItems === true &&
      value.some((item, index) =>
        value.slice(index + 1).some((candidate) => isDeepStrictEqual(item, candidate)),
      )
    ) {
      errors.push(`${path} contains duplicate items`);
    }
    const prefixLength = nodeSchema.prefixItems?.length ?? 0;
    for (let index = 0; index < Math.min(prefixLength, value.length); index += 1) {
      errors.push(
        ...validateNode(root, nodeSchema.prefixItems[index], value[index], `${path}[${index}]`),
      );
    }
    if (nodeSchema.items !== undefined) {
      for (let index = prefixLength; index < value.length; index += 1) {
        errors.push(...validateNode(root, nodeSchema.items, value[index], `${path}[${index}]`));
      }
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

function assertSchemaValid(value) {
  assert.deepEqual(validateNode(schema, schema, value), []);
}

function assertSchemaInvalid(value, label) {
  assert.notDeepEqual(validateNode(schema, schema, value), [], label);
}

function assertSemanticInvariants(value) {
  assert.deepEqual(
    value.forecasts.models.map(({ model }) => model),
    ["last_value", "level_trend", "seasonal_naive_7"],
  );
  for (const { forecast } of value.forecasts.models) {
    const quantiles = [forecast.p10, forecast.p25, forecast.p50, forecast.p75, forecast.p90];
    if (quantiles.some((item) => item === null)) {
      assert.ok(quantiles.every((item) => item === null));
    } else {
      assert.deepEqual(quantiles, [...quantiles].sort((left, right) => left - right));
      assert.ok(quantiles.every((item) => item >= 0));
    }
  }
  for (const plan of value.feasibility) {
    assert.equal(plan.status === "feasible", plan.violations.length === 0);
  }
}

test("golden output validates against the complete closed schema and runtime invariants", () => {
  assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assertSchemaValid(golden);
  assertSemanticInvariants(golden);
});

test("adversarial nested mutations, mixed branches, and invented capabilities reject", () => {
  const violation = {
    constraintCode: "capacity_exceeded",
    entityId: "SYNTH-ROUTE-01",
    observed: 200,
    limit: 100,
    unit: "cube_units",
  };
  const mutations = [
    ["deferred top-level key", (value) => (value.recommendation = null)],
    ["nested note", (value) => (value.forecasts.models[0].forecast.note = "guess")],
    ["reordered models", (value) => value.forecasts.models.reverse()],
    ["invented winner", (value) => (value.forecasts.winner = "last_value")],
    ["feasible with violations", (value) => value.feasibility[0].violations.push(violation)],
    ["infeasible without violations", (value) => (value.feasibility[0].status = "infeasible")],
    ["unknown constraint", (value) => {
      value.feasibility[0].status = "infeasible";
      value.feasibility[0].violations = [{ ...violation, constraintCode: "cheap_penalty" }];
    }],
    ["mixed MASE", (value) => {
      value.forecasts.models[0].evaluation.mase = null;
      value.forecasts.models[0].evaluation.maseLimitation = null;
    }],
    ["local path", (value) => (value.provenance.sourcePath = "/private/input.json")],
  ];

  for (const [label, mutate] of mutations) {
    const candidate = structuredClone(golden);
    mutate(candidate);
    assertSchemaInvalid(candidate, label);
  }
});

test("quantile order is enforced as a cross-field runtime invariant", () => {
  const candidate = structuredClone(golden);
  candidate.forecasts.models[0].forecast.p25 = candidate.forecasts.models[0].forecast.p10 - 1;
  assert.throws(() => assertSemanticInvariants(candidate));
});
