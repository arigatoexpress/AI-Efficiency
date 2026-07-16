const SAFE_FIELD_PATHS = new Set([
  "input",
  "provenance",
  "forecast",
  "forecast.observations",
  "resources",
  "resources.vehicles",
  "resources.laborShifts",
  "demandGroups",
  "plans",
  "plans.routes",
  "plans.routes.visits",
  "policy",
]);

function safeCode(value) {
  return typeof value === "string" && /^[A-Z][A-Z0-9_]*$/.test(value)
    ? value
    : "SAFE_INPUT_ERROR";
}

function safeFieldPath(value) {
  return SAFE_FIELD_PATHS.has(value) ? value : "input";
}

export class SafeInputError extends Error {
  constructor(code, fieldPath = "input") {
    const normalizedCode = safeCode(code);
    const normalizedPath = safeFieldPath(fieldPath);
    super(`${normalizedCode}; field=${normalizedPath}`);
    this.name = "SafeInputError";
    this.code = normalizedCode;
    this.fieldPath = normalizedPath;
  }
}

export function failInput(code, fieldPath = "input") {
  throw new SafeInputError(code, fieldPath);
}
