function offsetPeriod(period, monthOffset) {
  const [year, month] = period.split("-").map(Number);
  const absoluteMonth = year * 12 + month - 1 + monthOffset;
  const offsetYear = Math.floor(absoluteMonth / 12);
  const offsetMonth = (absoluteMonth % 12) + 1;
  return `${String(offsetYear).padStart(4, "0")}-${String(offsetMonth).padStart(2, "0")}`;
}

function compareWithBaseline(current, baselinePeriod, observationsByPeriod) {
  const baseline = observationsByPeriod.get(`${current.metricId}\u0000${baselinePeriod}`);

  if (baseline === undefined) {
    return {
      baselinePeriod,
      baselineValue: null,
      absoluteChange: null,
      percentageChange: null,
      reason: "insufficient_history",
    };
  }

  const absoluteChange = current.value - baseline.value;
  if (baseline.value === 0) {
    return {
      baselinePeriod,
      baselineValue: baseline.value,
      absoluteChange,
      percentageChange: null,
      reason: "zero_baseline",
    };
  }

  return {
    baselinePeriod,
    baselineValue: baseline.value,
    absoluteChange,
    percentageChange: (absoluteChange / baseline.value) * 100,
    reason: null,
  };
}

function compareText(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function evaluateTarget(observation) {
  let distance;

  if (observation.targetType === null) {
    return { status: "no_target", distance: null };
  }

  if (observation.targetType === "minimum") {
    distance = observation.value - observation.targetMin;
  } else if (observation.targetType === "maximum") {
    distance = observation.targetMax - observation.value;
  } else {
    distance = Math.min(
      observation.value - observation.targetMin,
      observation.targetMax - observation.value,
    );
  }

  if (distance >= 0) {
    return { status: "on_target", distance };
  }
  if (distance >= -observation.warningMargin) {
    return { status: "warning", distance };
  }
  return { status: "at_risk", distance };
}

export function compareMetrics(records) {
  const observationsByPeriod = new Map(
    records.map((record) => [`${record.metricId}\u0000${record.period}`, record]),
  );
  const orderedRecords = [...records].sort(
    (left, right) =>
      compareText(left.metricId, right.metricId) || compareText(left.period, right.period),
  );

  return orderedRecords.map((record) => ({
    metricId: record.metricId,
    period: record.period,
    value: record.value,
    unit: record.unit,
    mom: compareWithBaseline(record, offsetPeriod(record.period, -1), observationsByPeriod),
    yoy: compareWithBaseline(record, offsetPeriod(record.period, -12), observationsByPeriod),
    target: evaluateTarget(record),
  }));
}
