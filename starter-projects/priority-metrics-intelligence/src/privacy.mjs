import { SafeInputError } from "./errors.mjs";
import { METRIC_FIELDS } from "./schema.mjs";

const ALLOWED_FIELDS = new Set(METRIC_FIELDS);
const DIRECT_IDENTIFIER = /@|[\u0000-\u001f\u007f]|\d{4,}|\b\d+\s+(?:[\p{L}]+\s+){0,4}(?:street|st|road|rd|avenue|ave|lane|ln|drive|dr|boulevard|blvd|highway|hwy)\b|\b(?:street|st|road|rd|avenue|ave|lane|ln|drive|dr|boulevard|blvd|highway|hwy)\s+\d+/iu;
const IDENTIFIER_SLUG =
  /(?:employee|customer|tracking|manifest|address|route|source[_-]?system)[_-]?id(?:[_-]|$)|\d{4,}/;

export function assertPublicSafe(records) {
  if (!Array.isArray(records)) {
    throw new SafeInputError("PRIVACY_INVALID_RECORDS");
  }

  records.forEach((record, index) => {
    const rowNumber = index + 1;
    if (record === null || Array.isArray(record) || typeof record !== "object") {
      throw new SafeInputError("PRIVACY_INVALID_RECORD", [], rowNumber);
    }

    const forbiddenFields = Object.keys(record).filter((field) => !ALLOWED_FIELDS.has(field));
    if (forbiddenFields.length > 0) {
      throw new SafeInputError("PRIVACY_FORBIDDEN_FIELD", forbiddenFields, rowNumber);
    }

    for (const [field, value] of Object.entries(record)) {
      if (typeof value !== "string" || field === "period") continue;
      const unsafe =
        (field === "metricLabel" && DIRECT_IDENTIFIER.test(value)) ||
        ((field === "metricId" || field === "pillarId") && IDENTIFIER_SLUG.test(value));
      if (unsafe) {
        throw new SafeInputError("PRIVACY_DIRECT_IDENTIFIER", [field], rowNumber);
      }
    }
  });
}
