import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseInputJson } from "../src/schema.mjs";

const contract = JSON.parse(
  readFileSync(
    new URL(
      "../../../specs/002-operations-decision-lab/contracts/input.schema.json",
      import.meta.url,
    ),
    "utf8",
  ),
);

function isoDay(index) {
  const date = new Date(Date.UTC(2026, 5, 1 + index));
  return date.toISOString().slice(0, 10);
}

function validInput() {
  return {
    schemaVersion: "1.0.0",
    provenance: {
      snapshotTime: "2026-07-15T12:00:00Z",
      targetStart: "2026-07-16T00:00:00Z",
      targetEnd: "2026-07-17T00:00:00Z",
      serviceDate: "2026-07-16",
      policyVersion: "policy-v1",
      modelVersion: "baseline-v1",
    },
    forecast: {
      entityId: "SYNTH-STATION-01",
      quantityId: "packages_tendered",
      unit: "packages",
      seasonLength: 7,
      observations: Array.from({ length: 35 }, (_, index) => ({
        observationId: `SYNTH-OBS-${String(index + 1).padStart(3, "0")}`,
        serviceDate: isoDay(index),
        availableAt: `${isoDay(index)}T23:00:00Z`,
        value: 100 + index,
      })),
    },
    resources: {
      vehicles: [
        {
          vehicleId: "SYNTH-VEHICLE-01",
          capacityUnits: 500,
          availableStart: "2026-07-16T06:00:00Z",
          availableEnd: "2026-07-16T18:00:00Z",
          maxRouteMinutes: 600,
        },
      ],
      laborShifts: [
        {
          shiftId: "SYNTH-SHIFT-01",
          startTime: "2026-07-16T06:00:00Z",
          endTime: "2026-07-16T18:00:00Z",
          maxOnRoadMinutes: 600,
        },
      ],
    },
    demandGroups: [
      {
        demandGroupId: "SYNTH-DEMAND-01",
        packages: 120,
        cubeUnits: 200,
        serviceMinutes: 60,
        windowStart: "2026-07-16T08:00:00Z",
        windowEnd: "2026-07-16T12:00:00Z",
        required: true,
      },
    ],
    plans: [
      {
        planId: "SYNTH-PLAN-01",
        planVersion: "plan-v1",
        snapshotTime: "2026-07-15T12:00:00Z",
        releaseTime: "2026-07-16T07:00:00Z",
        routes: [
          {
            routeId: "SYNTH-ROUTE-01",
            vehicleId: "SYNTH-VEHICLE-01",
            shiftId: "SYNTH-SHIFT-01",
            visits: [
              {
                sequence: 1,
                demandGroupId: "SYNTH-DEMAND-01",
                arrivalTime: "2026-07-16T08:30:00Z",
                departureTime: "2026-07-16T09:30:00Z",
              },
            ],
          },
        ],
      },
    ],
    policy: { earliestReleaseTime: "2026-07-16T06:30:00Z" },
  };
}

function parse(value) {
  return parseInputJson(JSON.stringify(value));
}

test("closed synthetic input normalizes without widening the contract", () => {
  const input = validInput();
  assert.deepEqual(parse(input), input);
});

test("unknown and forbidden fields fail closed without echoing values", () => {
  const unknown = validInput();
  unknown.forecast.extra = "not-secret";
  assert.throws(() => parse(unknown), { code: "SCHEMA_UNKNOWN_FIELD" });

  const forbidden = validInput();
  forbidden.plans[0].driverName = "REJECTED PERSON";
  assert.throws(() => parse(forbidden), (error) => {
    assert.equal(error.code, "PRIVACY_FORBIDDEN_FIELD");
    assert.doesNotMatch(error.message, /driverName|REJECTED PERSON/);
    return true;
  });
});

test("entity identifiers require declared synthetic namespaces", () => {
  const input = validInput();
  input.resources.vehicles[0].vehicleId = "denver_vehicle";
  assert.throws(() => parse(input), (error) => {
    assert.equal(error.code, "PRIVACY_UNAPPROVED_IDENTIFIER");
    assert.doesNotMatch(error.message, /denver_vehicle/);
    return true;
  });

  const locationShaped = validInput();
  locationShaped.forecast.entityId = "SYNTH-STATION-DENVER";
  assert.throws(() => parse(locationShaped), {
    code: "PRIVACY_UNAPPROVED_IDENTIFIER",
  });
});

