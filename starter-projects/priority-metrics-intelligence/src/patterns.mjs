const REQUIRED_HISTORY_PERIODS = 13;

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
  return `${String(offsetYear).padStart(4, "0")}-${String(offsetMonth).padStart(2, "0")}`;
}

function hasPeriodGap(records) {
  for (let index = 1; index < records.length; index += 1) {
    if (records[index].period !== offsetPeriod(records[index - 1].period, 1)) {
      return true;
    }
  }
  return false;
}

function pearson(sourceValues, outcomeValues) {
  if (
    sourceValues.some((value) => !Number.isFinite(value)) ||
    outcomeValues.some((value) => !Number.isFinite(value))
  ) {
    return { coefficient: null, limitation: "numeric_overflow" };
  }
  const anchorAndScale = (values) => {
    const anchor = values[0];
    let anchored = values.map((value) => value - anchor);
    if (anchored.some((value) => !Number.isFinite(value))) {
      const rawScale = Math.max(...values.map(Math.abs));
      if (rawScale === 0) return null;
      anchored = values.map((value) => value / rawScale - anchor / rawScale);
    }
    const scale = Math.max(...anchored.map(Math.abs));
    return scale === 0 ? null : anchored.map((value) => value / scale);
  };
  const scaledSource = anchorAndScale(sourceValues);
  const scaledOutcome = anchorAndScale(outcomeValues);
  if (scaledSource === null || scaledOutcome === null) {
    return { coefficient: null, limitation: "zero_variance" };
  }
  const sourceMean =
    scaledSource.reduce((sum, value) => sum + value, 0) / scaledSource.length;
  const outcomeMean =
    scaledOutcome.reduce((sum, value) => sum + value, 0) / scaledOutcome.length;
  let covariance = 0;
  let sourceSquaredDeviation = 0;
  let outcomeSquaredDeviation = 0;

  for (let index = 0; index < sourceValues.length; index += 1) {
    const sourceDeviation = scaledSource[index] - sourceMean;
    const outcomeDeviation = scaledOutcome[index] - outcomeMean;
    covariance += sourceDeviation * outcomeDeviation;
    sourceSquaredDeviation += sourceDeviation ** 2;
    outcomeSquaredDeviation += outcomeDeviation ** 2;
  }

  if (sourceSquaredDeviation === 0 || outcomeSquaredDeviation === 0) {
    return { coefficient: null, limitation: "zero_variance" };
  }

  const coefficient =
    covariance /
    (Math.sqrt(sourceSquaredDeviation) * Math.sqrt(outcomeSquaredDeviation));
  if (!Number.isFinite(coefficient)) {
    return { coefficient: null, limitation: "numeric_overflow" };
  }
  const bounded = Math.max(-1, Math.min(1, coefficient));
  const normalized = Math.abs(1 - Math.abs(bounded)) < 1e-12
    ? Math.sign(bounded)
    : bounded;
  return {
    coefficient: normalized,
    limitation: null,
  };
}

function selectHistoryWindow(records, latestPeriod) {
  const window = records.slice(-REQUIRED_HISTORY_PERIODS);
  if (window.length < REQUIRED_HISTORY_PERIODS) {
    return { records: window, limitation: "insufficient_history" };
  }
  if (window.at(-1).period !== latestPeriod || hasPeriodGap(window)) {
    return { records: window, limitation: "period_gap" };
  }
  return { records: window, limitation: null };
}

function findRecurrences(comparisons, minimumRecurrences, eligibleMetricIds) {
  const periodsByMetric = new Map();

  for (const current of comparisons) {
    if (current.target.status !== "at_risk" || !eligibleMetricIds.has(current.metricId)) {
      continue;
    }
    const periods = periodsByMetric.get(current.metricId) ?? [];
    periods.push(current.period);
    periodsByMetric.set(current.metricId, periods);
  }

  return [...periodsByMetric]
    .filter(([, periods]) => periods.length >= minimumRecurrences)
    .sort(([leftMetricId], [rightMetricId]) => compareText(leftMetricId, rightMetricId))
    .map(([metricId, periods]) => {
      const orderedPeriods = [...periods].sort(compareText);
      return {
        metricId,
        eventCount: orderedPeriods.length,
        periods: orderedPeriods,
      };
    });
}

