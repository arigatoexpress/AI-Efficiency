import { SafeInputError } from "./errors.mjs";

export const CSV_FIELDS = Object.freeze([
  "period",
  "pillar_id",
  "metric_id",
  "metric_label",
  "value",
  "unit",
  "target_type",
  "target_min",
  "target_max",
  "warning_margin",
]);

export const METRIC_FIELDS = Object.freeze([
  "period",
  "pillarId",
  "metricId",
  "metricLabel",
  "value",
  "unit",
  "targetType",
  "targetMin",
  "targetMax",
  "warningMargin",
]);

const UNITS = new Set(["count", "percent", "minutes", "hours", "index", "ratio"]);
const TARGET_TYPES = new Set(["minimum", "maximum", "range"]);
const POLICY_FIELDS = new Set([
  "projectionWindow",
  "minimumRecurrences",
  "candidateAssociations",
]);
const ASSOCIATION_FIELDS = new Set([
  "sourceMetricId",
  "outcomeMetricId",
  "lagMonths",
  "minimumObservations",
]);
const IDENTIFIER_SLUG =
  /(?:employee|customer|tracking|manifest|address|route|source[_-]?system)[_-]?id(?:[_-]|$)|\d{4,}/;
const DECIMAL_NUMBER = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

function fail(code, fields, rowNumber = null) {
  throw new SafeInputError(code, fields, rowNumber);
}

function parseNumber(value, field, rowNumber, { optional = false, minimum = null } = {}) {
  if (optional && value === "") return null;
  if (!DECIMAL_NUMBER.test(value)) fail("SCHEMA_INVALID_NUMBER", [field], rowNumber);

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || (minimum !== null && parsed < minimum)) {
    fail("SCHEMA_INVALID_NUMBER", [field], rowNumber);
  }
  return parsed;
}

function validateSlug(value, field, maximumLength, rowNumber, code = "SCHEMA_INVALID_SLUG") {
  if (
    value.length < 1 ||
    value.length > maximumLength ||
    !/^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$/.test(value) ||
    IDENTIFIER_SLUG.test(value)
  ) {
    fail(code, [field], rowNumber);
  }
  return value;
}

function validateLabel(value, rowNumber) {
  if (
    value.length < 1 ||
    value.length > 80 ||
    !/^[\p{L}\d ()/%+\-]+$/u.test(value) ||
    /\d{4,}/.test(value)
  ) {
    fail("SCHEMA_INVALID_LABEL", ["metric_label"], rowNumber);
  }
  return value;
}

function validateTarget(targetType, targetMin, targetMax, rowNumber) {
  const valid =
    (targetType === null && targetMin === null && targetMax === null) ||
    (targetType === "minimum" && targetMin !== null && targetMax === null) ||
    (targetType === "maximum" && targetMin === null && targetMax !== null) ||
    (targetType === "range" &&
      targetMin !== null &&
      targetMax !== null &&
      targetMin <= targetMax);

  if (!valid) {
    fail("SCHEMA_INVALID_TARGET", ["target_type", "target_min", "target_max"], rowNumber);
  }
}

export function validateMetricRows(rawRecords) {
  const observations = [];
  const observationKeys = new Set();
  const definitions = new Map();

  for (const [index, raw] of rawRecords.entries()) {
    const rowNumber = index + 2;
    const period = raw.period.trim();
    const pillarId = raw.pillar_id.trim();
    const metricId = raw.metric_id.trim();
    const metricLabel = raw.metric_label.trim();
    const unit = raw.unit.trim();
    const rawTargetType = raw.target_type.trim();
    const targetType = rawTargetType === "" ? null : rawTargetType;

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
      fail("SCHEMA_INVALID_PERIOD", ["period"], rowNumber);
    }
    validateSlug(pillarId, "pillar_id", 48, rowNumber);
    validateSlug(metricId, "metric_id", 64, rowNumber);
    validateLabel(metricLabel, rowNumber);
    if (!UNITS.has(unit)) fail("SCHEMA_INVALID_UNIT", ["unit"], rowNumber);
    if (targetType !== null && !TARGET_TYPES.has(targetType)) {
      fail("SCHEMA_INVALID_TARGET", ["target_type"], rowNumber);
    }

    const value = parseNumber(raw.value, "value", rowNumber);
    const targetMin = parseNumber(raw.target_min, "target_min", rowNumber, {
      optional: true,
    });
    const targetMax = parseNumber(raw.target_max, "target_max", rowNumber, {
      optional: true,
    });
    const warningMargin =
      raw.warning_margin === ""
        ? 0
        : parseNumber(raw.warning_margin, "warning_margin", rowNumber, { minimum: 0 });
    validateTarget(targetType, targetMin, targetMax, rowNumber);

    const observationKey = `${period}\u0000${metricId}`;
    if (observationKeys.has(observationKey)) {
      fail("SCHEMA_DUPLICATE_OBSERVATION", ["period", "metric_id"], rowNumber);
    }
    observationKeys.add(observationKey);

    const definition = JSON.stringify([
      pillarId,
      metricLabel,
      unit,
      targetType,
      targetMin,
      targetMax,
      warningMargin,
    ]);
    if (definitions.has(metricId) && definitions.get(metricId) !== definition) {
      fail("SCHEMA_UNSTABLE_METRIC", ["metric_id"], rowNumber);
    }
    definitions.set(metricId, definition);

    observations.push({
      period,
      pillarId,
      metricId,
      metricLabel,
      value,
      unit,
      targetType,
      targetMin,
      targetMax,
      warningMargin,
    });
  }

  return observations;
}

