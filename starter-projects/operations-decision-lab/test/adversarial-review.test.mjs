import assert from "node:assert/strict";
import test from "node:test";
import { analyzeDecisionLab } from "../src/analyze.mjs";
import { rollingOriginBacktest } from "../src/backtest.mjs";
import { evaluateFeasibility } from "../src/feasibility.mjs";
import { stableJson } from "../src/render.mjs";
import { parseInputJson } from "../src/schema.mjs";

// T047 independent review: adversarial pins for contract boundaries that the
// phase suites did not cover. Each case names the boundary it proves.

function isoDay(index) {
  return new Date(Date.UTC(2026, 5, 1 + index)).toISOString().slice(0, 10);
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

function bundle() {
  const input = validInput();
  return {
    resources: input.resources,
    demandGroups: input.demandGroups,
    plan: input.plans[0],
    policy: input.policy,
  };
}

function evaluate(transform = (value) => value) {
  return evaluateFeasibility(transform(structuredClone(bundle())));
}

test("tracking-shaped numeric values are privacy-rejected before numeric bounds", () => {
  const input = validInput();
  input.demandGroups[0].packages = 123_456_789_012;
  assert.throws(() => parseInputJson(JSON.stringify(input)), (error) => {
    assert.equal(error.code, "PRIVACY_DIRECT_IDENTIFIER");
    assert.doesNotMatch(error.message, /123456789012/);
    return true;
  });

  assert.throws(() => parseInputJson("123456789012"), (error) => {
    assert.equal(error.code, "PRIVACY_DIRECT_IDENTIFIER");
    assert.doesNotMatch(error.message, /123456789012/);
    return true;
  });
});

test("non-object top-level JSON fails closed with safe codes only", () => {
  for (const text of ["[]", "[1,2,3]", '"plain text"', "null", "true", "42"]) {
    assert.throws(
      () => parseInputJson(text),
      (error) => {
        assert.equal(error.code, "SCHEMA_INVALID_TYPE");
        assert.equal(error.fieldPath, "input");
        return true;
      },
      text,
    );
  }
});

test("a record available exactly at the snapshot passes the inclusive fence", () => {
  const input = validInput();
  input.forecast.observations[0].availableAt = "2026-07-15T12:00:00Z";
  assert.doesNotThrow(() => parseInputJson(JSON.stringify(input)));

  input.forecast.observations[0].availableAt = "2026-07-15T12:00:00.001Z";
  assert.throws(() => parseInputJson(JSON.stringify(input)), {
    code: "SCHEMA_FUTURE_INFORMATION",
  });
});

test("an arrival before the previous visit departure is a hard chronology violation", () => {
  const result = evaluate((value) => {
    value.demandGroups.push({
      ...value.demandGroups[0],
      demandGroupId: "SYNTH-DEMAND-02",
    });
    value.plan.routes[0].visits.push({
      sequence: 2,
      demandGroupId: "SYNTH-DEMAND-02",
      arrivalTime: "2026-07-16T09:00:00Z",
      departureTime: "2026-07-16T10:00:00Z",
    });
    return value;
  });

  assert.ok(
    result.violations.some(
      ({ constraintCode, entityId }) =>
        constraintCode === "backwards_time" && entityId === "SYNTH-ROUTE-01",
    ),
  );
  assert.equal(result.status, "infeasible");
});

test("a strictly nested route interval still overlaps the same vehicle and shift", () => {
  const result = evaluate((value) => {
    value.demandGroups.push({
      ...value.demandGroups[0],
      demandGroupId: "SYNTH-DEMAND-02",
    });
    value.plan.routes[0].visits[0].arrivalTime = "2026-07-16T08:00:00Z";
    value.plan.routes[0].visits[0].departureTime = "2026-07-16T12:00:00Z";
    value.plan.routes.push({
      routeId: "SYNTH-ROUTE-02",
      vehicleId: "SYNTH-VEHICLE-01",
      shiftId: "SYNTH-SHIFT-01",
      visits: [
        {
          sequence: 1,
          demandGroupId: "SYNTH-DEMAND-02",
          arrivalTime: "2026-07-16T09:00:00Z",
          departureTime: "2026-07-16T10:00:00Z",
        },
      ],
    });
    return value;
  });

  assert.ok(
    result.violations.some(({ constraintCode }) => constraintCode === "vehicle_overlap"),
  );
  assert.ok(
    result.violations.some(({ constraintCode }) => constraintCode === "labor_overlap"),
  );
});

test("every hard-constraint boundary is inclusive at exact equality", () => {
  const result = evaluate((value) => {
    value.policy.earliestReleaseTime = "2026-07-16T08:00:00Z";
    value.resources.vehicles[0].capacityUnits = 200;
    value.resources.vehicles[0].availableStart = "2026-07-16T08:00:00Z";
    value.resources.vehicles[0].availableEnd = "2026-07-16T12:00:00Z";
    value.resources.vehicles[0].maxRouteMinutes = 240;
    value.resources.laborShifts[0].startTime = "2026-07-16T08:00:00Z";
    value.resources.laborShifts[0].endTime = "2026-07-16T12:00:00Z";
    value.resources.laborShifts[0].maxOnRoadMinutes = 240;
    value.demandGroups[0].serviceMinutes = 240;
    value.plan.releaseTime = "2026-07-16T08:00:00Z";
    value.plan.routes[0].visits[0].arrivalTime = "2026-07-16T08:00:00Z";
    value.plan.routes[0].visits[0].departureTime = "2026-07-16T12:00:00Z";
    return value;
  });

  assert.deepEqual(result, {
    planId: "SYNTH-PLAN-01",
    status: "feasible",
    violations: [],
  });
});

test("supplied plan order cannot change the published analysis", () => {
  const second = structuredClone(validInput().plans[0]);
  second.planId = "SYNTH-PLAN-02";
  second.routes[0].routeId = "SYNTH-ROUTE-02";

  const ordered = validInput();
  ordered.plans.push(structuredClone(second));
  const shuffled = validInput();
  shuffled.plans.unshift(structuredClone(second));

  const left = analyzeDecisionLab(parseInputJson(JSON.stringify(ordered)));
  const right = analyzeDecisionLab(parseInputJson(JSON.stringify(shuffled)));

  assert.equal(stableJson(left), stableJson(right));
  assert.deepEqual(
    left.feasibility.map(({ planId }) => planId),
    ["SYNTH-PLAN-01", "SYNTH-PLAN-02"],
  );
});

test("a backtest with no snapshot-eligible history fails closed", () => {
  const observations = Array.from({ length: 35 }, (_, index) => ({
    observationId: `SYNTH-OBS-${String(index + 1).padStart(3, "0")}`,
    serviceDate: isoDay(index),
    availableAt: `${isoDay(index)}T23:00:00Z`,
    value: 100 + index,
  }));

  assert.throws(
    () =>
      rollingOriginBacktest({
        observations,
        snapshotTime: "2026-05-01T00:00:00Z",
        seasonLength: 7,
        alpha: 0.5,
        beta: 0.25,
      }),
    { code: "BACKTEST_INVALID_INPUT" },
  );
});
