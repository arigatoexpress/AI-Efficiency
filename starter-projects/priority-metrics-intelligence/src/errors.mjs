const SAFE_FIELD_NAMES = new Set([
  "input",
  "policy",
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
  "pillarId",
  "metricId",
  "metricLabel",
  "targetType",
  "targetMin",
  "targetMax",
  "warningMargin",
  "projectionWindow",
  "minimumRecurrences",
  "candidateAssociations",
  "sourceMetricId",
  "outcomeMetricId",
  "lagMonths",
  "minimumObservations",
]);

function safeFieldName(value) {
  return SAFE_FIELD_NAMES.has(value) ? value : "input";
}

export class SafeInputError extends Error {
  constructor(code, fieldNames = [], rowNumber = null) {
    const safeCode = /^[A-Z][A-Z0-9_]*$/.test(code)
      ? code
      : "SAFE_INPUT_ERROR";
    const safeFields = [...new Set(fieldNames.map(safeFieldName))].sort();
    const safeRow = Number.isInteger(rowNumber) && rowNumber > 0 ? rowNumber : null;
    const details = [
      safeFields.length > 0 ? `fields=${safeFields.join(",")}` : null,
      safeRow !== null ? `row=${safeRow}` : null,
    ].filter(Boolean);

    super(details.length > 0 ? `${safeCode}; ${details.join("; ")}` : safeCode);
    this.name = "SafeInputError";
    this.code = safeCode;
    this.fieldNames = safeFields;
    this.rowNumber = safeRow;
  }
}
