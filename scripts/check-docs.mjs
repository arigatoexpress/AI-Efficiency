#!/usr/bin/env node
// Repo-wide documentation checks, run by CI on every PR.
// Fails (exit 1) on: broken relative links, raw.githack paths that don't
// exist in the repo, unbalanced HTML in the single-file pages, missing
// offline CSP in the offline apps, and prompt-count claims that drift from
// the actual number of prompts.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", ".worktrees"]);
let failures = 0;
const fail = (msg) => { console.error("FAIL  " + msg); failures++; };

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) yield* walk(path.join(dir, e.name)); }
    else yield path.join(dir, e.name);
  }
}
const files = [...walk(root)];
const docFiles = files.filter((f) => /\.(md|html)$/.test(f));

/* 1. Relative links and image refs resolve */
for (const f of docFiles) {
  const txt = fs.readFileSync(f, "utf8");
  const links = [];
  if (f.endsWith(".md"))
    for (const m of txt.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) links.push(m[1]);
  for (const m of txt.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) links.push(m[1]);
  for (const l of links) {
    // skip external URLs and root-absolute paths (the latter are app-server
    // routes like Vite's /src/main.tsx, not repo-relative links)
    if (/^(https?:|mailto:|data:|\/)/.test(l)) continue;
    const target = path.resolve(path.dirname(f), decodeURIComponent(l));
    if (!fs.existsSync(target)) fail(`broken link in ${path.relative(root, f)}: ${l}`);
  }
}

/* 2. raw.githack URLs must point at files that exist in the repo */
for (const f of docFiles) {
  const txt = fs.readFileSync(f, "utf8");
  for (const m of txt.matchAll(/raw\.githack\.com\/arigatoexpress\/AI-Efficiency\/main\/([^)\s"'<]+)/g)) {
    if (!fs.existsSync(path.join(root, decodeURIComponent(m[1]))))
      fail(`raw.githack path missing from repo in ${path.relative(root, f)}: ${m[1]}`);
  }
}

/* 3. Single-file pages: DOCTYPE + balanced structural tags; offline apps: CSP */
const pages = [
  "index.html",
  "starter-projects/dock-efficiency-signal-lab/app/index.html",
  "starter-projects/tlh-sph-efficiency-explorer/app/index.html",
  "prompts/explorer.html",
];
const offlineApps = pages.slice(1).concat(["index.html"]);
for (const p of pages) {
  const txt = fs.readFileSync(path.join(root, p), "utf8");
  if (!/^<!DOCTYPE html>/i.test(txt)) fail(`${p}: missing DOCTYPE`);
  for (const tag of ["html", "head", "body", "header", "footer", "nav", "section", "table", "details", "script", "style"]) {
    const open = (txt.match(new RegExp(`<${tag}(\\s|>)`, "g")) || []).length;
    const close = (txt.match(new RegExp(`</${tag}>`, "g")) || []).length;
    if (open !== close) fail(`${p}: <${tag}> unbalanced (${open} open / ${close} close)`);
  }
}
for (const p of offlineApps) {
  const txt = fs.readFileSync(path.join(root, p), "utf8");
  if (!txt.includes("connect-src 'none'")) fail(`${p}: missing offline CSP (connect-src 'none')`);
}

/* 4. Prompt-count claims match the actual prompt count */
const promptDir = path.join(root, "prompts");
let actual = 0;
for (const f of fs.readdirSync(promptDir)) {
  if (!f.endsWith(".md") || f === "README.md" || f === "prompt-engineering-basics.md") continue;
  actual += (fs.readFileSync(path.join(promptDir, f), "utf8").match(/^```text/gm) || []).length;
}
const claimRe = /(\d+)(?:\+)?\s*(?:copy-paste prompts|ops prompts|FedEx-specific prompts|FedEx-Specific Prompts)|Index of (\d+) prompts/g;
for (const rel of ["README.md", "index.html", "AGENTS.md"]) {
  const txt = fs.readFileSync(path.join(root, rel), "utf8");
  for (const m of txt.matchAll(claimRe)) {
    const claimed = Number(m[1] ?? m[2]);
    if (claimed !== actual) fail(`${rel}: claims ${claimed} prompts but prompts/ contains ${actual}`);
  }
}

console.log(failures
  ? `\ncheck-docs: ${failures} failure(s)`
  : `check-docs: OK — ${docFiles.length} doc files checked, ${actual} prompts counted, claims consistent`);
process.exit(failures ? 1 : 0);
