import { failInput } from "./errors.mjs";

const FORBIDDEN_FIELDS = new Set([
  "address",
  "comment",
  "comments",
  "coordinate",
  "coordinates",
  "customerid",
  "customername",
  "driverid",
  "drivername",
  "email",
  "employeeid",
  "employeename",
  "freetext",
  "latitude",
  "longitude",
  "manifest",
  "manifestid",
  "note",
  "notes",
  "phone",
  "postalcode",
  "recipientid",
  "recipientname",
  "sourcesystem",
  "sourcesystemid",
  "ssn",
  "streetaddress",
  "tracking",
  "trackingid",
  "trackingnumber",
  "zipcode",
]);

const DIRECT_IDENTIFIER =
  /@|[\u0000-\u001f\u007f]|(?:\+?1[ .-]?)?(?:\(\d{3}\)|\d{3})[ .-]\d{3}[ .-]\d{4}|\b\d{1,6}\s+(?:[\p{L}\d]+\s+){0,4}(?:street|st|road|rd|avenue|ave|lane|ln|drive|dr|boulevard|blvd|highway|hwy)\b/iu;
const TRACKING_SHAPED = /^\d{12,22}$/;
const PRECISE_COORDINATE = /^\s*-?\d{1,3}\.\d{4,}\s*,\s*-?\d{1,3}\.\d{4,}\s*$/;
const PERSON_NAME_SHAPED = /^[\p{Lu}][\p{L}'-]{1,30}\s+[\p{Lu}][\p{L}'-]{1,30}$/u;
const SENSITIVE_IDENTIFIER_SHAPED =
  /^(?:address|customer|employee|manifest|route|source[_-]?system|tracking)[_-]?[a-z0-9_-]+$/i;

const SYNTHETIC_ID_PATTERNS = Object.freeze({
  entityId: /^SYNTH-(?:NETWORK|STATION)-[A-Z0-9]+(?:-[A-Z0-9]+)*$/,
  observationId: /^SYNTH-OBS-[A-Z0-9]+(?:-[A-Z0-9]+)*$/,
  vehicleId: /^SYNTH-VEHICLE-[A-Z0-9]+(?:-[A-Z0-9]+)*$/,
  shiftId: /^SYNTH-SHIFT-[A-Z0-9]+(?:-[A-Z0-9]+)*$/,
  demandGroupId: /^SYNTH-DEMAND-[A-Z0-9]+(?:-[A-Z0-9]+)*$/,
  planId: /^SYNTH-PLAN-[A-Z0-9]+(?:-[A-Z0-9]+)*$/,
  routeId: /^SYNTH-ROUTE-[A-Z0-9]+(?:-[A-Z0-9]+)*$/,
});

function isObject(value) {
  return value !== null && typeof value === "object";
}

function isForbiddenField(field) {
  const normalized = field.toLowerCase().replace(/[_\-\s]/g, "");
  return FORBIDDEN_FIELDS.has(normalized) || /(?:note|notes|comment|comments)$/.test(normalized);
}

function inspect(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (
      DIRECT_IDENTIFIER.test(value) ||
      TRACKING_SHAPED.test(trimmed) ||
      PRECISE_COORDINATE.test(value) ||
      PERSON_NAME_SHAPED.test(trimmed) ||
      SENSITIVE_IDENTIFIER_SHAPED.test(trimmed)
    ) {
      failInput("PRIVACY_DIRECT_IDENTIFIER");
    }
    return;
  }

  if (typeof value === "number") {
    const integerText = Number.isInteger(value) ? String(Math.abs(value)) : "";
    if (TRACKING_SHAPED.test(integerText)) {
      failInput("PRIVACY_DIRECT_IDENTIFIER");
    }
    return;
  }

  if (!isObject(value)) return;
  if (Array.isArray(value)) {
    for (const member of value) inspect(member);
    return;
  }

  for (const [field, member] of Object.entries(value)) {
    if (isForbiddenField(field)) failInput("PRIVACY_FORBIDDEN_FIELD");
    const namespace = SYNTHETIC_ID_PATTERNS[field];
    if (
      namespace !== undefined &&
      (typeof member !== "string" || !namespace.test(member))
    ) {
      failInput("PRIVACY_UNAPPROVED_IDENTIFIER");
    }
    inspect(member);
  }
}

export function assertRawPublicSafe(value) {
  inspect(value);
}

export function assertPublicSafe(value) {
  assertRawPublicSafe(value);
}

export const syntheticIdPatterns = SYNTHETIC_ID_PATTERNS;
