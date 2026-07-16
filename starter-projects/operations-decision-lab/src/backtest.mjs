import { forecastBaselines } from "./forecast.mjs";

const DAY_MS = 24 * 60 * 60 * 1000;
const QUANTILES = [
  ["p10", 0.1],
  ["p25", 0.25],
  ["p50", 0.5],
  ["p75", 0.75],
  ["p90", 0.9],
];

function invalidInput() {
  const error = new Error("Backtest input is invalid.");
  error.code = "BACKTEST_INVALID_INPUT";
  return error;
}

function mean(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function dateTimestamp(serviceDate) {
  const timestamp = Date.parse(`${serviceDate}T00:00:00Z`);
  if (!Number.isFinite(timestamp)) throw invalidInput();
  return timestamp;
}

function foldSnapshot(serviceDate) {
  return `${serviceDate}T00:00:00Z`;
}

function isConsecutiveHistory(observations) {
  return observations.every(
    (observation, index) =>
      index === 0 ||
      dateTimestamp(observation.serviceDate) -
          dateTimestamp(observations[index - 1].serviceDate) ===
        DAY_MS,
  );
}

function empiricalQuantile(values, probability) {
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.max(0, Math.ceil(probability * ordered.length) - 1)];
}

function calibratedQuantiles(point, residuals) {
  if (residuals.length === 0) {
    return {
      p10: null,
      p25: null,
      p50: null,
      p75: null,
      p90: null,
      quantileRepaired: false,
    };
  }

  let previous = 0;
  let repaired = false;
  const result = {};

  for (const [name, probability] of QUANTILES) {
    const raw = point + empiricalQuantile(residuals, probability);
    const nonnegative = Math.max(0, raw);
    const ordered = Math.max(previous, nonnegative);
    if (ordered !== raw) repaired = true;
    result[name] = ordered;
    previous = ordered;
  }

  return { ...result, quantileRepaired: repaired };
}

function pinballLoss(actual, forecast, probability) {
  const residual = actual - forecast;
  const complement = Math.round((1 - probability) * 100) / 100;
  return residual >= 0
    ? probability * residual
    : complement * -residual;
}

function naiveScale(observations, seasonLength) {
  if (observations.length <= seasonLength) {
    return { value: null, limitation: "insufficient_scale_history" };
  }

  const differences = [];
  for (let index = seasonLength; index < observations.length; index += 1) {
    differences.push(
      Math.abs(observations[index].value - observations[index - seasonLength].value),
    );
  }
  const scale = mean(differences);
  return scale === 0
    ? { value: null, limitation: "zero_scale" }
    : { value: scale, limitation: null };
}

function evaluateFolds(folds, observations, seasonLength) {
  const scored = folds.filter(({ point }) => point !== null);
  const calibrated = scored.filter(({ p10 }) => p10 !== null);
  const residuals = scored.map(({ actual, point }) => actual - point);
  const scale = naiveScale(observations, seasonLength);
  const limitations = [];

  if (scored.length === 0) limitations.push("insufficient_backtest_folds");
  if (calibrated.length === 0) limitations.push("insufficient_calibration");

  const pinball = Object.fromEntries(
    QUANTILES.map(([name, probability]) => [
      name,
      calibrated.length === 0
        ? null
        : mean(
            calibrated.map((fold) =>
              pinballLoss(fold.actual, fold[name], probability),
            ),
          ),
    ]),
  );

  const mae =
    residuals.length === 0 ? null : mean(residuals.map((value) => Math.abs(value)));

  return {
    foldCount: scored.length,
    observationCount: observations.length,
    mae,
    bias: residuals.length === 0 ? null : mean(residuals),
    mase: mae === null || scale.value === null ? null : mae / scale.value,
    maseLimitation: scale.limitation,
    pinball,
    coverage50:
      calibrated.length === 0
        ? null
        : mean(
            calibrated.map(({ actual, p25, p75 }) =>
              actual >= p25 && actual <= p75 ? 1 : 0,
            ),
          ),
    coverage80:
      calibrated.length === 0
        ? null
        : mean(
            calibrated.map(({ actual, p10, p90 }) =>
              actual >= p10 && actual <= p90 ? 1 : 0,
            ),
          ),
    meanWidth50:
      calibrated.length === 0
        ? null
        : mean(calibrated.map(({ p25, p75 }) => p75 - p25)),
    meanWidth80:
      calibrated.length === 0
        ? null
        : mean(calibrated.map(({ p10, p90 }) => p90 - p10)),
    coherence: "not_applicable_single_series",
    limitations,
  };
}

