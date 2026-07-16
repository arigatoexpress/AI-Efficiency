import { SafeInputError } from "./errors.mjs";
import { isCanonicalMetricObservation, METRIC_FIELDS } from "./schema.mjs";

const ALLOWED_FIELDS = new Set(METRIC_FIELDS);
const DIRECT_IDENTIFIER =
  /@|[\u0000-\u001f\u007f]|\b(?:\d{1,6}\s+(?:[\p{L}\d]+\s+){0,4}(?:street|st|road|rd|avenue|ave|lane|ln|drive|dr|boulevard|blvd|highway|hwy)|(?:street|st|road|rd|avenue|ave|lane|ln|drive|dr|boulevard|blvd|highway|hwy)\s+\d{1,6})\b/iu;
const IDENTIFIER_SLUG =
  /(?:employee|customer|tracking|manifest|address|route|source[_-]?system)[_-]?id(?:[_-]|$)|\d{4,}/;
const TRACKING_SHAPED_INTEGER = /^\d{12,22}$/;

export function assertRawPublicSafe(records) {
  if (!Array.isArray(records)) throw new SafeInputError("PRIVACY_INVALID_RECORDS");

  records.forEach((record, index) => {
    for (const [field, value] of Object.entries(record)) {
      if (
        typeof value === "string" &&
        (DIRECT_IDENTIFIER.test(value) || TRACKING_SHAPED_INTEGER.test(value.trim()))
      ) {
        throw new SafeInputError("PRIVACY_DIRECT_IDENTIFIER", [field], index + 2);
      }
    }
  });
}

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
    if (METRIC_FIELDS.some((field) => !Object.hasOwn(record, field))) {
      throw new SafeInputError("PRIVACY_INVALID_RECORD", [], rowNumber);
    }

    for (const [field, value] of Object.entries(record)) {
      if (typeof value !== "string") continue;
      const unsafe =
        DIRECT_IDENTIFIER.test(value) ||
        (field === "metricLabel" && /\d{4,}/.test(value)) ||
        ((field === "metricId" || field === "pillarId") && IDENTIFIER_SLUG.test(value));
      if (unsafe) {
        throw new SafeInputError("PRIVACY_DIRECT_IDENTIFIER", [field], rowNumber);
      }
    }
    if (!isCanonicalMetricObservation(record)) {
      throw new SafeInputError("PRIVACY_INVALID_RECORD", [], rowNumber);
    }
  });
}
