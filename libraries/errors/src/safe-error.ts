import assert from 'minimalistic-assert'
import parseStackTraceNatively, { stackFramesToString } from './stack.js'
import type { Frame } from './types.js'
import { omitUndefined } from './utils.js'

type ReadonlySetValues<S> = S extends ReadonlySet<infer T> ? T : never

function makeReadonlySet<const T>(values: T[]): ReadonlySet<T> {
  return new Set(values)
}

const SAFE_CODES_SET = makeReadonlySet(['EPIPE'])

const SAFE_NAMES_SET = makeReadonlySet([
  'Error',
  'AssertionError',
  'TypeError',
  'RangeError',
  'UnknownError',
  'SafeErrorFailedToParse',
  'TimeoutError',
])

const safeHints = {
  __proto__: null,
  broadcastTx: {
    general: 'broadcastTx',
    other: 'otherErr:broadcastTx',
    retry: 'retry:broadcastTx',
  },
  getNftArguments: {
    general: 'getNftArguments',
  },
  ethCall: {
    general: 'ethCall',
    executionReverted: 'ethCall:executionReverted',
  },
  safeError: {
    failedToParse: 'failed to parse error',
  },
} as const

const SAFE_HINTS_SET = makeReadonlySet(
  // @ts-expect-error doesn't like __proto__: null
  Object.values(safeHints).flatMap((safeHintCategory) => Object.values(safeHintCategory))
)

function getSafeHint(value: unknown): SafeHint | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  if (value === '') {
    return undefined
  }

  if (isSafeHint(value)) {
    return value
  }

  return [...SAFE_HINTS_SET].find((sh) => value.includes(sh))
}

function isSafeHint(value: string): value is SafeHint {
  return (SAFE_HINTS_SET as ReadonlySet<string>).has(value)
}

function isSafeName(value: string): value is SafeName {
  return (SAFE_NAMES_SET as ReadonlySet<string>).has(value)
}

function isExodusErrorCode(code: string) {
  return /^(EXOD-)?\d{1,4}$/u.test(code)
}

function isSafeCode(value: string): value is SafeCode {
  return (SAFE_CODES_SET as ReadonlySet<string>).has(value) || isExodusErrorCode(value)
}

export type SafeName = ReadonlySetValues<typeof SAFE_NAMES_SET>
export type SafeHint = ReadonlySetValues<typeof SAFE_HINTS_SET>
export type SafeCode = string & { __branded_type: 'SafeCodeOutcome' }

type UnknownError = Error & {
  hint?: unknown
  code?: unknown
}

const FACTORY_SYMBOL = Symbol('SafeError')

export class SafeError {
  static readonly hints = safeHints

  static from<T extends UnknownError>(err: T): SafeError {
    let safeName
    let safeCode
    let safeHint
    try {
      const { name, message, hint, code } = err

      safeName = isSafeName(name) ? name : 'UnknownError'

      const safeCodeCandidate = `${code}`
      safeCode = isSafeCode(safeCodeCandidate) ? safeCodeCandidate : undefined
      safeHint = getSafeHint(hint) || getSafeHint(message)

      const safeStack: Frame[] | undefined = parseStackTraceNatively(err)

      return new SafeError({
        name: safeName,
        code: safeCode,
        hint: safeHint,
        stack: safeStack,
        initSymbol: FACTORY_SYMBOL,
      })
    } catch {
      try {
        return safeName
          ? new SafeError({
              name: safeName,
              code: safeCode,
              hint: safeHint,
              initSymbol: FACTORY_SYMBOL,
            })
          : FAILED_TO_PARSE_ERROR
      } catch {
        return FAILED_TO_PARSE_ERROR
      }
    }
  }

  readonly #name: SafeName
  readonly #code?: SafeCode
  readonly #hint?: SafeHint
  readonly #stackFrames?: Frame[]
  readonly #timestamp: number

  get name() {
    return this.#name
  }

  get code() {
    return this.#code
  }

  get hint() {
    return this.#hint
  }

  get stackFrames() {
    return this.#stackFrames?.map((frame) => ({ __proto__: null, ...frame }))
  }

  get stack() {
    const stackTrace = stackFramesToString(this.stackFrames)
    return stackTrace
      ? `${this.name}: ${this.code || this.hint || 'unknownHint'}\n${stackTrace}`
      : undefined
  }

  get timestamp() {
    return this.#timestamp
  }

  toJSON() {
    return omitUndefined({
      __proto__: null,
      name: this.name,
      code: this.code,
      hint: this.hint,
      stack: this.stack,
      timestamp: this.timestamp,
    }) as {
      name: SafeName
      code?: SafeCode
      hint?: SafeHint
      stack?: string
      timestamp: number
    }
  }

  constructor({
    name,
    code,
    hint,
    stack,
    initSymbol,
  }: {
    name: SafeName
    code?: SafeCode
    hint?: SafeHint
    stack?: Frame[]
    initSymbol: typeof FACTORY_SYMBOL
  }) {
    assert(initSymbol === FACTORY_SYMBOL, 'SafeError: use SafeError.from()')

    this.#name = name
    this.#code = code
    this.#hint = hint
    this.#stackFrames = stack?.map((frame) => ({ ...frame }))
    this.#timestamp = Date.now()
  }
}

const FAILED_TO_PARSE_ERROR = new SafeError({
  initSymbol: FACTORY_SYMBOL,
  name: 'SafeErrorFailedToParse',
})
