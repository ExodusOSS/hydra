import { getAllowlist, parseString } from '@exodus/safe-string'
import assert from 'minimalistic-assert'
import parseStackTraceNatively, { stackFramesToString } from './stack.js'
import type { Frame } from './types.js'
import { omitUndefined } from './utils.js'
import type { CommonErrorString } from './common-errors.js'
import { toCommonErrorMessage } from './common-errors.js'

export const MAX_LINKED_ERRORS_DEPTH = 5

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
  'SyntaxError',
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

export type SafeName = ReadonlySetValues<typeof SAFE_NAMES_SET>
export type SafeCode = string & { __branded_type: 'SafeCodeOutcome' }
export type SafeString = CommonErrorString | StaticAllowlistString | RuntimeSafeString

export type SafeErrorJSON = {
  name: SafeName
  code?: SafeCode
  hint?: SafeString
  stack?: string
  linkedErrors?: SafeErrorJSON[]
  timestamp: number
}

type UnknownError = Error & {
  hint?: unknown
  code?: unknown
  cause?: unknown
}

const FACTORY_SYMBOL = Symbol('SafeError')

export class SafeError {
  static from<T extends UnknownError>(err: T, depth = 0): SafeError {
    let safeName
    let safeCode
    let safeHint: SafeString | undefined
    let linkedSafeErrors: SafeError[] | undefined
    try {
      const { name, message, hint, code, cause } = err

      safeName = isSafeName(name) ? name : 'UnknownError'

      const safeCodeCandidate = `${code}`
      safeCode = isSafeCode(safeCodeCandidate) ? safeCodeCandidate : undefined
      const hintCandidates = [hint, message].filter((str) => typeof str === 'string')
      safeHint =
        // chicken sacrifice to TypeScript, otherwise would be hintCandidates.find((str) => isSafe(str))
        hintCandidates.map((str) => parseString(str) as RuntimeSafeString).find(Boolean) ||
        staticAllowlist.find((safePrefix) =>
          hintCandidates.some((str) => str.startsWith(safePrefix))
        ) ||
        toCommonErrorMessage(message)

      const safeStack: Frame[] | undefined = parseStackTraceNatively(err)

      if (cause instanceof Error && depth === 0) {
        linkedSafeErrors = []
        let currentCause: unknown = cause

        while (currentCause instanceof Error && ++depth <= MAX_LINKED_ERRORS_DEPTH) {
          try {
            linkedSafeErrors.push(SafeError.from(currentCause as UnknownError, depth))
          } catch {
            linkedSafeErrors.push(FAILED_TO_PARSE_ERROR)
          } finally {
            currentCause = currentCause.cause
          }
        }
      }

      return new SafeError({
        name: safeName,
        code: safeCode,
        hint: safeHint,
        stack: safeStack,
        linkedErrors: linkedSafeErrors,
        initSymbol: FACTORY_SYMBOL,
      })
    } catch {
      try {
        return safeName
          ? new SafeError({
              name: safeName,
              code: safeCode,
              hint: safeHint,
              linkedErrors: linkedSafeErrors,
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
  readonly #linkedErrors?: SafeError[]
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

  get linkedErrors() {
    return this.#linkedErrors
  }

  get timestamp() {
    return this.#timestamp
  }

  toJSON(): SafeErrorJSON {
    return omitUndefined({
      __proto__: null,
      name: this.name,
      code: this.code,
      hint: this.hint,
      stack: this.stack,
      linkedErrors: this.linkedErrors?.map((linkedError) => linkedError.toJSON()),
      timestamp: this.timestamp,
    }) as SafeErrorJSON
  }

  constructor({
    name,
    code,
    hint,
    stack,
    linkedErrors,
    initSymbol,
  }: {
    name: SafeName
    code?: SafeCode
    hint?: SafeString
    stack?: Frame[]
    linkedErrors?: SafeError[]
    initSymbol: typeof FACTORY_SYMBOL
  }) {
    assert(initSymbol === FACTORY_SYMBOL, 'SafeError: use SafeError.from()')

    this.#name = name
    this.#code = code
    this.#hint = hint
    this.#stackFrames = stack?.map((frame) => ({ ...frame }))
    this.#linkedErrors = linkedErrors
    this.#timestamp = Date.now()
  }
}

const FAILED_TO_PARSE_ERROR = new SafeError({
  initSymbol: FACTORY_SYMBOL,
  name: 'SafeErrorFailedToParse',
})
