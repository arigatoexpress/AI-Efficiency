import { utcMillis } from "./time.mjs";

function minutesBetween(start, end) {
  return (utcMillis(end) - utcMillis(start)) / 60_000;
}

function violation(constraintCode, entityId, observed, limit, unit) {
  return { constraintCode, entityId, observed, limit, unit };
}

function compareViolations(left, right) {
  return (
    left.constraintCode.localeCompare(right.constraintCode) ||
    left.entityId.localeCompare(right.entityId) ||
    left.unit.localeCompare(right.unit) ||
    JSON.stringify(left.observed).localeCompare(JSON.stringify(right.observed)) ||
    JSON.stringify(left.limit).localeCompare(JSON.stringify(right.limit))
  );
}

function recordUsage(usages, resourceId, interval) {
  const current = usages.get(resourceId) ?? [];
  current.push(interval);
  usages.set(resourceId, current);
}

function addOverlapViolations(violations, usages, constraintCode, unit) {
  for (const intervals of usages.values()) {
    for (let rightIndex = 1; rightIndex < intervals.length; rightIndex += 1) {
      const right = intervals[rightIndex];
      for (let leftIndex = 0; leftIndex < rightIndex; leftIndex += 1) {
        const left = intervals[leftIndex];
        if (utcMillis(left.start) < utcMillis(right.end) && utcMillis(right.start) < utcMillis(left.end)) {
          violations.push(
            violation(
              constraintCode,
              right.routeId,
              `${right.start}/${right.end}`,
              `${left.routeId}:${left.start}/${left.end}`,
              unit,
            ),
          );
        }
      }
    }
  }
}

