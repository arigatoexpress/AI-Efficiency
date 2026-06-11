#!/usr/bin/env node
// Builds the machine-readable prompt index from the prompt markdown files
// (the markdown stays the single source of truth) and injects the same data
// into the offline Prompt Explorer:
//
//   prompts/prompts.json    — programmable, model-agnostic prompt API
//   prompts/explorer.html   — data injected between the PROMPT_DATA markers
//
// Usage:
//   node scripts/build-prompt-index.mjs           # regenerate both
//   node scripts/build-prompt-index.mjs --check   # CI: fail if outputs drift
//
// Output is deterministic (no timestamps) so --check is a pure diff.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const promptDir = path.join(root, "prompts");
const jsonPath = path.join(promptDir, "prompts.json");
const explorerPath = path.join(promptDir, "explorer.html");
const SKIP = new Set(["README.md", "prompt-engineering-basics.md"]);

const slug = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Who each category serves (mirrors the prompts/README table; role research
// in docs/technology/copilot-teams-playbook.md).
const AUDIENCE = {
  "daily-operations": "Any FEC supervisor or manager",
  "safety-and-compliance": "Managers with safety responsibilities",
  "peak-season-and-surge-planning": "Peak planners and sort managers",
  "meeting-and-communication": "All levels",
  "customer-and-contractor-communication": "P&D managers and customer-facing roles",
  "linehaul-and-routing": "Linehaul managers and dispatch",
  "process-improvement": "Continuous improvement leads",
  "data-and-reporting": "Ops admins, analysts, and managers",
  "bid-and-opportunity-support": "Business development",
  "governance-safe-use": "Everyone, before sharing",
};

// The "Day 1" starter pack: the six most universally useful prompts, surfaced
// first in the explorer for someone brand new to AI.
const STARTERS = new Set([
  "daily-operations/daily-manager-brief",
  "daily-operations/shift-handoff",
  "safety-and-compliance/pre-shift-safety-huddle-brief",
  "meeting-and-communication/meeting-notes-to-action-items",
  "meeting-and-communication/professional-email-draft",
  "data-and-reporting/report-summary",
]);

const categories = [];
const prompts = [];
for (const f of fs.readdirSync(promptDir).sort()) {
  if (!f.endsWith(".md") || SKIP.has(f)) continue;
  const txt = fs.readFileSync(path.join(promptDir, f), "utf8");
  const h1 = (txt.match(/^# (.+)$/m) || [, f])[1].trim();
  const name = h1.replace(/\s+Prompts$/i, "");
  const description = (txt.split(/^# .+$/m)[1] || "").trim().split(/\n\s*\n/)[0].replace(/\s+/g, " ").trim();
  const catId = slug(name);
  categories.push({ id: catId, name, file: `prompts/${f}`, description, audience: AUDIENCE[catId] || "" });

  // Each "## Title" followed by a ```text fenced block is one prompt
  // (the same definition scripts/check-docs.mjs counts).
  for (const m of txt.matchAll(/^## (.+)\n+```text\n([\s\S]*?)\n```/gm)) {
    const [, title, body] = m;
    const placeholders = [...new Set([...body.matchAll(/\[[^\[\]]+\]/g)].map((p) => p[0]))];
    const id = `${catId}/${slug(title)}`;
    prompts.push({ id, title: title.trim(), category: catId, starter: STARTERS.has(id), text: body, placeholders });
  }
}

const ids = new Set(prompts.map((p) => p.id));
for (const s of STARTERS) {
  if (!ids.has(s)) {
    console.error(`FAIL  starter id no longer exists in the markdown: ${s}`);
    process.exit(1);
  }
}

const index = {
  _note: "Generated from prompts/*.md by scripts/build-prompt-index.mjs — edit the markdown, then regenerate. Model-agnostic: plain text for any chat AI (Gemini, Copilot, ChatGPT, Claude) or any program.",
  safe_prompt_rule: "Remove sensitive data first, review output before sharing, and keep a human in charge of every decision.",
  count: prompts.length,
  categories,
  prompts,
};
const json = JSON.stringify(index, null, 2) + "\n";

const explorerSrc = fs.readFileSync(explorerPath, "utf8");
const markers = /(\/\*PROMPT_DATA_START\*\/)[\s\S]*?(\/\*PROMPT_DATA_END\*\/)/;
if (!markers.test(explorerSrc)) {
  console.error("FAIL  prompts/explorer.html: PROMPT_DATA markers missing");
  process.exit(1);
}
// Embedded payload: escape "<" so "</script>"-like sequences can't terminate the tag.
const embedded = JSON.stringify(index).replace(/</g, "\\u003c");
const explorerOut = explorerSrc.replace(markers, `$1const PROMPT_INDEX = ${embedded};$2`);

if (process.argv.includes("--check")) {
  let drift = 0;
  if (!fs.existsSync(jsonPath) || fs.readFileSync(jsonPath, "utf8") !== json) {
    console.error("FAIL  prompts/prompts.json is out of date — run: node scripts/build-prompt-index.mjs");
    drift++;
  }
  if (explorerSrc !== explorerOut) {
    console.error("FAIL  prompts/explorer.html data is out of date — run: node scripts/build-prompt-index.mjs");
    drift++;
  }
  if (!drift) console.log(`build-prompt-index: OK — ${prompts.length} prompts across ${categories.length} categories, outputs in sync`);
  process.exit(drift ? 1 : 0);
}

fs.writeFileSync(jsonPath, json);
fs.writeFileSync(explorerPath, explorerOut);
console.log(`build-prompt-index: wrote ${prompts.length} prompts across ${categories.length} categories`);
