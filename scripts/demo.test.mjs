import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

const source = readFileSync(new URL('./demo.mjs', import.meta.url), 'utf8');
const shellQuote = (value) => "'" + value.replaceAll("'", "'\\''") + "'";

function runDemo(t, { stale = false, fail = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'demo-release-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const app = join(root, 'starter-projects/fedex-logistics-intelligence-system/app');
  const bin = join(root, 'bin');
  mkdirSync(join(root, 'scripts'), { recursive: true });
  mkdirSync(join(app, 'node_modules'), { recursive: true });
  mkdirSync(join(app, 'dist'), { recursive: true });
  mkdirSync(bin);
  writeFileSync(join(root, 'scripts/demo.mjs'), source);
  if (stale) writeFileSync(join(app, 'dist/server.cjs'), "console.log('SYNTH-STALE-SERVER');\n");
  // No package install, real server, socket, model call or process signaling.
  writeFileSync(join(root, 'builder.cjs'), `
    const fs = require('node:fs');
    if (process.argv.slice(2).join(' ') !== 'run build') process.exit(23);
    fs.appendFileSync('build-receipt.txt', 'build\\n');
    if (${fail}) process.exit(17);
    fs.writeFileSync('dist/server.cjs', "console.log('SYNTH-CURRENT-SERVER');\\n");
  `);
  writeFileSync(join(bin, 'npm'), `#!/bin/sh\nexec ${shellQuote(process.execPath)} ${shellQuote(join(root, 'builder.cjs'))} "$@"\n`);
  chmodSync(join(bin, 'npm'), 0o755);
  const result = spawnSync(process.execPath, [join(root, 'scripts/demo.mjs')], {
    cwd: root,
    env: { PATH: `${bin}:${dirname(process.execPath)}:/usr/bin:/bin`, DEMO_PORT: '3900' },
    encoding: 'utf8',
  });
  assert.equal(result.error, undefined);
  return { ...result, app };
}

test('first demo builds and starts the current synthetic artifact', (t) => {
  const result = runDemo(t);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /SYNTH-CURRENT-SERVER/);
});

test('existing dist does not hide newly pulled source', (t) => {
  const result = runDemo(t, { stale: true });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /SYNTH-CURRENT-SERVER/);
  assert.doesNotMatch(result.stdout, /SYNTH-STALE-SERVER/);
  assert.equal(readFileSync(join(result.app, 'build-receipt.txt'), 'utf8'), 'build\n');
});

test('failed rebuild refuses to start a stale artifact', (t) => {
  const result = runDemo(t, { stale: true, fail: true });
  assert.notEqual(result.status, 0);
  assert.doesNotMatch(result.stdout, /SYNTH-(?:STALE|CURRENT)-SERVER/);
});