export function evaluateFeasibility({ plan, resources, demandGroups, policy }) {
  const violations = [];
  const vehicles = new Map(resources.vehicles.map((vehicle) => [vehicle.vehicleId, vehicle]));
  const shifts = new Map(resources.laborShifts.map((shift) => [shift.shiftId, shift]));
  const demand = new Map(demandGroups.map((group) => [group.demandGroupId, group]));
  const assignments = new Map();
  const vehicleUsages = new Map();
  const laborUsages = new Map();

  for (const group of demandGroups) {
    for (const [field, unit] of [
      ["packages", "packages"],
      ["cubeUnits", "cube_units"],
      ["serviceMinutes", "minutes"],
    ]) {
      if (group[field] < 0) {
        violations.push(
          violation("negative_quantity", group.demandGroupId, group[field], 0, unit),
        );
      }
    }
  }

  if (utcMillis(plan.releaseTime) < utcMillis(policy.earliestReleaseTime)) {
    violations.push(
      violation(
        "release_before_allowed",
        plan.planId,
        plan.releaseTime,
        policy.earliestReleaseTime,
        "timestamp",
      ),
    );
  }

  for (const route of plan.routes) {
    const vehicle = vehicles.get(route.vehicleId);
    const shift = shifts.get(route.shiftId);
    if (vehicle === undefined) {
      violations.push(
        violation(
          "unknown_reference",
          route.routeId,
          route.vehicleId,
          "known_vehicle",
          "vehicle_id",
        ),
      );
    }
    if (shift === undefined) {
      violations.push(
        violation(
          "unknown_reference",
          route.routeId,
          route.shiftId,
          "known_labor_shift",
          "shift_id",
        ),
      );
    }

    let routeCube = 0;
    let previousDeparture = plan.releaseTime;
    let lastDeparture = plan.releaseTime;
    for (const [visitIndex, visit] of route.visits.entries()) {
      if (visit.sequence !== visitIndex + 1) {
        violations.push(
          violation(
            "sequence_invalid",
            route.routeId,
            visit.sequence,
            visitIndex + 1,
            "sequence",
          ),
        );
      }
      assignments.set(
        visit.demandGroupId,
        (assignments.get(visit.demandGroupId) ?? 0) + 1,
      );
      const group = demand.get(visit.demandGroupId);
      if (group === undefined) {
        violations.push(
          violation(
            "unknown_reference",
            visit.demandGroupId,
            visit.demandGroupId,
            "known_demand_group",
            "demand_group_id",
          ),
        );
      } else {
        routeCube += group.cubeUnits;
        if (
          utcMillis(visit.arrivalTime) < utcMillis(group.windowStart) ||
          utcMillis(visit.departureTime) > utcMillis(group.windowEnd)
        ) {
          violations.push(
            violation(
              "service_window_miss",
              visit.demandGroupId,
              `${visit.arrivalTime}/${visit.departureTime}`,
              `${group.windowStart}/${group.windowEnd}`,
              "timestamp_interval",
            ),
          );
        }
        const serviceDuration = minutesBetween(
          visit.arrivalTime,
          visit.departureTime,
        );
        if (serviceDuration < group.serviceMinutes) {
          violations.push(
            violation(
              "service_duration_insufficient",
              visit.demandGroupId,
              serviceDuration,
              group.serviceMinutes,
              "minutes",
            ),
          );
        }
      }

      if (
        utcMillis(visit.departureTime) < utcMillis(visit.arrivalTime) ||
        utcMillis(visit.arrivalTime) < utcMillis(previousDeparture)
      ) {
        violations.push(
          violation(
            "backwards_time",
            route.routeId,
            `${visit.arrivalTime}/${visit.departureTime}`,
            `not_before/${previousDeparture}`,
            "timestamp_order",
          ),
        );
      }
      previousDeparture = visit.departureTime;
      if (utcMillis(visit.departureTime) > utcMillis(lastDeparture)) {
        lastDeparture = visit.departureTime;
      }
    }

    if (vehicle !== undefined) {
      recordUsage(vehicleUsages, vehicle.vehicleId, {
        routeId: route.routeId,
        start: plan.releaseTime,
        end: lastDeparture,
      });
      if (routeCube > vehicle.capacityUnits) {
        violations.push(
          violation(
            "capacity_exceeded",
            route.routeId,
            routeCube,
            vehicle.capacityUnits,
            "cube_units",
          ),
        );
      }
      if (
        utcMillis(plan.releaseTime) < utcMillis(vehicle.availableStart) ||
        utcMillis(lastDeparture) > utcMillis(vehicle.availableEnd)
      ) {
        violations.push(
          violation(
            "vehicle_unavailable",
            route.routeId,
            `${plan.releaseTime}/${lastDeparture}`,
            `${vehicle.availableStart}/${vehicle.availableEnd}`,
            "timestamp_interval",
          ),
        );
      }
    }

    if (shift !== undefined) {
      recordUsage(laborUsages, shift.shiftId, {
        routeId: route.routeId,
        start: plan.releaseTime,
        end: lastDeparture,
      });
      if (
        utcMillis(plan.releaseTime) < utcMillis(shift.startTime) ||
        utcMillis(lastDeparture) > utcMillis(shift.endTime)
      ) {
        violations.push(
          violation(
            "labor_unavailable",
            route.routeId,
            `${plan.releaseTime}/${lastDeparture}`,
            `${shift.startTime}/${shift.endTime}`,
            "timestamp_interval",
          ),
        );
      }
      const onRoadMinutes = minutesBetween(plan.releaseTime, lastDeparture);
      if (onRoadMinutes > shift.maxOnRoadMinutes) {
        violations.push(
          violation(
            "labor_minutes_exceeded",
            route.routeId,
            onRoadMinutes,
            shift.maxOnRoadMinutes,
            "minutes",
          ),
        );
      }
    }

    if (vehicle !== undefined) {
      const routeMinutes = minutesBetween(plan.releaseTime, lastDeparture);
      if (routeMinutes > vehicle.maxRouteMinutes) {
        violations.push(
          violation(
            "route_duration_exceeded",
            route.routeId,
            routeMinutes,
            vehicle.maxRouteMinutes,
            "minutes",
          ),
        );
      }
    }
  }

  addOverlapViolations(
    violations,
    vehicleUsages,
    "vehicle_overlap",
    "timestamp_interval",
  );
  addOverlapViolations(
    violations,
    laborUsages,
    "labor_overlap",
    "timestamp_interval",
  );

  for (const group of demandGroups) {
    const count = assignments.get(group.demandGroupId) ?? 0;
    if (group.required && count === 0) {
      violations.push(
        violation("missing_assignment", group.demandGroupId, 0, 1, "assignments"),
      );
    } else if (count > 1) {
      violations.push(
        violation("duplicate_assignment", group.demandGroupId, count, 1, "assignments"),
      );
    }
  }

  violations.sort(compareViolations);
  return {
    planId: plan.planId,
    status: violations.length === 0 ? "feasible" : "infeasible",
    violations,
  };
}
