// FAA NAS airport-status adapter (delays and closures).
// The upstream is XML, not JSON. Parse with string/regex only — a half-parsed
// delay is worse than an honest error. Empty-but-valid (no delays) is healthy.

const FAA_STATUS_URL = 'https://nasstatus.faa.gov/api/airport-status-information'
const TIMEOUT_MS = 15_000
const CACHE_TTL_MS = 2 * 60 * 1000

const ROOT_OPEN = '<AIRPORT_STATUS_INFORMATION'
const ROOT_CLOSE = '</AIRPORT_STATUS_INFORMATION>'

// Record wrappers used by the FAA DTD. Anything with an <ARPT> outside these
// is an unexpected shape and must fail closed.
const ITEM_TAGS = ['Airport', 'Ground_Delay', 'Program', 'Delay'] as const

export interface AirportDelay {
  airport: string | null
  delayType: string | null
  reason: string | null
  avgDelay: string | null
  raw: string | null
}

export interface FaaStatusResult {
  delays: AirportDelay[]
  updateTime: string | null
  fetchedAt: string
  error?: string
}

// Keyed by the fetch implementation so injected test doubles never share a
// production (or each other's) cache slot.
const cache = new WeakMap<typeof fetch, { at: number; result: FaaStatusResult }>()

export async function fetchFaaStatus(opts: {
  fetchImpl?: typeof fetch
  now?: () => Date
} = {}): Promise<FaaStatusResult> {
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch
  const clock = opts.now ?? (() => new Date())
  const nowDate = clock()
  const fetchedAt = nowDate.toISOString()
  const at = nowDate.getTime()

  const hit = cache.get(fetchImpl)
  if (hit && at - hit.at < CACHE_TTL_MS) {
    return hit.result
  }

  let result: FaaStatusResult
  try {
    const res = await fetchImpl(FAA_STATUS_URL, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    if (!res.ok) {
      result = failed(fetchedAt, `HTTP ${res.status}`)
    } else {
      const text = await res.text()
      const parsed = parseFaaXml(text)
      result =
        'error' in parsed
          ? failed(fetchedAt, parsed.error)
          : { delays: parsed.delays, updateTime: parsed.updateTime, fetchedAt }
    }
  } catch (err) {
    result = failed(fetchedAt, err instanceof Error ? err.message : String(err))
  }

  cache.set(fetchImpl, { at, result })
  return result
}

function failed(fetchedAt: string, error: string): FaaStatusResult {
  return { delays: [], updateTime: null, fetchedAt, error }
}

function parseFaaXml(
  text: string
): { delays: AirportDelay[]; updateTime: string | null } | { error: string } {
  const body = text.trim()
  if (!body) return { error: 'FAA NAS status response is empty' }
  if (looksLikeHtml(body)) return { error: 'FAA NAS status response is HTML, not XML' }
  if (!body.includes(ROOT_OPEN) || !body.includes(ROOT_CLOSE)) {
    return { error: 'FAA NAS status XML is truncated or not the expected document' }
  }

  const openIdx = body.indexOf(ROOT_OPEN)
  const closeIdx = body.indexOf(ROOT_CLOSE)
  if (closeIdx < openIdx) {
    return { error: 'FAA NAS status XML is truncated or malformed' }
  }

  const openEnd = body.indexOf('>', openIdx)
  if (openEnd === -1 || openEnd > closeIdx) {
    return { error: 'FAA NAS status XML is truncated or malformed' }
  }

  const inner = body.slice(openEnd + 1, closeIdx)
  const openCount = countTag(inner, '<Delay_type>')
  const closeCount = countTag(inner, '</Delay_type>')
  if (openCount !== closeCount) {
    return { error: 'FAA NAS status XML is truncated or malformed' }
  }

  const delayBlocks = extractAll(inner, 'Delay_type')
  if (delayBlocks.length !== openCount) {
    return { error: 'FAA NAS status XML is truncated or malformed' }
  }

  const delays: AirportDelay[] = []
  for (const block of delayBlocks) {
    const parsed = parseDelayType(block)
    if ('error' in parsed) return parsed
    delays.push(...parsed.delays)
  }

  return { delays, updateTime: extractTag(inner, 'Update_Time') }
}

function parseDelayType(block: string): { delays: AirportDelay[] } | { error: string } {
  if (countTag(block, '<Name>') !== countTag(block, '</Name>') || countTag(block, '<Name>') === 0) {
    return { error: 'FAA NAS status XML Delay_type is missing Name' }
  }
  const delayType = extractTag(block, 'Name')

  const arptOpens = countTag(block, '<ARPT>')
  const arptCloses = countTag(block, '</ARPT>')
  if (arptOpens !== arptCloses) {
    return { error: 'FAA NAS status XML is truncated or malformed' }
  }

  const items: string[] = []
  for (const tag of ITEM_TAGS) {
    items.push(...extractAllRaw(block, tag))
  }

  const capturedArpts = items.reduce((n, item) => n + countTag(item, '<ARPT>'), 0)
  if (arptOpens !== capturedArpts) {
    return { error: 'FAA NAS status XML has ARPT elements outside a recognized delay record' }
  }

  const delays: AirportDelay[] = []
  for (const raw of items) {
    const airport = extractTag(raw, 'ARPT')
    const reason = extractTag(raw, 'Reason')
    const avgDelay = extractTag(raw, 'Avg')
    if (airport === null && reason === null && avgDelay === null) continue
    delays.push({ airport, delayType, reason, avgDelay, raw })
  }
  return { delays }
}

function looksLikeHtml(text: string): boolean {
  const head = text.slice(0, 512).toLowerCase()
  return /<!doctype\s+html/.test(head) || /<html[\s>]/.test(head) || /<head[\s>]/.test(head) || /<body[\s>]/.test(head)
}

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(tagRe(tag))
  if (!match) return null
  const value = decodeEntities(match[1].trim())
  return value === '' ? null : value
}

function extractAll(xml: string, tag: string): string[] {
  const re = tagRe(tag, 'g')
  const out: string[] = []
  let match: RegExpExecArray | null
  while ((match = re.exec(xml))) out.push(match[1])
  return out
}

function extractAllRaw(xml: string, tag: string): string[] {
  const re = tagRe(tag, 'g')
  const out: string[] = []
  let match: RegExpExecArray | null
  while ((match = re.exec(xml))) out.push(match[0])
  return out
}

function tagRe(tag: string, flags?: string): RegExp {
  return new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, flags)
}

function countTag(xml: string, token: string): number {
  let count = 0
  let from = 0
  while (from < xml.length) {
    const at = xml.indexOf(token, from)
    if (at === -1) break
    count += 1
    from = at + token.length
  }
  return count
}

function decodeEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}
