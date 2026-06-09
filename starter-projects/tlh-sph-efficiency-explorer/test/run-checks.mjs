#!/usr/bin/env node
// Verification harness for the TLH/SPH Efficiency Explorer, run by CI.
// Extracts the app's <script> from index.html and runs it against a minimal
// DOM stub, then asserts the properties the tool's credibility rests on:
// the exact-sum decomposition identity, the three validation cases, the
// scripted demo stories, CSV intake, and the offline guarantees.
import fs from "node:fs";
import path from "node:path";

const appPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../app/index.html");
const html = fs.readFileSync(appPath, "utf8");
const m = html.match(/<script>([\s\S]*)<\/script>/);
if (!m) { console.error("FAIL  no <script> block found"); process.exit(1); }

// minimal DOM stub — just enough for the app's boot path
const els = {};
const makeEl = () => ({
  innerHTML: "", textContent: "", value: "50000000", style: {},
  classList: { add() {}, remove() {} }, addEventListener() {}, click() {},
  options: [{ textContent: "All facilities" }], selectedIndex: 0,
});
const documentStub = { getElementById: (id) => els[id] || (els[id] = makeEl()) };
els.scopeSel = makeEl();
els.scopeSel.value = "all";

const api = new Function("document", m[1] + `
;return { decompose, driverTag, demoData, parseCSV, facSeries, draftRecap };
`)(documentStub);

let failures = 0;
const assert = (cond, msg) => {
  console.log((cond ? "PASS  " : "FAIL  ") + msg);
  if (!cond) failures++;
};

/* startup self-test ran during eval */
assert(els.selfTest.textContent.includes("passed"), "startup self-test: " + els.selfTest.textContent);

/* exact-sum identity for every demo facility */
const series = api.facSeries(api.demoData());
let maxRes = 0;
for (const s of series) {
  const w0 = s.weeks[s.weeks.length - 2], w1 = s.weeks[s.weeks.length - 1];
  maxRes = Math.max(maxRes, api.decompose(w0.tlh, w0.sph, w1.tlh, w1.sph).residual);
}
assert(maxRes < 1e-9, `sphE + tlhE == ΔSPH for all ${series.length} demo facilities (max residual ${maxRes.toExponential(2)})`);

/* scripted demo stories keep their teaching contrast */
const story = {};
for (const s of series) {
  const w0 = s.weeks[s.weeks.length - 2], w1 = s.weeks[s.weeks.length - 1];
  const d = api.decompose(w0.tlh, w0.sph, w1.tlh, w1.sph);
  story[s.facility] = { ...d, tag: api.driverTag(d.sphE, d.tlhE) };
}
assert(story["SYNTH-01"].totalDelta > 0 && story["SYNTH-01"].tag === "SPH-driven", "SYNTH-01: SPH-driven gain");
assert(story["SYNTH-02"].totalDelta > 0 && story["SYNTH-02"].tag === "TLH-driven", "SYNTH-02: TLH-driven gain");
assert(story["SYNTH-03"].totalDelta < 0 && story["SYNTH-03"].tag === "SPH-driven", "SYNTH-03: demand-driven decline");
assert(story["SYNTH-04"].totalDelta < 0 && story["SYNTH-04"].tag === "TLH-driven", "SYNTH-04: TLH-driven loss");

/* the three spec validation cases */
let d = api.decompose(1000, 10, 1000, 11);
assert(Math.abs(d.sphE - 1) < 1e-9 && Math.abs(d.tlhE) < 1e-9, "pure SPH: ~100% SPH effect, ~0 TLH");
d = api.decompose(1000, 10, 900, 10000 / 900);
assert(Math.abs(d.sphE) < 1e-9 && Math.abs(d.tlhE - d.totalDelta) < 1e-9, "pure TLH: ~0 SPH, ~100% TLH");
d = api.decompose(1000, 10, 1100, 10);
assert(Math.abs(d.totalDelta) < 1e-12 && Math.abs(d.sphE + d.tlhE) < 1e-9, "proportional: effects offset, total ≈ 0");

/* CSV intake: happy path, sample file, and rejection */
const rows = api.parseCSV("facility,region,district,week,tlh,sph\nA,WEST,Summit,05/16/26,1000,10\nA,WEST,Summit,05/23/26,990,10.4\n");
assert(rows.length === 2 && rows[0].tlh === 1000 && rows[1].sph === 10.4, "CSV long format parses");
const sample = fs.readFileSync(path.resolve(appPath, "../sample-data.csv"), "utf8");
assert(api.parseCSV(sample).length >= 12, "shipped sample-data.csv parses");
let rejected = false;
try { api.parseCSV("facility,week,value\nA,05/16/26,82\nA,05/23/26,81\n"); }
catch (e) { rejected = /TLH|SPH/i.test(e.message); }
assert(rejected, "CSV without tlh/sph columns rejected with a clear message");

/* render + recap produced sensible output during boot */
assert(els.cards.innerHTML.includes("Net efficiency move"), "headline cards rendered");
assert(els.facTable.innerHTML.includes("SYNTH-01"), "facility table rendered");
assert(els.status.textContent.includes("split check ✓"), "status shows exact-split check");
api.draftRecap();
assert(/REPLICATE[\s\S]*VERIFY FIRST[\s\S]*INVESTIGATE/.test(els.recapOut.value), "recap has replicate / verify-first / investigate sections");

/* offline guarantees */
assert(html.includes("connect-src 'none'"), "CSP with connect-src 'none' present");
assert(!/fetch\(|XMLHttpRequest|WebSocket|navigator\.sendBeacon/.test(m[1]), "no network APIs in script");

console.log(failures ? `\n${failures} FAILURE(S)` : "\nALL CHECKS PASSED");
process.exit(failures ? 1 : 0);
