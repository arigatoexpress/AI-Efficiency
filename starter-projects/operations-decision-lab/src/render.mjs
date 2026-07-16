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

function inline(value) {
  return JSON.stringify(canonicalValue(value));
}

export function stableJson(value) {
  return `${JSON.stringify(canonicalValue(value), null, 2)}\n`;
}

export function renderMarkdown(analysis) {
  const lines = [
    "# Operations Decision Lab Brief",
    "",
    "## Snapshot and Scope",
    "",
    `- Provenance: \`${inline(analysis.provenance)}\``,
    `- Validation: \`${inline(analysis.validation)}\``,
    "",
    "## Forecast Evidence",
    "",
    ...analysis.forecasts.models.map((model) => `- \`${inline(model)}\``),
    "",
    "## Supplied-Plan Feasibility",
    "",
    ...analysis.feasibility.map((plan) => `- \`${inline(plan)}\``),
    "",
    "## Limitations",
    "",
    `- \`${inline(analysis.limitations)}\``,
    "",
    "## Methods",
    "",
    `- \`${inline(analysis.methods)}\``,
    "",
    "## Manager Review Questions",
    "",
    "- Which aggregate inputs need confirmation in an approved source system?",
    "- Which hard-constraint evidence requires operational review?",
    "- What evidence is needed before evaluating additional decision methods?",
    "",
  ];
  return lines.join("\n");
}
