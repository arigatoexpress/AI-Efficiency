import { failInput } from "./errors.mjs";
import { assertRawPublicSafe, syntheticIdPatterns } from "./privacy.mjs";
import {
  assertAvailableAtSnapshot,
  assertCalendarDate,
  assertEarlier,
  utcMillis,
} from "./time.mjs";

const MAX_INPUT_BYTES = 4 * 1024 * 1024;
const MAX_NUMBER = 1_000_000_000;
const DAY_MS = 24 * 60 * 60 * 1000;
const VERSION = /^[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*$/;

function isRecord(value) {
  return value !== null && !Array.isArray(value) && typeof value === "object";
}

function closedObject(value, fields, fieldPath) {
  if (!isRecord(value)) failInput("SCHEMA_INVALID_TYPE", fieldPath);
  const keys = Object.keys(value);
  if (keys.some((key) => !fields.includes(key))) {
    failInput("SCHEMA_UNKNOWN_FIELD", fieldPath);
  }
  if (fields.some((field) => !Object.hasOwn(value, field))) {
    failInput("SCHEMA_MISSING_FIELD", fieldPath);
  }
}

function boundedArray(value, minimum, maximum, fieldPath) {
  if (!Array.isArray(value)) failInput("SCHEMA_INVALID_TYPE", fieldPath);
  if (value.length < minimum) failInput("SCHEMA_MISSING_FIELD", fieldPath);
  if (value.length > maximum) failInput("SCHEMA_INPUT_SCOPE_EXCEEDED", fieldPath);
}

function exactString(value, expected, fieldPath) {
  if (value !== expected) failInput("SCHEMA_INVALID_VALUE", fieldPath);
}

function safeVersion(value, fieldPath) {
  if (
    typeof value !== "string" ||
    value.length < 1 ||
    value.length > 64 ||
    !VERSION.test(value)
  ) {
    failInput("SCHEMA_INVALID_VALUE", fieldPath);
  }
}

function syntheticId(value, kind, fieldPath) {
  if (typeof value !== "string" || !syntheticIdPatterns[kind].test(value)) {
    failInput("PRIVACY_UNAPPROVED_IDENTIFIER", fieldPath);
  }
}

function integer(value, minimum, maximum, fieldPath) {
  if (
    !Number.isSafeInteger(value) ||
    value < minimum ||
    value > maximum ||
    Math.abs(value) > MAX_NUMBER
  ) {
    failInput("SCHEMA_INVALID_NUMBER", fieldPath);
  }
}

function unique(values, fieldPath) {
  if (new Set(values).size !== values.length) {
    failInput("SCHEMA_DUPLICATE_IDENTIFIER", fieldPath);
  }
}

function validateProvenance(value) {
  const path = "provenance";
  closedObject(
    value,
    [
      "snapshotTime",
      "targetStart",
      "targetEnd",
      "serviceDate",
      "policyVersion",
      "modelVersion",
    ],
    path,
  );
  utcMillis(value.snapshotTime, path);
  utcMillis(value.targetStart, path);
  utcMillis(value.targetEnd, path);
  assertEarlier(value.targetStart, value.targetEnd, path);
  assertCalendarDate(value.serviceDate, path);
  safeVersion(value.policyVersion, path);
  safeVersion(value.modelVersion, path);
}

function validateForecast(value, snapshotTime) {
  const path = "forecast";
  closedObject(
    value,
    ["entityId", "quantityId", "unit", "seasonLength", "observations"],
    path,
  );
  syntheticId(value.entityId, "entityId", path);
  exactString(value.quantityId, "packages_tendered", path);
  exactString(value.unit, "packages", path);
  if (value.seasonLength !== 7) failInput("SCHEMA_INVALID_NUMBER", path);
  boundedArray(value.observations, 35, 730, "forecast.observations");

  const ids = [];
  const dates = [];
  for (const observation of value.observations) {
    closedObject(
      observation,
      ["observationId", "serviceDate", "availableAt", "value"],
      "forecast.observations",
    );
    syntheticId(
      observation.observationId,
      "observationId",
      "forecast.observations",
    );
    assertCalendarDate(observation.serviceDate, "forecast.observations");
    assertAvailableAtSnapshot(
      observation.availableAt,
      snapshotTime,
      "forecast.observations",
    );
    integer(observation.value, 0, MAX_NUMBER, "forecast.observations");
    ids.push(observation.observationId);
    dates.push(observation.serviceDate);
  }
  unique(ids, "forecast.observations");
  unique(dates, "forecast.observations");
  for (let index = 1; index < dates.length; index += 1) {
    if (dates[index - 1] >= dates[index]) {
      failInput("SCHEMA_INVALID_TIME_ORDER", "forecast.observations");
    }
    if (
      Date.parse(`${dates[index]}T00:00:00Z`) -
        Date.parse(`${dates[index - 1]}T00:00:00Z`) !==
      DAY_MS
    ) {
      failInput("SCHEMA_NONCONSECUTIVE_DATES", "forecast.observations");
    }
  }
}

function validateResources(value) {
  const path = "resources";
  closedObject(value, ["vehicles", "laborShifts"], path);
  boundedArray(value.vehicles, 1, 100, "resources.vehicles");
  boundedArray(value.laborShifts, 1, 100, "resources.laborShifts");

  for (const vehicle of value.vehicles) {
    closedObject(
      vehicle,
      [
        "vehicleId",
        "capacityUnits",
        "availableStart",
        "availableEnd",
        "maxRouteMinutes",
      ],
      "resources.vehicles",
    );
    syntheticId(vehicle.vehicleId, "vehicleId", "resources.vehicles");
    integer(vehicle.capacityUnits, 1, MAX_NUMBER, "resources.vehicles");
    assertEarlier(vehicle.availableStart, vehicle.availableEnd, "resources.vehicles");
    integer(vehicle.maxRouteMinutes, 1, 1_440, "resources.vehicles");
  }
  unique(value.vehicles.map(({ vehicleId }) => vehicleId), "resources.vehicles");

  for (const shift of value.laborShifts) {
    closedObject(
      shift,
      ["shiftId", "startTime", "endTime", "maxOnRoadMinutes"],
      "resources.laborShifts",
    );
    syntheticId(shift.shiftId, "shiftId", "resources.laborShifts");
    assertEarlier(shift.startTime, shift.endTime, "resources.laborShifts");
    integer(shift.maxOnRoadMinutes, 1, 1_440, "resources.laborShifts");
  }
  unique(value.laborShifts.map(({ shiftId }) => shiftId), "resources.laborShifts");
}

function validateDemandGroups(value) {
  const path = "demandGroups";
  boundedArray(value, 1, 100, path);
  for (const group of value) {
    closedObject(
      group,
      [
        "demandGroupId",
        "packages",
        "cubeUnits",
        "serviceMinutes",
        "windowStart",
        "windowEnd",
        "required",
      ],
      path,
    );
    syntheticId(group.demandGroupId, "demandGroupId", path);
    integer(group.packages, 0, MAX_NUMBER, path);
    integer(group.cubeUnits, 0, MAX_NUMBER, path);
    integer(group.serviceMinutes, 0, 1_440, path);
    assertEarlier(group.windowStart, group.windowEnd, path);
    if (typeof group.required !== "boolean") failInput("SCHEMA_INVALID_TYPE", path);
  }
  unique(value.map(({ demandGroupId }) => demandGroupId), path);
}

function validatePlans(value, snapshotTime) {
  const path = "plans";
  boundedArray(value, 1, 25, path);
  let routeCount = 0;
  let visitCount = 0;

  for (const plan of value) {
    closedObject(
      plan,
      ["planId", "planVersion", "snapshotTime", "releaseTime", "routes"],
      path,
    );
    syntheticId(plan.planId, "planId", path);
    safeVersion(plan.planVersion, path);
    utcMillis(plan.snapshotTime, path);
    if (plan.snapshotTime !== snapshotTime) {
      failInput("SCHEMA_PLAN_SNAPSHOT_MISMATCH", path);
    }
    utcMillis(plan.releaseTime, path);
    boundedArray(plan.routes, 1, 100, "plans.routes");
    routeCount += plan.routes.length;
    if (routeCount > 2_500) failInput("SCHEMA_INPUT_SCOPE_EXCEEDED", "plans.routes");

    for (const route of plan.routes) {
      closedObject(route, ["routeId", "vehicleId", "shiftId", "visits"], "plans.routes");
      syntheticId(route.routeId, "routeId", "plans.routes");
      syntheticId(route.vehicleId, "vehicleId", "plans.routes");
      syntheticId(route.shiftId, "shiftId", "plans.routes");
      boundedArray(route.visits, 0, 100, "plans.routes.visits");
      visitCount += route.visits.length;
      if (visitCount > 2_500) {
        failInput("SCHEMA_INPUT_SCOPE_EXCEEDED", "plans.routes.visits");
      }
      for (const visit of route.visits) {
        closedObject(
          visit,
          ["sequence", "demandGroupId", "arrivalTime", "departureTime"],
          "plans.routes.visits",
        );
        integer(visit.sequence, 1, 100, "plans.routes.visits");
        syntheticId(
          visit.demandGroupId,
          "demandGroupId",
          "plans.routes.visits",
        );
        utcMillis(visit.arrivalTime, "plans.routes.visits");
        utcMillis(visit.departureTime, "plans.routes.visits");
      }
      unique(route.visits.map(({ sequence }) => sequence), "plans.routes.visits");
    }
    unique(plan.routes.map(({ routeId }) => routeId), "plans.routes");
  }
  unique(value.map(({ planId }) => planId), path);
}

function validatePolicy(value) {
  closedObject(value, ["earliestReleaseTime"], "policy");
  utcMillis(value.earliestReleaseTime, "policy");
}

export function parseInputJson(text) {
  if (typeof text !== "string") failInput("SCHEMA_INVALID_JSON");
  if (Buffer.byteLength(text, "utf8") > MAX_INPUT_BYTES) {
    failInput("SCHEMA_INPUT_SCOPE_EXCEEDED");
  }

  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    failInput("SCHEMA_INVALID_JSON");
  }

  // Privacy is intentionally evaluated on the raw parsed value before any
  // schema validation, normalization, copying, sorting, or numeric conversion.
  assertRawPublicSafe(raw);

  closedObject(
    raw,
    [
      "schemaVersion",
      "provenance",
      "forecast",
      "resources",
      "demandGroups",
      "plans",
      "policy",
    ],
    "input",
  );
  exactString(raw.schemaVersion, "1.0.0", "input");
  validateProvenance(raw.provenance);
  validateForecast(raw.forecast, raw.provenance.snapshotTime);
  validateResources(raw.resources);
  validateDemandGroups(raw.demandGroups);
  validatePlans(raw.plans, raw.provenance.snapshotTime);
  validatePolicy(raw.policy);
  return raw;
}
