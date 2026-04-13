import { isTraceId, STORAGE_LIMIT } from '../src/capture-trace-id.js'
import { captureTraceId, isSafe } from '../src/index.js'

const VALID_PARENT_ID = 'b7ad6b7169203331'
const VALID_TRACE_FLAGS = '01'
const EXODUS_URL = 'https://exodus.io/api'

let traceIdCounter = 0

function uniqueTraceId(): string {
  traceIdCounter++
  return traceIdCounter.toString(16).padStart(32, '0')
}

function createResponse(traceparent: string | null, url = EXODUS_URL): Response {
  const headers = new Headers()
  if (traceparent !== null) {
    headers.set('traceparent', traceparent)
  }

  const response = new Response(null, { headers })
  Object.defineProperty(response, 'url', { value: url })
  return response
}

function createTraceparent(
  version = '00',
  traceId = uniqueTraceId(),
  parentId = VALID_PARENT_ID,
  traceFlags = VALID_TRACE_FLAGS
): string {
  return `${version}-${traceId}-${parentId}-${traceFlags}`
}

describe('captureTraceId', () => {
  it('should extract valid trace ID from exodus.io response', () => {
    const traceId = uniqueTraceId()
    const traceparent = createTraceparent('00', traceId)
    const response = createResponse(traceparent, 'https://exodus.io/api')

    const result = captureTraceId(response)

    expect(result).toBe(traceId)
  })

  it('should extract valid trace ID from exodus.io subdomain', () => {
    const traceId = uniqueTraceId()
    const traceparent = createTraceparent('00', traceId)
    const response = createResponse(traceparent, 'https://api.exodus.io/v1/users')

    const result = captureTraceId(response)

    expect(result).toBe(traceId)
  })

  it('should return undefined for non-exodus domain', () => {
    const traceId = uniqueTraceId()
    const traceparent = createTraceparent('00', traceId)

    expect(captureTraceId(createResponse(traceparent, 'https://example.com'))).toBeUndefined()
    expect(
      captureTraceId(createResponse(traceparent, 'https://definitely-not-exodus.io'))
    ).toBeUndefined()
    expect(
      captureTraceId(createResponse(traceparent, 'https://exodus.io.example.com'))
    ).toBeUndefined()
  })

  it('should mark captured trace IDs as safe', () => {
    const traceId = uniqueTraceId()
    expect(isSafe(traceId)).toBe(false)

    const response = createResponse(createTraceparent('00', traceId))
    captureTraceId(response)

    expect(isSafe(traceId)).toBe(true)
  })

  it('should return undefined for non-Response input', () => {
    // @ts-expect-error testing invalid input
    expect(captureTraceId(null)).toBeUndefined()
    // @ts-expect-error testing invalid input
    expect(captureTraceId({})).toBeUndefined()
    // @ts-expect-error testing invalid input
    expect(captureTraceId('string')).toBeUndefined()
  })

  it('should return undefined when traceparent header is missing', () => {
    const response = createResponse(null)

    expect(captureTraceId(response)).toBeUndefined()
  })

  it('should return undefined for invalid format (wrong number of parts)', () => {
    expect(captureTraceId(createResponse('00-abc-def'))).toBeUndefined()
    expect(captureTraceId(createResponse('00-abc'))).toBeUndefined()
    expect(captureTraceId(createResponse('00'))).toBeUndefined()
    expect(captureTraceId(createResponse('00-abc-def-01-extra'))).toBeUndefined()
  })

  it('should return undefined for invalid version', () => {
    const traceparent = createTraceparent('01')
    expect(captureTraceId(createResponse(traceparent))).toBeUndefined()

    const traceparent2 = createTraceparent('ff')
    expect(captureTraceId(createResponse(traceparent2))).toBeUndefined()
  })

  it('should return undefined for invalid trace ID format', () => {
    const tooShort = createTraceparent('00', 'abc123')
    expect(captureTraceId(createResponse(tooShort))).toBeUndefined()

    const traceId = uniqueTraceId()
    const tooLong = createTraceparent('00', traceId + 'aa')
    expect(captureTraceId(createResponse(tooLong))).toBeUndefined()

    const nonHex = createTraceparent('00', 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz')
    expect(captureTraceId(createResponse(nonHex))).toBeUndefined()
  })

  it('should return undefined for zero trace ID', () => {
    const zeroTraceId = createTraceparent('00', '00000000000000000000000000000000')
    expect(captureTraceId(createResponse(zeroTraceId))).toBeUndefined()
  })

  it('should return undefined for invalid parent ID format', () => {
    const traceId = uniqueTraceId()
    const tooShort = createTraceparent('00', traceId, 'abc123')
    expect(captureTraceId(createResponse(tooShort))).toBeUndefined()

    const traceId2 = uniqueTraceId()
    const tooLong = createTraceparent('00', traceId2, VALID_PARENT_ID + 'aa')
    expect(captureTraceId(createResponse(tooLong))).toBeUndefined()

    const traceId3 = uniqueTraceId()
    const nonHex = createTraceparent('00', traceId3, 'zzzzzzzzzzzzzzzz')
    expect(captureTraceId(createResponse(nonHex))).toBeUndefined()
  })

  it('should return undefined for zero parent ID', () => {
    const traceId = uniqueTraceId()
    const zeroParentId = createTraceparent('00', traceId, '0000000000000000')
    expect(captureTraceId(createResponse(zeroParentId))).toBeUndefined()
  })

  it('should return undefined for invalid trace flags format', () => {
    const traceId1 = uniqueTraceId()
    const tooShort = createTraceparent('00', traceId1, VALID_PARENT_ID, '1')
    expect(captureTraceId(createResponse(tooShort))).toBeUndefined()

    const traceId2 = uniqueTraceId()
    const tooLong = createTraceparent('00', traceId2, VALID_PARENT_ID, '011')
    expect(captureTraceId(createResponse(tooLong))).toBeUndefined()

    const traceId3 = uniqueTraceId()
    const nonHex = createTraceparent('00', traceId3, VALID_PARENT_ID, 'zz')
    expect(captureTraceId(createResponse(nonHex))).toBeUndefined()
  })
})

describe('isTraceId', () => {
  it('should return false for uncaptured trace ID', () => {
    const traceId = uniqueTraceId()
    expect(isTraceId(traceId)).toBe(false)
  })

  it('should return true after trace ID is captured', () => {
    const traceId = uniqueTraceId()
    const response = createResponse(createTraceparent('00', traceId))
    captureTraceId(response)

    expect(isTraceId(traceId)).toBe(true)
  })

  it('should return false for arbitrary strings', () => {
    expect(isTraceId('random-string')).toBe(false)
    expect(isTraceId('')).toBe(false)
  })
})

describe('trace ID storage limit', () => {
  it('should evict oldest trace ID when storage limit is reached', () => {
    const firstTraceId = uniqueTraceId()
    const firstResponse = createResponse(createTraceparent('00', firstTraceId))
    captureTraceId(firstResponse)

    expect(isTraceId(firstTraceId)).toBe(true)

    for (let j = 0; j < STORAGE_LIMIT; j++) {
      const response = createResponse(createTraceparent('00'))
      captureTraceId(response)
    }

    expect(isTraceId(firstTraceId)).toBe(false)

    const lastTraceId = uniqueTraceId()
    const lastResponse = createResponse(createTraceparent('00', lastTraceId))
    captureTraceId(lastResponse)
    expect(isTraceId(lastTraceId)).toBe(true)
  })
})