export function isCanonicalMetricObservation(record) {
  if (
    record === null ||
    Array.isArray(record) ||
    typeof record !== "object" ||
    METRIC_FIELDS.some((field) => !Object.hasOwn(record, field))
  ) {
    return false;
  }

  const targetTypeValid =
    record.targetType === null || TARGET_TYPES.has(record.targetType);
  const numericOrNull = (value) => value === null || Number.isFinite(value);
  const targetValid =
    targetTypeValid &&
    numericOrNull(record.targetMin) &&
    numericOrNull(record.targetMax) &&
    ((record.targetType === null && record.targetMin === null && record.targetMax === null) ||
      (record.targetType === "minimum" &&
        record.targetMin !== null &&
        record.targetMax === null) ||
      (record.targetType === "maximum" &&
        record.targetMin === null &&
        record.targetMax !== null) ||
      (record.targetType === "range" &&
        record.targetMin !== null &&
        record.targetMax !== null &&
        record.targetMin <= record.targetMax));

  return (
    typeof record.period === "string" &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(record.period) &&
    typeof record.pillarId === "string" &&
    record.pillarId.length <= 48 &&
    /^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$/.test(record.pillarId) &&
    !IDENTIFIER_SLUG.test(record.pillarId) &&
    typeof record.metricId === "string" &&
    record.metricId.length <= 64 &&
    /^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*$/.test(record.metricId) &&
    !IDENTIFIER_SLUG.test(record.metricId) &&
    typeof record.metricLabel === "string" &&
    record.metricLabel.length >= 1 &&
    record.metricLabel.length <= 80 &&
    /^[\p{L}\d ()/%+\-]+$/u.test(record.metricLabel) &&
    !/\d{4,}/.test(record.metricLabel) &&
    Number.isFinite(record.value) &&
    UNITS.has(record.unit) &&
    targetValid &&
    Number.isFinite(record.warningMargin) &&
    record.warningMargin >= 0
  );
}

function integerInRange(value, minimum, maximum) {
  return Number.isInteger(value) && value >= minimum && value <= maximum;
}

export function validatePolicy(raw) {
  if (raw === null || Array.isArray(raw) || typeof raw !== "object") {
    fail("SCHEMA_INVALID_POLICY", ["policy"]);
  }

  const unknownFields = Object.keys(raw).filter((field) => !POLICY_FIELDS.has(field));
  if (unknownFields.length > 0) {
    fail("SCHEMA_UNKNOWN_POLICY_FIELD", unknownFields);
  }

  const projectionWindow = Object.hasOwn(raw, "projectionWindow")
    ? raw.projectionWindow
    : 6;
  const minimumRecurrences = Object.hasOwn(raw, "minimumRecurrences")
    ? raw.minimumRecurrences
    : 3;
  const candidateAssociations = Object.hasOwn(raw, "candidateAssociations")
    ? raw.candidateAssociations
    : [];
  if (
    !integerInRange(projectionWindow, 3, 24) ||
    !integerInRange(minimumRecurrences, 2, 12) ||
    !Array.isArray(candidateAssociations) ||
    candidateAssociations.length > 50
  ) {
    fail("SCHEMA_INVALID_POLICY_VALUE", [
      "projectionWindow",
      "minimumRecurrences",
      "candidateAssociations",
    ]);
  }

  const associationKeys = new Set();
  const validatedAssociations = candidateAssociations.map((association, index) => {
    if (association === null || Array.isArray(association) || typeof association !== "object") {
      fail("SCHEMA_INVALID_POLICY_VALUE", ["candidateAssociations"], index + 1);
    }
    const unknown = Object.keys(association).filter(
      (field) => !ASSOCIATION_FIELDS.has(field),
    );
    if (unknown.length > 0) fail("SCHEMA_UNKNOWN_ASSOCIATION_FIELD", unknown, index + 1);
    if ([...ASSOCIATION_FIELDS].some((field) => !(field in association))) {
      fail("SCHEMA_INVALID_POLICY_VALUE", ["candidateAssociations"], index + 1);
    }

    const { sourceMetricId, outcomeMetricId, lagMonths, minimumObservations } = association;
    if (typeof sourceMetricId !== "string" || typeof outcomeMetricId !== "string") {
      fail("SCHEMA_INVALID_POLICY_VALUE", ["candidateAssociations"], index + 1);
    }
    validateSlug(
      sourceMetricId,
      "sourceMetricId",
      64,
      index + 1,
      "SCHEMA_INVALID_POLICY_VALUE",
    );
    validateSlug(
      outcomeMetricId,
      "outcomeMetricId",
      64,
      index + 1,
      "SCHEMA_INVALID_POLICY_VALUE",
    );
    if (
      sourceMetricId === outcomeMetricId ||
      !integerInRange(lagMonths, 1, 12) ||
      !integerInRange(minimumObservations, 6, 60)
    ) {
      fail("SCHEMA_INVALID_POLICY_VALUE", ["candidateAssociations"], index + 1);
    }

    const associationKey = `${sourceMetricId}\u0000${outcomeMetricId}\u0000${lagMonths}`;
    if (associationKeys.has(associationKey)) {
      fail("SCHEMA_DUPLICATE_ASSOCIATION", ["candidateAssociations"], index + 1);
    }
    associationKeys.add(associationKey);
    return { sourceMetricId, outcomeMetricId, lagMonths, minimumObservations };
  });

  return {
    projectionWindow,
    minimumRecurrences,
    candidateAssociations: validatedAssociations,
  };
}
