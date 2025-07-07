import { getAllowlist, isSafe } from '@exodus/safe-string'
import assert from 'minimalistic-assert'
import parseStackTraceNatively, { stackFramesToString } from './stack.js'
import type { Frame } from './types.js'
import { omitUndefined } from './utils.js'
import type { CommonErrorString } from './common-errors.js'
import { toCommonErrorMessage } from './common-errors.js'

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

function isSafeName(value: string): value is SafeName {
  return (SAFE_NAMES_SET as ReadonlySet<string>).has(value)
}

function isExodusErrorCode(code: string) {
  return /^(EXOD-)?\d{1,4}$/u.test(code)
}

function isSafeCode(value: string): value is SafeCode {
  return (SAFE_CODES_SET as ReadonlySet<string>).has(value) || isExodusErrorCode(value)
}

type StaticAllowlistString = string & { __branded_type: 'StaticAllowlistString' }
const staticAllowlist = getAllowlist() as StaticAllowlistString[]

type RuntimeSafeString = string & { __branded_type: 'RuntimeSafeString' }

function getSafeString(str: string): RuntimeSafeString | undefined {
  if (isSafe(str)) return str as RuntimeSafeString
}

export type SafeName = ReadonlySetValues<typeof SAFE_NAMES_SET>
export type SafeCode = string & { __branded_type: 'SafeCodeOutcome' }
export type SafeString = CommonErrorString | StaticAllowlistString | RuntimeSafeString

type UnknownError = Error & {
  hint?: unknown
  code?: unknown
}

const FACTORY_SYMBOL = Symbol('SafeError')

export class SafeError {
  static from<T extends UnknownError>(err: T): SafeError {
    let safeName
    let safeCode
    let safeHint: SafeString | undefined
    try {
      const { name, message, hint, code } = err

      safeName = isSafeName(name) ? name : 'UnknownError'

      const safeCodeCandidate = `${code}`
      safeCode = isSafeCode(safeCodeCandidate) ? safeCodeCandidate : undefined
      const hintCandidates = [hint, message].filter((str) => typeof str === 'string')
      safeHint =
        // chicken sacrifice to TypeScript, otherwise would be hintCandidates.find((str) => isSafe(str))
        hintCandidates.map((str) => getSafeString(str)).find(Boolean) ||
        staticAllowlist.find((safePrefix) =>
          hintCandidates.some((str) => str.startsWith(safePrefix))
        ) ||
        toCommonErrorMessage(message)

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
  readonly #hint?: SafeString
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
      hint?: SafeString
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
    hint?: SafeString
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
