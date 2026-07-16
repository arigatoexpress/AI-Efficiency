import { rollingOriginBacktest } from "./backtest.mjs";
import { evaluateFeasibility } from "./feasibility.mjs";
import { normalizePlans } from "./plan.mjs";

const LEVEL_TREND_ALPHA = 0.5;
const LEVEL_TREND_BETA = 0.25;

export function analyzeDecisionLab(
  input,
  { analyzerVersion = "0.1.0", dataClassification = "synthetic" } = {},
) {
  const plans = normalizePlans({
    plans: input.plans,
    snapshot: input.provenance.snapshotTime,
  });
  const backtest = rollingOriginBacktest({
    observations: input.forecast.observations,
    snapshotTime: input.provenance.snapshotTime,
    seasonLength: input.forecast.seasonLength,
    alpha: LEVEL_TREND_ALPHA,
    beta: LEVEL_TREND_BETA,
  });
  const routeCount = plans.reduce((total, plan) => total + plan.routes.length, 0);
  const visitCount = plans.reduce(
    (total, plan) =>
      total +
      plan.routes.reduce(
        (planTotal, route) => planTotal + route.visits.length,
        0,
      ),
    0,
  );

  const feasibility = plans
    .map((plan) => ({
      planVersion: plan.planVersion,
      snapshotTime: plan.snapshotTime,
      ...evaluateFeasibility({
        plan,
        resources: input.resources,
        demandGroups: input.demandGroups,
        policy: input.policy,
      }),
    }))
    .sort((left, right) => left.planId.localeCompare(right.planId));

  return {
    schemaVersion: "1.0.0",
    analyzerVersion,
    provenance: {
      dataClassification,
      snapshotTime: input.provenance.snapshotTime,
      targetStart: input.provenance.targetStart,
      targetEnd: input.provenance.targetEnd,
      serviceDate: input.provenance.serviceDate,
      policyVersion: input.provenance.policyVersion,
      modelVersion: input.provenance.modelVersion,
    },
    validation: {
      result: "passed",
      observationCount: input.forecast.observations.length,
      vehicleCount: input.resources.vehicles.length,
      laborShiftCount: input.resources.laborShifts.length,
      demandGroupCount: input.demandGroups.length,
      planCount: plans.length,
      routeCount,
      visitCount,
    },
    forecasts: {
      entityId: input.forecast.entityId,
      quantityId: input.forecast.quantityId,
      unit: input.forecast.unit,
      parameters: {
        seasonLength: input.forecast.seasonLength,
        levelTrendAlpha: LEVEL_TREND_ALPHA,
        levelTrendBeta: LEVEL_TREND_BETA,
      },
      winner: null,
      models: backtest.models.map(({ model, forecast, evaluation }) => ({
        model,
        forecast,
        evaluation,
      })),
    },
    feasibility,
    limitations: [
      "baseline_models_only",
      "single_series_no_model_selection",
      "supplied_plans_only",
    ],
    methods: [
      "availability_filtered_expanding_rolling_origin",
      "fixed_policy_level_trend",
      "independent_hard_constraint_oracle",
      "nonnegative_ordered_quantile_repair",
      "sequential_empirical_residual_quantiles",
    ],
  };
}
