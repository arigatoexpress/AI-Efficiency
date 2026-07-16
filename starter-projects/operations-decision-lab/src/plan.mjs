import { failInput } from "./errors.mjs";

function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  for (const member of Object.values(value)) deepFreeze(member);
  return Object.freeze(value);
}

export function normalizePlans({ plans, snapshot }) {
  if (!Array.isArray(plans) || plans.length === 0) {
    failInput("SCHEMA_MISSING_FIELD", "plans");
  }
  if (plans.some((plan) => plan.snapshotTime !== snapshot)) {
    failInput("SCHEMA_PLAN_SNAPSHOT_MISMATCH", "plans");
  }

  return deepFreeze(structuredClone(plans));
}
