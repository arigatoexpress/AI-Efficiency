function normalizeFiniteNumber(value) {
  if (!Number.isFinite(value)) throw new RangeError("NON_FINITE_NUMBER");
  const rounded = Number(value.toPrecision(15));
  return Object.is(rounded, -0) ? 0 : rounded;
}

function canonicalValue(value) {
  if (typeof value === "number") return normalizeFiniteNumber(value);
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalValue(value[key])]),
    );
  }
  return value;
}

function inlineFact(value) {
  return JSON.stringify(canonicalValue(value));
}

function evidenceLines(values) {
  if (values.length === 0) return ["- None reported by canonical analysis."];
  return values.map((value) => `- \`${inlineFact(value)}\``);
}

export function stableJson(value) {
  return `${JSON.stringify(canonicalValue(value), null, 2)}\n`;
}

// Plain-English summary lines, derived deterministically from canonical
// facts only. Wording stays evidence-neutral: statuses and correlations are
// reported, never explained.

const STATUS_TEXT = {
  on_target: "on target",
  warning: "warning",
  at_risk: "at risk",
  no_target: "no target set",
};

function displayNumber(value) {
  if (value === null || value === undefined) return "n/a";
  const rounded = normalizeFiniteNumber(value);
  return String(Math.round(rounded * 10) / 10);
}

function labelFor(analysis, metricId) {
  const definition = analysis.inputSummary.metricDefinitions.find(
    (item) => item.metricId === metricId,
  );
  return definition ? definition.metricLabel : metricId;
}

function changePhrase(name, change) {
  if (!change || change.absoluteChange === null || change.absoluteChange === undefined) {
    return `${name} n/a`;
  }
  const delta = normalizeFiniteNumber(change.absoluteChange);
  const direction = delta > 0 ? "+" : "";
  return `${direction}${displayNumber(delta)} ${name} (vs ${change.baselinePeriod})`;
}

function comparisonSummary(analysis, comparison) {
  const label = labelFor(analysis, comparison.metricId);
  const status = STATUS_TEXT[comparison.target.status] ?? comparison.target.status;
  const distance =
    comparison.target.distance === null || comparison.target.distance === undefined
      ? ""
      : `, distance ${displayNumber(comparison.target.distance)}`;
  return (
    `- **${label}**: ${displayNumber(comparison.value)} ${comparison.unit} in ` +
    `${comparison.period} — ${status}${distance}; ` +
    `${changePhrase("month-over-month", comparison.mom)}, ` +
    `${changePhrase("year-over-year", comparison.yoy)}.`
  );
}

function lineageSummary(analysis, lineage) {
  const label = labelFor(analysis, lineage.metricId);
  const state = lineage.outcome === "active" ? "ACTIVE" : lineage.outcome;
  const trail = lineage.events
    .map((event) => `${event.period} ${event.classification} (severity ${displayNumber(event.severity)})`)
    .join(", ");
  return (
    `- **${label}**: risk ${state} — started ${lineage.originPeriod} at severity ` +
    `${displayNumber(lineage.originSeverity)}${trail ? `; then ${trail}` : ""}.`
  );
}

function associationSummary(analysis, association) {
  const source = labelFor(analysis, association.sourceMetricId);
  const outcome = labelFor(analysis, association.outcomeMetricId);
  return (
    `- **${source}** and **${outcome}** move together at a ${association.lagMonths}-month lag ` +
    `(correlation ${displayNumber(association.coefficient)} across ` +
    `${association.observationCount} period pairs). A lead for human review, not a confirmed relationship.`
  );
}

function projectionSummary(analysis, projection) {
  const label = labelFor(analysis, projection.metricId);
  return (
    `- **${label}**: projects to ${displayNumber(projection.projectedValue)} for ` +
    `${projection.targetPeriod} if recent drift continues (method: ${projection.method}).`
  );
}

function summaryLines(values, render) {
  if (values.length === 0) return ["- None reported by canonical analysis."];
  return values.map(render);
}

export function renderMarkdown(analysis) {
  const activeLineages = analysis.riskLineages.filter((item) => item.outcome === "active");
  const lines = [
    "# Priority Metrics Brief",
    "",
    `Read the summary, then verify against the canonical evidence below — if the`,
    `prose and the evidence ever disagree, the evidence wins. Analysis period:`,
    `\`${analysis.inputSummary.analysisPeriod}\`.`,
    "",
    "## Where Each Metric Stands",
    "",
    ...summaryLines(analysis.comparisons, (item) => comparisonSummary(analysis, item)),
    "",
    "## Active Risks",
    "",
    ...summaryLines(activeLineages, (item) => lineageSummary(analysis, item)),
    "",
    "## Leads Worth a Look",
    "",
    ...summaryLines(analysis.patterns.candidateAssociations, (item) =>
      associationSummary(analysis, item),
    ),
    "",
    "## Baseline Outlook",
    "",
    ...summaryLines(analysis.projections, (item) => projectionSummary(analysis, item)),
    "",
    "## Suggested Review Questions",
    "",
    "- Which confirmed observations should be verified against approved source systems?",
    "- What evidence would resolve each reported limitation?",
    "- Which risks and candidate associations warrant human review?",
    "",
    "---",
    "",
    "## Canonical Evidence",
    "",
    "Every fact the summary above is derived from, verbatim from `analysis.json`.",
    "",
    "### Confirmed Observations",
    "",
    `- Analysis period: \`${analysis.inputSummary.analysisPeriod}\``,
    ...evidenceLines(analysis.inputSummary.metricDefinitions),
    ...evidenceLines(analysis.comparisons),
    "",
    "### Risks",
    "",
    ...evidenceLines([...analysis.riskLineages, ...analysis.patterns.recurrences]),
    "",
    "### Candidate Associations",
    "",
    ...evidenceLines(analysis.patterns.candidateAssociations),
    "",
    "### Baseline Outlook",
    "",
    ...evidenceLines(analysis.projections),
    "",
    "### Missing Evidence",
    "",
    `- Canonical limitations: \`${inlineFact(analysis.limitations)}\``,
    "",
  ];

  return lines.join("\n");
}
