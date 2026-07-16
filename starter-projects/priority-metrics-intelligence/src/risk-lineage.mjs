function nextPeriod(period) {
  const [year, month] = period.split("-").map(Number);
  if (month === 12) return `${year + 1}-01`;
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function compareText(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function severityOf(comparison) {
  return Math.abs(comparison.target.distance);
}

function classifySeverity(previousSeverity, severity) {
  if (severity > previousSeverity) return "worsened";
  if (severity < previousSeverity) return "improved_at_risk";
  return "persisted";
}

export function traceRiskLineages(comparisons) {
  const ordered = [...comparisons].sort(
    (left, right) =>
      compareText(left.metricId, right.metricId) || compareText(left.period, right.period),
  );
  const lineages = [];
  let active = null;
  let activeMetricId = null;
  let previousPeriod = null;
  let previousSeverity = null;

  for (const comparison of ordered) {
    if (comparison.metricId !== activeMetricId) {
      active = null;
      activeMetricId = comparison.metricId;
      previousPeriod = null;
      previousSeverity = null;
    }

    if (active !== null && comparison.period !== nextPeriod(previousPeriod)) {
      active.events.push({
        period: nextPeriod(previousPeriod),
        classification: "gap",
        severity: null,
      });
      active.outcome = "untraceable";
      active = null;
      previousSeverity = null;
    }

    if (comparison.target.status === "at_risk") {
      const severity = severityOf(comparison);
      if (active === null) {
        active = {
          metricId: comparison.metricId,
          originPeriod: comparison.period,
          originSeverity: severity,
          events: [],
          outcome: "active",
        };
        lineages.push(active);
      } else {
        active.events.push({
          period: comparison.period,
          classification: classifySeverity(previousSeverity, severity),
          severity,
        });
      }
      previousSeverity = severity;
    } else if (active !== null && comparison.target.status === "on_target") {
      active.events.push({
        period: comparison.period,
        classification: "recovered",
        severity: 0,
      });
      active.outcome = "recovered";
      active = null;
      previousSeverity = null;
    }

    previousPeriod = comparison.period;
  }

  return lineages;
}
