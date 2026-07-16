#!/usr/bin/env node
// One-command demo: `npm run demo` from the repo root.
// Installs/builds the logistics app if needed, starts it locally, and prints
// every entry point in the hub. No flags touched: the dashboard serves labeled
// synthetic demo data (set LIVE_SIGNALS=on to exercise the live adapters).
import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const appDir = path.join(root, "starter-projects", "fedex-logistics-intelligence-system", "app");
// Deliberately DEMO_PORT, not PORT: a generic PORT is often already exported
// in developer shells (it was 8800 on the machine this was built on) and
// silently rebinding the demo to it is exactly the kind of surprise this
// script exists to avoid.
const PORT = process.env.DEMO_PORT || "3900";

const step = (msg) => console.log(`\n▶ ${msg}`);

if (!fs.existsSync(path.join(appDir, "node_modules"))) {
  step("First run: installing logistics app dependencies (one time)…");
  execSync("npm ci", { cwd: appDir, stdio: "inherit" });
}

if (!fs.existsSync(path.join(appDir, "dist", "server.cjs"))) {
  step("Building the logistics app…");
  execSync("npm run build", { cwd: appDir, stdio: "inherit" });
}

step(`Starting the Station Ops Intelligence dashboard on http://localhost:${PORT} …`);
const env = { ...process.env, PORT };
const server = spawn("node", ["dist/server.cjs"], { cwd: appDir, stdio: "inherit", env });

console.log(`
──────────────────────────────────────────────────────────────
  AI Efficiency Hub — local demo

  Dashboard (synthetic demo data):  http://localhost:${PORT}
    · with a GEMINI_API_KEY in app/.env you get real Gemini drafts;
      without one, deterministic fallback drafts (by design)
    · LIVE_SIGNALS=on npm run demo → real public feeds panel

  Open directly in any browser (no server needed):
    · Prompt Explorer:   prompts/explorer.html
    · Signal Lab:        starter-projects/dock-efficiency-signal-lab/app/index.html
    · TLH/SPH Explorer:  starter-projects/tlh-sph-efficiency-explorer/app/index.html
    · Hub overview:      index.html

  Try the metrics CLI (no install, writes to output/demo/):
    node starter-projects/priority-metrics-intelligence/src/cli.mjs \\
      --input starter-projects/priority-metrics-intelligence/fixtures/synthetic-monthly-metrics.csv \\
      --policy starter-projects/priority-metrics-intelligence/fixtures/synthetic-policy.json \\
      --output-dir output/demo --data-classification synthetic

  Run every check CI runs:  npm run verify
  Ctrl+C stops the dashboard.
──────────────────────────────────────────────────────────────
`);

server.on("exit", (code) => process.exit(code ?? 0));
