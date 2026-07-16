const MINIMUM_PROJECTION_PERIODS = 3;

function compareText(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function offsetPeriod(period, monthOffset) {
  const [year, month] = period.split("-").map(Number);
  const absoluteMonth = year * 12 + month - 1 + monthOffset;
  const offsetYear = Math.floor(absoluteMonth / 12);
  const offsetMonth = (absoluteMonth % 12) + 1;
  return `${offsetYear}-${String(offsetMonth).padStart(2, "0")}`;
}

function hasPeriodGap(records) {
  return records.some(
    (record, index) =>
      index > 0 && record.period !== offsetPeriod(records[index - 1].period, 1),
  );
}

function median(values) {
  const ordered = [...values].sort((left, right) => left - right);
  const midpoint = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 1
    ? ordered[midpoint]
    : (ordered[midpoint - 1] + ordered[midpoint]) / 2;
}

function projectMetric(metricId, records, projectionWindow) {
  const ordered = [...records].sort((left, right) => compareText(left.period, right.period));
  const window = ordered.slice(-projectionWindow);
  const lastRecord = window.at(-1);
  let projectedValue = null;
  let limitation = null;

  if (window.length < MINIMUM_PROJECTION_PERIODS) {
    limitation = "insufficient_history";
  } else if (hasPeriodGap(window)) {
    limitation = "period_gap";
  } else {
    const differences = window
      .slice(1)
      .map((record, index) => record.value - window[index].value);
    if (differences.some((difference) => !Number.isFinite(difference))) {
      limitation = "numeric_overflow";
    } else {
      const medianDrift = median(differences);
      if (!Number.isFinite(medianDrift)) {
        limitation = "numeric_overflow";
      } else {
        const candidateValue = lastRecord.value + medianDrift;
        if (Number.isFinite(candidateValue)) {
          projectedValue = candidateValue;
        } else {
          limitation = "numeric_overflow";
        }
      }
    }
  }

  return {
    metricId,
    targetPeriod: offsetPeriod(lastRecord.period, 1),
    method: "median_recent_drift",
    inputPeriods: window.map(({ period }) => period),
    projectedValue,
    limitation,
  };
}

export function projectBaselines(records, policy) {
  const recordsByMetric = new Map();
  for (const record of records) {
    const metricRecords = recordsByMetric.get(record.metricId) ?? [];
    metricRecords.push(record);
    recordsByMetric.set(record.metricId, metricRecords);
  }

  return [...recordsByMetric]
    .sort(([leftMetricId], [rightMetricId]) => compareText(leftMetricId, rightMetricId))
    .map(([metricId, metricRecords]) =>
      projectMetric(metricId, metricRecords, policy.projectionWindow),
    );
}
