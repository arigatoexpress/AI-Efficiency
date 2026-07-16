const DAY_MS = 24 * 60 * 60 * 1000;
const DAILY_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function invalidHistory() {
  const error = new Error("Forecast history is invalid.");
  error.code = "FORECAST_INVALID_HISTORY";
  return error;
}

function parseDailyDate(value) {
  const match = DAILY_DATE.exec(value);
  if (!match) throw invalidHistory();

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw invalidHistory();
  }

  return timestamp;
}

function validateInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw invalidHistory();
  }

  const { observations, seasonLength, alpha, beta } = input;
  if (
    !Array.isArray(observations) ||
    observations.length === 0 ||
    seasonLength !== 7 ||
    !Number.isFinite(alpha) ||
    alpha < 0 ||
    alpha > 1 ||
    !Number.isFinite(beta) ||
    beta < 0 ||
    beta > 1
  ) {
    throw invalidHistory();
  }

  let previousDate = null;
  const values = observations.map((observation) => {
    if (!observation || typeof observation !== "object") {
      throw invalidHistory();
    }

    const serviceDate = parseDailyDate(observation.serviceDate);
    if (previousDate !== null && serviceDate - previousDate !== DAY_MS) {
      throw invalidHistory();
    }
    previousDate = serviceDate;

    if (!Number.isFinite(observation.value) || observation.value < 0) {
      throw invalidHistory();
    }
    return observation.value;
  });

  return { values, seasonLength, alpha, beta };
}

function levelTrend(values, alpha, beta) {
  let level = values[0];
  let trend = values.length > 1 ? values[1] - values[0] : 0;

  for (let index = 1; index < values.length; index += 1) {
    const previousLevel = level;
    level = alpha * values[index] + (1 - alpha) * (level + trend);
    trend = beta * (level - previousLevel) + (1 - beta) * trend;
  }

  return level + trend;
}

function pointResult(model, point, limitation = null) {
  if (point === null) {
    return { model, point: null, limitation, clamped: false };
  }

  const clamped = point < 0;
  return {
    model,
    point: clamped ? 0 : point,
    limitation,
    clamped,
  };
}

export function forecastBaselines(input) {
  const { values, seasonLength, alpha, beta } = validateInput(input);
  const seasonalPoint =
    values.length >= seasonLength ? values[values.length - seasonLength] : null;

  return [
    pointResult("last_value", values.at(-1)),
    pointResult("level_trend", levelTrend(values, alpha, beta)),
    pointResult(
      "seasonal_naive_7",
      seasonalPoint,
      seasonalPoint === null ? "insufficient_history" : null,
    ),
  ];
}
