import { afterEach, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Window } from 'happy-dom'
import ManagerDrafts from '../src/components/ManagerDrafts'
import { STATIONS } from '../src/data/stations'

type PendingRequest = {
  body: { station: string; topic: string }
  signal: AbortSignal | undefined
  resolve: (response: Response) => void
  reject: (error: Error) => void
}

let window: Window
let root: Root
let container: HTMLElement
let requests: PendingRequest[]
let copied: string[]
let originals: Map<string, PropertyDescriptor | undefined>

beforeEach(() => {
  window = new Window({ url: 'http://localhost' })
  requests = []
  copied = []
  originals = new Map()
  const globals = {
    window,
    document: window.document,
    navigator: { clipboard: { writeText: async (text: string) => { copied.push(text) } } },
    IS_REACT_ACT_ENVIRONMENT: true,
    fetch: (_url: string, options: RequestInit) => new Promise<Response>((resolve, reject) => {
      requests.push({ body: JSON.parse(options.body as string), signal: options.signal ?? undefined, resolve, reject })
    }),
  }
  for (const [name, value] of Object.entries(globals)) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name))
    Object.defineProperty(globalThis, name, { value, writable: true, configurable: true })
  }
  container = window.document.createElement('div') as unknown as HTMLElement
  window.document.body.appendChild(container as never)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  await window.happyDOM.close()
  for (const [name, descriptor] of originals) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor)
    else Reflect.deleteProperty(globalThis, name)
  }
})

async function render(station = STATIONS[0]) {
  await act(async () => root.render(createElement(ManagerDrafts, { station })))
}

function button(label: string): HTMLButtonElement {
  const found = [...container.querySelectorAll('button')].find(element => element.textContent === label)
  assert.ok(found, `Missing button: ${label}`)
  return found
}

async function click(label: string) {
  await act(async () => button(label).click())
}

async function complete(index: number, draft: string) {
  await act(async () => requests[index].resolve(new Response(JSON.stringify({ draft, source: 'fallback' }))))
}

test('switching brief type clears a completed draft instead of relabeling it', async () => {
  await render()
  await click('Generate Pre-Shift Readiness Brief')
  await complete(0, 'PRE-SHIFT GOLDEN')
  assert.equal(container.querySelector('[aria-label="Generated draft"]')?.textContent, 'PRE-SHIFT GOLDEN')

  button('Shift Handoff Brief').focus()
  await click('Shift Handoff Brief')
  assert.equal(container.querySelectorAll('[aria-label="Generated draft"]').length, 0)
  assert.equal(button('Generate Shift Handoff Brief').disabled, false)
  assert.equal(window.document.activeElement?.textContent, 'Shift Handoff Brief')
})

test('late station response cannot replace the new station draft or loading state', async () => {
  await render(STATIONS[0])
  await click('Generate Pre-Shift Readiness Brief')
  await render(STATIONS[1])
  assert.equal(button('Generate Pre-Shift Readiness Brief').disabled, false)
  await click('Generate Pre-Shift Readiness Brief')
  assert.equal(requests[0].body.station, STATIONS[0].name)
  assert.equal(requests[1].body.station, STATIONS[1].name)

  // Resolve despite cancellation to model a transport that cannot stop in time.
  await complete(0, 'STALE STATION GOLDEN')
  assert.equal(container.querySelectorAll('[aria-label="Generated draft"]').length, 0)
  assert.equal(button('Drafting manager brief…').disabled, true)
  await complete(1, 'CURRENT STATION GOLDEN')
  assert.equal(container.querySelector('[aria-label="Generated draft"]')?.textContent, 'CURRENT STATION GOLDEN')
  assert.equal(container.querySelector('.recon-draft-toolbar small')?.textContent, STATIONS[1].name)
  await click('Copy draft')
  assert.deepEqual(copied, ['CURRENT STATION GOLDEN'])
})

test('late failure after a topic change does not overwrite the new request', async () => {
  await render()
  await click('Generate Pre-Shift Readiness Brief')
  await click('Shift Handoff Brief')
  assert.equal(button('Generate Shift Handoff Brief').disabled, false)
  await click('Generate Shift Handoff Brief')
  assert.equal(requests[1].body.topic, 'handoff')
  await act(async () => requests[0].reject(new Error('old connection failed')))
  assert.equal(container.querySelectorAll('[aria-label="Generated draft"]').length, 0)
  assert.equal(button('Drafting manager brief…').disabled, true)
  await complete(1, 'HANDOFF GOLDEN')
  assert.equal(container.querySelector('[aria-label="Generated draft"]')?.textContent, 'HANDOFF GOLDEN')
})

test('changing context cancels the old transport; current errors remain visible and retryable', async () => {
  await render()
  await click('Generate Pre-Shift Readiness Brief')
  const signal = requests[0].signal
  await click('After-Action Summary')
  assert.equal(signal?.aborted, true)
  await click('Generate After-Action Summary')
  await act(async () => requests[1].reject(new Error('current connection failed')))
  assert.match(container.querySelector('[aria-label="Generated draft"]')?.textContent ?? '', /Unable to reach/)
  assert.equal(button('Copy draft').disabled, true)
  await click('Generate After-Action Summary')
  await complete(2, 'RETRY GOLDEN')
  assert.equal(button('Copy draft').disabled, false)
})
