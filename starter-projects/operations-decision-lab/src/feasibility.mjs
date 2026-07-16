function minutesBetween(start, end) {
  return (Date.parse(end) - Date.parse(start)) / 60_000;
}

function violation(constraintCode, entityId, observed, limit, unit) {
  return { constraintCode, entityId, observed, limit, unit };
}

function compareViolations(left, right) {
  return (
    left.constraintCode.localeCompare(right.constraintCode) ||
    left.entityId.localeCompare(right.entityId)
  );
}

export function evaluateFeasibility({ plan, resources, demandGroups, policy }) {
  const violations = [];
  const vehicles = new Map(resources.vehicles.map((vehicle) => [vehicle.vehicleId, vehicle]));
  const shifts = new Map(resources.laborShifts.map((shift) => [shift.shiftId, shift]));
  const demand = new Map(demandGroups.map((group) => [group.demandGroupId, group]));
  const assignments = new Map();

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

  if (plan.releaseTime < policy.earliestReleaseTime) {
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
        violation("unknown_reference", route.routeId, null, null, "vehicle"),
      );
    }
    if (shift === undefined) {
      violations.push(
        violation("unknown_reference", route.routeId, null, null, "labor_shift"),
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
          violation("unknown_reference", visit.demandGroupId, null, null, "demand_group"),
        );
      } else {
        routeCube += group.cubeUnits;
        if (visit.arrivalTime < group.windowStart || visit.departureTime > group.windowEnd) {
          violations.push(
            violation(
              "service_window_miss",
              visit.demandGroupId,
              visit.arrivalTime,
              `${group.windowStart}/${group.windowEnd}`,
              "timestamp",
            ),
          );
        }
      }

      if (
        visit.departureTime < visit.arrivalTime ||
        visit.arrivalTime < previousDeparture
      ) {
        violations.push(
          violation("backwards_time", route.routeId, null, null, "timestamp"),
        );
      }
      previousDeparture = visit.departureTime;
      if (visit.departureTime > lastDeparture) lastDeparture = visit.departureTime;
    }

    if (vehicle !== undefined) {
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
        plan.releaseTime < vehicle.availableStart ||
        lastDeparture > vehicle.availableEnd
      ) {
        violations.push(
          violation(
            "vehicle_unavailable",
            route.routeId,
            null,
            null,
            "timestamp",
          ),
        );
      }
    }

    if (shift !== undefined) {
      if (plan.releaseTime < shift.startTime || lastDeparture > shift.endTime) {
        violations.push(
          violation(
            "labor_unavailable",
            route.routeId,
            null,
            null,
            "timestamp",
          ),
        );
      }
      const onRoadMinutes = minutesBetween(plan.releaseTime, lastDeparture);
      const limit = Math.min(
        shift.maxOnRoadMinutes,
        vehicle?.maxRouteMinutes ?? Number.POSITIVE_INFINITY,
      );
      if (onRoadMinutes > limit) {
        violations.push(
          violation(
            "on_road_limit_exceeded",
            route.routeId,
            onRoadMinutes,
            limit,
            "minutes",
          ),
        );
      }
    }
  }

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