function assertInput(input) {
  if (
    !input ||
    typeof input !== "object" ||
    !Array.isArray(input.observations) ||
    !Number.isFinite(Date.parse(input.snapshotTime)) ||
    input.seasonLength !== 7 ||
    !Number.isFinite(input.alpha) ||
    !Number.isFinite(input.beta)
  ) {
    throw invalidInput();
  }
}

export function rollingOriginBacktest(input) {
  assertInput(input);
  const { observations, snapshotTime, seasonLength, alpha, beta } = input;
  const snapshotTimestamp = Date.parse(snapshotTime);
  const eligible = observations
    .filter(({ availableAt }) => Date.parse(availableAt) <= snapshotTimestamp)
    .sort(
      (left, right) =>
        dateTimestamp(left.serviceDate) - dateTimestamp(right.serviceDate) ||
        left.observationId.localeCompare(right.observationId),
    );

  const modelEvidence = new Map(
    ["last_value", "level_trend", "seasonal_naive_7"].map((model) => [
      model,
      { model, folds: [], residuals: [] },
    ]),
  );

  for (let targetIndex = 2; targetIndex < eligible.length; targetIndex += 1) {
    const target = eligible[targetIndex];
    const decisionTimestamp = dateTimestamp(target.serviceDate);
    const training = eligible.filter(
      (observation) =>
        dateTimestamp(observation.serviceDate) < decisionTimestamp &&
        Date.parse(observation.availableAt) <= decisionTimestamp,
    );

    if (
      training.length < 2 ||
      !isConsecutiveHistory(training) ||
      decisionTimestamp - dateTimestamp(training.at(-1).serviceDate) !== DAY_MS
    ) {
      continue;
    }

    const forecasts = forecastBaselines({
      observations: training,
      seasonLength,
      alpha,
      beta,
    });

    for (const forecast of forecasts) {
      const evidence = modelEvidence.get(forecast.model);
      const availableResiduals = evidence.residuals
        .filter(({ availableAt }) => Date.parse(availableAt) <= decisionTimestamp)
        .map(({ value }) => value);
      const quantiles =
        forecast.point === null
          ? calibratedQuantiles(0, [])
          : calibratedQuantiles(forecast.point, availableResiduals);
      const limitation =
        forecast.limitation ??
        (forecast.point !== null && availableResiduals.length === 0
          ? "insufficient_calibration"
          : null);

      evidence.folds.push({
        targetObservationId: target.observationId,
        targetServiceDate: target.serviceDate,
        foldSnapshot: foldSnapshot(target.serviceDate),
        trainingObservationIds: training.map(({ observationId }) => observationId),
        actual: target.value,
        point: forecast.point,
        ...quantiles,
        pointClamped: forecast.clamped,
        limitation,
      });

      if (forecast.point !== null) {
        evidence.residuals.push({
          value: target.value - forecast.point,
          availableAt: target.availableAt,
        });
      }
    }
  }

  const forwardPoints = new Map(
    forecastBaselines({ observations: eligible, seasonLength, alpha, beta }).map(
      (forecast) => [forecast.model, forecast],
    ),
  );
  const models = [...modelEvidence.values()].map(
    ({ model, folds, residuals }) => {
      const point = forwardPoints.get(model);
      const calibration = residuals
        .filter(({ availableAt }) => Date.parse(availableAt) <= snapshotTimestamp)
        .map(({ value }) => value);
      const quantiles =
        point.point === null
          ? calibratedQuantiles(0, [])
          : calibratedQuantiles(point.point, calibration);
      return {
        model,
        forecast: {
          trainingStart: eligible[0].serviceDate,
          trainingEnd: eligible.at(-1).serviceDate,
          trainingObservationCount: eligible.length,
          point: point.point,
          ...quantiles,
          clamped: point.clamped,
          limitation:
            point.limitation ??
            (point.point !== null && calibration.length === 0
              ? "insufficient_calibration"
              : null),
        },
        folds,
        evaluation: evaluateFolds(folds, eligible, seasonLength),
      };
    },
  );

  return {
    snapshotTime,
    observationCount: eligible.length,
    models,
    winner: null,
    limitations: ["model_selection_not_performed"],
  };
}
