import type { TraceId } from './types.js'

const ZERO_TRACE_ID = '00000000000000000000000000000000'
const ZERO_PARENT_ID = '0000000000000000'
const VERSION_00 = '00'
export const STORAGE_LIMIT = 1000

const traceIds = new Set<TraceId>()

function isExodusDomain(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    const normalizedHost = hostname.toLowerCase()
    return normalizedHost.endsWith('.exodus.io') || normalizedHost === 'exodus.io'
  } catch {
    return false
  }
}

/**
 * Validates and whitelists trace IDs from server responses to prevent
 * user-supplied strings from being used in error reporting.
 */
function captureTraceId(response: Response): TraceId | undefined {
  if (!(response instanceof Response)) {
    return
  }

  if (!isExodusDomain(response.url)) {
    return
  }

  const traceparent = response.headers.get('traceparent')
  if (typeof traceparent !== 'string') {
    return
  }

  // Format: https://www.w3.org/TR/trace-context/#traceparent-header.
  const parts = traceparent.split('-')
  if (parts.length !== 4) {
    return
  }

  // Default to empty string if not present to make TypeScript happy.
  const [version, traceId = '', parentId = '', traceFlags = ''] = parts

  if (version !== VERSION_00) {
    return
  }

  if (!/^[\da-f]{32}$/iu.test(traceId) || traceId === ZERO_TRACE_ID) {
    return
  }

  if (!/^[\da-f]{16}$/iu.test(parentId) || parentId === ZERO_PARENT_ID) {
    return
  }

  if (!/^[\da-f]{2}$/iu.test(traceFlags)) {
    return
  }

  addTraceId(traceId as TraceId)
  return traceId as TraceId
}

function addTraceId(traceId: TraceId): void {
  if (traceIds.has(traceId)) {
    return
  }

  if (traceIds.size >= STORAGE_LIMIT) {
    const oldestTraceId = traceIds.values().next().value
    traceIds.delete(oldestTraceId!)
  }

  traceIds.add(traceId)
}

function isTraceId(traceId: string): traceId is TraceId {
  return traceIds.has(traceId as TraceId)
}

export { captureTraceId, isTraceId }