function analyzeAssociation(definition, recordsByMetric, latestPeriod) {
  const allSourceRecords = recordsByMetric.get(definition.sourceMetricId) ?? [];
  const allOutcomeRecords = recordsByMetric.get(definition.outcomeMetricId) ?? [];
  const sourceHistory = selectHistoryWindow(allSourceRecords, latestPeriod);
  const outcomeHistory = selectHistoryWindow(allOutcomeRecords, latestPeriod);
  const evidenceWindow = Math.max(
    REQUIRED_HISTORY_PERIODS,
    definition.minimumObservations + definition.lagMonths,
  );
  const sourceRecords = allSourceRecords.slice(-evidenceWindow);
  const outcomeRecords = allOutcomeRecords.slice(-evidenceWindow);
  const outcomesByPeriod = new Map(outcomeRecords.map((record) => [record.period, record]));
  const aligned = sourceRecords.flatMap((source) => {
    const outcomePeriod = offsetPeriod(source.period, definition.lagMonths);
    const outcome = outcomesByPeriod.get(outcomePeriod);
    return outcome === undefined ? [] : [{ source, outcome }];
  });
  const periodPairs = aligned.map(({ source, outcome }) => ({
    sourcePeriod: source.period,
    outcomePeriod: outcome.period,
  }));

  let coefficient = null;
  let limitation = null;
  if (
    sourceHistory.limitation === "insufficient_history" ||
    outcomeHistory.limitation === "insufficient_history"
  ) {
    limitation = "insufficient_history";
  } else if (
    sourceHistory.limitation === "period_gap" ||
    outcomeHistory.limitation === "period_gap"
  ) {
    limitation = "period_gap";
  } else if (aligned.length < definition.minimumObservations) {
    limitation = "insufficient_observations";
  } else {
    const correlation = pearson(
      aligned.map(({ source }) => source.value),
      aligned.map(({ outcome }) => outcome.value),
    );
    coefficient = correlation.coefficient;
    limitation = correlation.limitation;
  }

  return {
    type: "candidate_association",
    sourceMetricId: definition.sourceMetricId,
    outcomeMetricId: definition.outcomeMetricId,
    lagMonths: definition.lagMonths,
    observationCount: aligned.length,
    coefficient,
    periodPairs,
    limitation,
  };
}

export function findPatterns(records, comparisons, policy) {
  const recordsByMetric = new Map();
  for (const record of records) {
    const metricRecords = recordsByMetric.get(record.metricId) ?? [];
    metricRecords.push(record);
    recordsByMetric.set(record.metricId, metricRecords);
  }
  for (const metricRecords of recordsByMetric.values()) {
    metricRecords.sort((left, right) => compareText(left.period, right.period));
  }
  const latestPeriod = records.reduce(
    (latest, record) => (latest === null || record.period > latest ? record.period : latest),
    null,
  );
  const eligibleMetricIds = new Set(
    [...recordsByMetric]
      .filter(
        ([, metricRecords]) =>
          selectHistoryWindow(metricRecords, latestPeriod).limitation === null,
      )
      .map(([metricId]) => metricId),
  );

  const associationDefinitions = [...policy.candidateAssociations].sort(
    (left, right) =>
      compareText(left.sourceMetricId, right.sourceMetricId) ||
      compareText(left.outcomeMetricId, right.outcomeMetricId) ||
      left.lagMonths - right.lagMonths,
  );

  return {
    recurrences: findRecurrences(comparisons, policy.minimumRecurrences, eligibleMetricIds),
    candidateAssociations: associationDefinitions.map((definition) =>
      analyzeAssociation(definition, recordsByMetric, latestPeriod),
    ),
  };
}
