import { SafeInputError } from "./errors.mjs";
import { CSV_FIELDS, validateMetricRows, validatePolicy } from "./schema.mjs";
import { assertPublicSafe } from "./privacy.mjs";

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

function rejectDuplicateJsonMembers(text) {
  let index = 0;

  const skipWhitespace = () => {
    while (/\s/.test(text[index] ?? "")) index += 1;
  };

  const parseString = () => {
    const start = index;
    index += 1;
    while (index < text.length) {
      if (text[index] === "\\") {
        index += text[index + 1] === "u" ? 6 : 2;
      } else if (text[index] === '"') {
        index += 1;
        return JSON.parse(text.slice(start, index));
      } else {
        index += 1;
      }
    }
    throw new SyntaxError("unterminated JSON string");
  };

  const parseValue = () => {
    skipWhitespace();
    if (text[index] === "{") {
      parseObject();
    } else if (text[index] === "[") {
      parseArray();
    } else if (text[index] === '"') {
      parseString();
    } else {
      const start = index;
      while (index < text.length && !/[\s,}\]]/.test(text[index])) index += 1;
      if (index === start) throw new SyntaxError("invalid JSON value");
    }
  };

  const parseObject = () => {
    index += 1;
    const memberNames = new Set();
    skipWhitespace();
    if (text[index] === "}") {
      index += 1;
      return;
    }
    while (index < text.length) {
      skipWhitespace();
      if (text[index] !== '"') throw new SyntaxError("invalid JSON member");
      const memberName = parseString();
      if (memberNames.has(memberName)) {
        throw new SafeInputError("SCHEMA_DUPLICATE_JSON_MEMBER", ["input"]);
      }
      memberNames.add(memberName);
      skipWhitespace();
      if (text[index] !== ":") throw new SyntaxError("missing JSON colon");
      index += 1;
      parseValue();
      skipWhitespace();
      if (text[index] === "}") {
        index += 1;
        return;
      }
      if (text[index] !== ",") throw new SyntaxError("invalid JSON object");
      index += 1;
    }
    throw new SyntaxError("unterminated JSON object");
  };

  const parseArray = () => {
    index += 1;
    skipWhitespace();
    if (text[index] === "]") {
      index += 1;
      return;
    }
    while (index < text.length) {
      parseValue();
      skipWhitespace();
      if (text[index] === "]") {
        index += 1;
        return;
      }
      if (text[index] !== ",") throw new SyntaxError("invalid JSON array");
      index += 1;
    }
    throw new SyntaxError("unterminated JSON array");
  };

  parseValue();
  skipWhitespace();
  if (index !== text.length) throw new SyntaxError("trailing JSON content");
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
  const records = validateMetricRows(rawRecords);
  assertPublicSafe(records);
  return records;
}

export function parsePolicyJson(text) {
  if (typeof text !== "string") throw new SafeInputError("SCHEMA_INVALID_POLICY_JSON");

  let raw;
  try {
    rejectDuplicateJsonMembers(text);
    raw = JSON.parse(text);
  } catch (error) {
    if (error instanceof SafeInputError) throw error;
    throw new SafeInputError("SCHEMA_INVALID_POLICY_JSON");
  }
  return validatePolicy(raw);
}
