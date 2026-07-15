function safeFieldName(value) {
  return typeof value === "string" && /^[A-Za-z][A-Za-z0-9_]*$/.test(value)
    ? value
    : "input";
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
