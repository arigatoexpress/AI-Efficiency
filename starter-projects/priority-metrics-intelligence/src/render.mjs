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

export function renderMarkdown(analysis) {
  const lines = [
    "# Priority Metrics Brief",
    "",
    "## Confirmed Observations",
    "",
    `- Analysis period: \`${analysis.inputSummary.analysisPeriod}\``,
    ...evidenceLines(analysis.inputSummary.metricDefinitions),
    ...evidenceLines(analysis.comparisons),
    "",
    "## Risks",
    "",
    ...evidenceLines([...analysis.riskLineages, ...analysis.patterns.recurrences]),
    "",
    "## Candidate Associations",
    "",
    ...evidenceLines(analysis.patterns.candidateAssociations),
    "",
    "## Baseline Outlook",
    "",
    ...evidenceLines(analysis.projections),
    "",
    "## Missing Evidence",
    "",
    `- Canonical limitations: \`${inlineFact(analysis.limitations)}\``,
    "",
    "## Suggested Review Questions",
    "",
    "- Which confirmed observations should be verified against approved source systems?",
    "- What evidence would resolve each reported limitation?",
    "- Which risks and candidate associations warrant human review?",
    "",
  ];

  return lines.join("\n");
}
