import { compareMetrics } from "./compare.mjs";
import { findPatterns } from "./patterns.mjs";
import { projectBaselines } from "./project.mjs";
import { traceRiskLineages } from "./risk-lineage.mjs";

function compareText(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function periodRange(records) {
  const periods = records.map(({ period }) => period).sort(compareText);
  return { start: periods[0], end: periods.at(-1) };
}

function compareLineages(left, right) {
  return (
    compareText(left.metricId, right.metricId) ||
    compareText(left.originPeriod, right.originPeriod)
  );
}

function nextPeriod(period) {
  const [year, month] = period.split("-").map(Number);
  if (month === 12) return `${year + 1}-01`;
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function closeMissingCurrentLineages(lineages, missingMetricIds) {
  return lineages.map((lineage) => {
    if (lineage.outcome !== "active" || !missingMetricIds.has(lineage.metricId)) {
      return lineage;
    }
    const lastEvidencePeriod = lineage.events.at(-1)?.period ?? lineage.originPeriod;
    return {
      ...lineage,
      events: [
        ...lineage.events,
        {
          period: nextPeriod(lastEvidencePeriod),
          classification: "gap",
          severity: null,
        },
      ],
      outcome: "untraceable",
    };
  });
}

export function analyzeMetrics({
  records,
  policy,
  analyzerVersion,
  dataClassification = "synthetic",
}) {
  const range = periodRange(records);
  const analysisPeriod = range.end;
  const metricIds = [...new Set(records.map(({ metricId }) => metricId))].sort(compareText);
  const allComparisons = compareMetrics(records);
  const comparisons = allComparisons.filter(({ period }) => period === analysisPeriod);
  const presentMetricIds = new Set(comparisons.map(({ metricId }) => metricId));
  const missingMetricIds = new Set(
    metricIds.filter((metricId) => !presentMetricIds.has(metricId)),
  );
  const limitations = [...missingMetricIds]
    .map((metricId) => `missing_current_period:${metricId}`);
  const riskLineages = closeMissingCurrentLineages(
    traceRiskLineages(allComparisons),
    missingMetricIds,
  ).sort(compareLineages);
  const patterns = findPatterns(records, allComparisons, policy);
  const projections = projectBaselines(records, policy).map((projection) =>
    missingMetricIds.has(projection.metricId)
      ? {
          ...projection,
          projectedValue: null,
          limitation: "missing_current_period",
        }
      : projection,
  );

  return {
    schemaVersion: "1.0.0",
    analyzerVersion,
    inputSummary: {
      analysisPeriod,
      observationCount: records.length,
      metricCount: metricIds.length,
      periodRange: range,
      validationResult: "passed",
    },
    comparisons,
    riskLineages,
    patterns,
    projections,
    limitations,
    provenance: {
      dataClassification,
      periodRange: range,
      methods: [
        "configured_pearson_correlation",
        "exact_period_comparison",
        "median_recent_drift",
        "risk_lineage_state_machine",
        "target_boundary_distance",
      ],
    },
  };
}
