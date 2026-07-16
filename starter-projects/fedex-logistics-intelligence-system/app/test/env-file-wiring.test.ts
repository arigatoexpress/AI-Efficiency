// First-user wiring tests for the production entry point (server.ts).
// Every repo doc tells a first user to `cp .env.example .env` and set
// GEMINI_API_KEY there (app/README.md, starter README, scripts/demo.mjs,
// docs/how-it-works). These tests pin that server.ts actually loads that
// file — and that real environment variables still win over it.
// Each test boots the real server.ts via tsx in a disposable working
// directory (never the app dir, so a developer's real .env is untouched)
// and asserts on localhost only: no upstream network, no credentials.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawn, type ChildProcess } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createServer, type Server } from 'node:net'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import type { AddressInfo } from 'node:net'

const APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SERVER_TS = path.join(APP_DIR, 'server.ts')
// tsx resolves `--import tsx` relative to the child's cwd; a disposable tmp
// cwd has no node_modules, so pass the loader's absolute public entry instead.
const TSX_ESM = createRequire(import.meta.url).resolve('tsx/esm')

const FAKE_KEY = 'test-key-from-dotenv-file'

// Variables server.ts reads. Stripped from the child environment so results
// never depend on the developer's shell (or a real key on this machine).
const SERVER_ENV_VARS = [
  'PORT',
  'GEMINI_API_KEY',
  'GEMINI_MODEL',
  'GOOGLE_GENAI_USE_VERTEXAI',
  'GOOGLE_CLOUD_PROJECT',
  'GOOGLE_CLOUD_LOCATION',
  'LIVE_SIGNALS',
]

function cleanEnv(overrides: Record<string, string>) {
  const env: Record<string, string> = {}
  for (const [k, v] of Object.entries(process.env)) {
    if (v !== undefined && !SERVER_ENV_VARS.includes(k)) env[k] = v
  }
  return { ...env, ...overrides }
}

async function freePort(): Promise<number> {
  const srv: Server = createServer()
  await new Promise<void>((resolve) => srv.listen(0, resolve))
  const { port } = srv.address() as AddressInfo
  await new Promise<void>((resolve) => srv.close(() => resolve()))
  return port
}

interface Booted {
  base: string
  stdout: () => string
  stop: () => Promise<void>
}

async function bootServer(
  t: { after: (fn: () => unknown) => void },
  { files = {}, env = {} }: { files?: Record<string, string>; env?: Record<string, string> } = {}
): Promise<Booted> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'env-wiring-'))
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), content)
  }
  const port = await freePort()
  const child: ChildProcess = spawn(process.execPath, ['--import', TSX_ESM, SERVER_TS], {
    cwd: dir,
    env: cleanEnv({ ...env, PORT: String(port) }),
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let out = ''
  child.stdout?.on('data', (d) => (out += d))
  child.stderr?.on('data', (d) => (out += d))

  let exited = false
  const exitPromise = new Promise<void>((resolve) => {
    child.once('exit', () => {
      exited = true
      resolve()
    })
  })
  const stop = async () => {
    if (!exited) child.kill('SIGTERM')
    await exitPromise
    fs.rmSync(dir, { recursive: true, force: true })
  }
  t.after(stop)

  const base = `http://127.0.0.1:${port}`
  const deadline = Date.now() + 15_000
  for (;;) {
    if (exited) assert.fail(`server.ts exited before serving. Output:\n${out}`)
    try {
      const res = await fetch(`${base}/api/health`)
      if (res.ok) return { base, stdout: () => out, stop }
    } catch {
      // not up yet
    }
    assert.ok(Date.now() < deadline, `server.ts did not start in time. Output:\n${out}`)
    await new Promise((r) => setTimeout(r, 250))
  }
}

test('server.ts loads GEMINI_API_KEY from a sibling .env (the documented first-user flow)', async (t) => {
  const srv = await bootServer(t, { files: { '.env': `GEMINI_API_KEY=${FAKE_KEY}\n` } })

  const res = await fetch(`${srv.base}/api/health`)
  assert.equal(res.status, 200)
  const body = (await res.json()) as Record<string, unknown>
  assert.equal(body.geminiConfigured, true)
  assert.match(srv.stdout(), /Gemini integration: enabled via AI Studio API key/)
  assert.doesNotMatch(JSON.stringify(body), new RegExp(FAKE_KEY))
})

test('server.ts starts cleanly with no .env and reports Gemini disabled', async (t) => {
  const srv = await bootServer(t)

  const res = await fetch(`${srv.base}/api/health`)
  assert.equal(res.status, 200)
  const body = (await res.json()) as Record<string, unknown>
  assert.equal(body.geminiConfigured, false)
  assert.match(srv.stdout(), /Gemini integration: disabled/)
})

test('real environment variables win over .env values', async (t) => {
  const filePort = await freePort()
  const srv = await bootServer(t, { files: { '.env': `PORT=${filePort}\n` } })

  const res = await fetch(`${srv.base}/api/health`)
  assert.equal(res.status, 200)
  // The port from .env must stay unused: the exported PORT won.
  await assert.rejects(fetch(`http://127.0.0.1:${filePort}/api/health`))
})