test("availability time, not service date alone, enforces the snapshot fence", () => {
  const input = validInput();
  input.forecast.observations[0].availableAt = "2026-07-15T12:00:01Z";
  assert.throws(() => parse(input), { code: "SCHEMA_FUTURE_INFORMATION" });
});

test("timestamps and target intervals are exact and ordered", () => {
  const malformed = validInput();
  malformed.provenance.snapshotTime = "2026-07-15 12:00";
  assert.throws(() => parse(malformed), { code: "SCHEMA_INVALID_TIMESTAMP" });

  const backwards = validInput();
  backwards.provenance.targetEnd = backwards.provenance.targetStart;
  assert.throws(() => parse(backwards), { code: "SCHEMA_INVALID_TIME_ORDER" });

  const gap = validInput();
  for (let index = 11; index < gap.forecast.observations.length; index += 1) {
    gap.forecast.observations[index].serviceDate = isoDay(index + 1);
  }
  assert.throws(() => parse(gap), { code: "SCHEMA_NONCONSECUTIVE_DATES" });

  const mismatchedPlan = validInput();
  mismatchedPlan.plans[0].snapshotTime = "2026-07-15T11:59:59Z";
  assert.throws(() => parse(mismatchedPlan), {
    code: "SCHEMA_PLAN_SNAPSHOT_MISMATCH",
  });
});

test("record counts and numeric magnitudes are bounded", () => {
  const tooMany = validInput();
  tooMany.forecast.observations = Array.from({ length: 731 }, (_, index) => ({
    observationId: `SYNTH-OBS-${String(index + 1).padStart(4, "0")}`,
    serviceDate: "2026-06-01",
    availableAt: "2026-06-01T23:00:00Z",
    value: 1,
  }));
  assert.throws(() => parse(tooMany), { code: "SCHEMA_INPUT_SCOPE_EXCEEDED" });

  const unsafeNumber = validInput();
  unsafeNumber.demandGroups[0].packages = 1_000_000_001;
  assert.throws(() => parse(unsafeNumber), { code: "SCHEMA_INVALID_NUMBER" });
});

test("direct-identifier-shaped values are privacy-rejected without echo", () => {
  const input = validInput();
  input.plans[0].planVersion = "contact@example.invalid";
  assert.throws(() => parse(input), (error) => {
    assert.equal(error.code, "PRIVACY_DIRECT_IDENTIFIER");
    assert.doesNotMatch(error.message, /contact@example\.invalid/);
    return true;
  });
});

test("published input contract is nested-closed and preserves the exact forecast tuple", () => {
  const objectSchemas = [contract, ...Object.values(contract.$defs)].filter(
    (schema) => schema.type === "object",
  );
  assert.ok(objectSchemas.length > 1);
  for (const schema of objectSchemas) {
    assert.equal(schema.additionalProperties, false, schema.title ?? "nested object");
  }

  assert.equal(contract.properties.schemaVersion.const, "1.0.0");
  assert.equal(contract.$defs.forecast.properties.quantityId.const, "packages_tendered");
  assert.equal(contract.$defs.forecast.properties.unit.const, "packages");
  assert.equal(contract.$defs.forecast.properties.seasonLength.const, 7);

  const nestedMutation = validInput();
  nestedMutation.plans[0].routes[0].visits[0].repair = true;
  assert.throws(() => parse(nestedMutation), { code: "SCHEMA_UNKNOWN_FIELD" });
});

test("duplicate JSON members cannot overwrite hidden unsafe values", () => {
  const text = JSON.stringify(validInput()).replace(
    '"entityId":"SYNTH-STATION-01"',
    '"entityId":"contact@example.invalid","entity\\u0049d":"SYNTH-STATION-01"',
  );
  assert.throws(() => parseInputJson(text), (error) => {
    assert.equal(error.code, "SCHEMA_DUPLICATE_JSON_MEMBER");
    assert.doesNotMatch(error.message, /contact@example\.invalid/);
    return true;
  });
});
