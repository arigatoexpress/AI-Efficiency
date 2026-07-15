import { SafeInputError } from "./errors.mjs";
import { CSV_FIELDS, validateMetricRows, validatePolicy } from "./schema.mjs";

function malformedCsv() {
  throw new SafeInputError("CSV_MALFORMED");
}

function parseCsvRows(text) {
  if (typeof text !== "string") throw new SafeInputError("CSV_INVALID_INPUT");

  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let afterQuote = false;

  const finishField = () => {
    row.push(field);
    field = "";
    afterQuote = false;
  };
  const finishRow = () => {
    finishField();
    rows.push(row);
    row = [];
  };

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (inQuotes) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
          afterQuote = true;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (afterQuote) {
      if (character === ",") {
        finishField();
      } else if (character === "\n") {
        finishRow();
      } else if (character === "\r" && text[index + 1] === "\n") {
        finishRow();
        index += 1;
      } else {
        malformedCsv();
      }
      continue;
    }

    if (character === '"') {
      if (field !== "") malformedCsv();
      inQuotes = true;
    } else if (character === ",") {
      finishField();
    } else if (character === "\n") {
      finishRow();
    } else if (character === "\r") {
      if (text[index + 1] !== "\n") malformedCsv();
      finishRow();
      index += 1;
    } else {
      field += character;
    }
  }

  if (inQuotes) malformedCsv();
  if (row.length > 0 || field !== "" || afterQuote) finishRow();
  return rows;
}

export function parseMetricsCsv(text) {
  const rows = parseCsvRows(text);
  if (rows.length === 0) throw new SafeInputError("SCHEMA_INVALID_CSV_HEADER");

  const header = rows[0];
  if (new Set(header).size !== header.length) {
    throw new SafeInputError("SCHEMA_DUPLICATE_CSV_HEADER");
  }
  if (
    header.length !== CSV_FIELDS.length ||
    header.some((field, index) => field !== CSV_FIELDS[index])
  ) {
    throw new SafeInputError("SCHEMA_INVALID_CSV_HEADER");
  }

  const rawRecords = rows.slice(1).map((values, index) => {
    if (values.length !== CSV_FIELDS.length) {
      throw new SafeInputError("SCHEMA_INVALID_COLUMN_COUNT", [], index + 2);
    }
    return Object.fromEntries(CSV_FIELDS.map((field, fieldIndex) => [field, values[fieldIndex]]));
  });
  return validateMetricRows(rawRecords);
}

export function parsePolicyJson(text) {
  if (typeof text !== "string") throw new SafeInputError("SCHEMA_INVALID_POLICY_JSON");

  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new SafeInputError("SCHEMA_INVALID_POLICY_JSON");
  }
  return validatePolicy(raw);
}
