import assert from "node:assert/strict";
import test from "node:test";
import { evaluateFeasibility } from "../src/feasibility.mjs";
import { normalizePlans } from "../src/plan.mjs";

function bundle() {
  return {
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
    plan: {
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
    policy: { earliestReleaseTime: "2026-07-16T06:30:00Z" },
  };
}

function evaluate(transform = (value) => value) {
  const value = transform(structuredClone(bundle()));
  return evaluateFeasibility(value);
}

test("a supplied plan passing every hard constraint is feasible", () => {
  assert.deepEqual(evaluate(), {
    planId: "SYNTH-PLAN-01",
    status: "feasible",
    violations: [],
  });
});

test("capacity remains a hard infeasibility with exact evidence", () => {
  const result = evaluate((value) => {
    value.resources.vehicles[0].capacityUnits = 100;
    return value;
  });
  assert.deepEqual(result, {
    planId: "SYNTH-PLAN-01",
    status: "infeasible",
    violations: [
      {
        constraintCode: "capacity_exceeded",
        entityId: "SYNTH-ROUTE-01",
        observed: 200,
        limit: 100,
        unit: "cube_units",
      },
    ],
  });
});

test("missing and duplicate required assignments are both detected", () => {
  const missing = evaluate((value) => {
    value.plan.routes[0].visits = [];
    return value;
  });
  assert.equal(missing.violations[0].constraintCode, "missing_assignment");

  const duplicate = evaluate((value) => {
    value.plan.routes[0].visits.push({
      ...value.plan.routes[0].visits[0],
      sequence: 2,
      arrivalTime: "2026-07-16T10:00:00Z",
      departureTime: "2026-07-16T11:00:00Z",
    });
    return value;
  });
  assert.ok(duplicate.violations.some(({ constraintCode }) => constraintCode === "duplicate_assignment"));
});

test("resource, release, chronology, window, and duration constraints are independent", () => {
  const cases = [
    ["unknown_reference", (value) => (value.plan.routes[0].vehicleId = "SYNTH-VEHICLE-99")],
    ["vehicle_unavailable", (value) => (value.plan.releaseTime = "2026-07-16T05:30:00Z")],
    [
      "labor_unavailable",
      (value) => {
        value.resources.laborShifts[0].startTime = "2026-07-16T08:00:00Z";
      },
    ],
    [
      "release_before_allowed",
      (value) => {
        value.plan.releaseTime = "2026-07-16T06:15:00Z";
        value.resources.vehicles[0].availableStart = "2026-07-16T06:00:00Z";
      },
    ],
    [
      "backwards_time",
      (value) => {
        value.plan.routes[0].visits[0].departureTime = "2026-07-16T08:00:00Z";
      },
    ],
    [
      "service_window_miss",
      (value) => {
        value.plan.routes[0].visits[0].arrivalTime = "2026-07-16T12:30:00Z";
        value.plan.routes[0].visits[0].departureTime = "2026-07-16T13:30:00Z";
      },
    ],
    ["route_duration_exceeded", (value) => (value.resources.vehicles[0].maxRouteMinutes = 60)],
    ["labor_minutes_exceeded", (value) => (value.resources.laborShifts[0].maxOnRoadMinutes = 60)],
  ];

  for (const [expectedCode, mutate] of cases) {
    const result = evaluate((value) => {
      mutate(value);
      return value;
    });
    assert.ok(
      result.violations.some(({ constraintCode }) => constraintCode === expectedCode),
      expectedCode,
    );
  }
});

test("objective weights cannot make an infeasible plan feasible", () => {
  const first = evaluate((value) => {
    value.resources.vehicles[0].capacityUnits = 100;
    value.policy.objectiveWeights = { capacity: 0 };
    return value;
  });
  const second = evaluate((value) => {
    value.resources.vehicles[0].capacityUnits = 100;
    value.policy.objectiveWeights = { capacity: 1_000_000 };
    return value;
  });

  assert.deepEqual(first, second);
  assert.equal(first.status, "infeasible");
});

test("visit sequence is validated as supplied and is never silently repaired", () => {
  const result = evaluate((value) => {
    value.plan.routes[0].visits[0].sequence = 2;
    return value;
  });

  assert.ok(
    result.violations.some(
      ({ constraintCode }) => constraintCode === "sequence_invalid",
    ),
  );
  assert.equal(result.status, "infeasible");
});

test("plan normalization preserves supplied order, snapshots values, and freezes records", () => {
  const input = bundle();
  const plans = normalizePlans({
    plans: [input.plan],
    snapshot: "2026-07-15T12:00:00Z",
  });

  input.plan.routes[0].visits[0].sequence = 99;
  assert.equal(plans[0].routes[0].visits[0].sequence, 1);
  assert.throws(() => {
    plans[0].routes[0].visits[0].sequence = 2;
  }, TypeError);
  assert.throws(
    () => normalizePlans({ plans: [bundle().plan], snapshot: "2026-07-15T12:00:01Z" }),
    { code: "SCHEMA_PLAN_SNAPSHOT_MISMATCH" },
  );
});

test("fractional RFC 3339 timestamps are compared chronologically, not lexically", () => {
  const result = evaluate((value) => {
    value.demandGroups[0].windowStart = "2026-07-16T07:00:00Z";
    value.plan.routes[0].visits[0].arrivalTime = "2026-07-16T07:00:00.100Z";
    return value;
  });

  assert.equal(result.status, "feasible");
  assert.equal(
    result.violations.some(({ constraintCode }) => constraintCode === "backwards_time"),
    false,
  );
});

test("declared service minutes are a hard lower bound", () => {
  const result = evaluate((value) => {
    value.plan.routes[0].visits[0].departureTime = "2026-07-16T08:45:00Z";
    return value;
  });

  assert.ok(
    result.violations.some(
      ({ constraintCode, observed, limit, unit }) =>
        constraintCode === "service_duration_insufficient" &&
        observed === 15 &&
        limit === 60 &&
        unit === "minutes",
    ),
  );
});

test("overlapping routes cannot reuse the same vehicle or labor shift", () => {
  const result = evaluate((value) => {
    value.demandGroups.push({
      ...value.demandGroups[0],
      demandGroupId: "SYNTH-DEMAND-02",
    });
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

  assert.ok(result.violations.some(({ constraintCode }) => constraintCode === "vehicle_overlap"));
  assert.ok(result.violations.some(({ constraintCode }) => constraintCode === "labor_overlap"));
});

test("violation ordering is total beyond code and entity", () => {
  const result = evaluate((value) => {
    value.plan.routes[0].vehicleId = "SYNTH-VEHICLE-99";
    value.plan.routes[0].shiftId = "SYNTH-SHIFT-99";
    return value;
  });
  const unknowns = result.violations.filter(
    ({ constraintCode }) => constraintCode === "unknown_reference",
  );

  assert.deepEqual(
    unknowns.map(({ unit }) => unit),
    ["shift_id", "vehicle_id"],
  );
});
