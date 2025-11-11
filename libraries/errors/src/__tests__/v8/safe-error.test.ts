import { AssertionError } from 'assert'

import { MAX_LINKED_ERRORS_DEPTH, SafeError } from '../../safe-error.js'
import { commonErrorCases } from '../fixtures/common-errors.js'

class CustomizableTestError extends Error {
  name: string = 'CustomizableTestError'
  code: unknown
  hint: unknown

  constructor({
    message,
    name,
    code,
    hint,
  }: {
    message?: string
    name?: string
    code?: unknown
    hint?: unknown
  }) {
    super(message)
    if (name) this.name = name

    this.code = code
    this.hint = hint
  }
}

describe('SafeError', () => {
  jest.spyOn(Date, 'now').mockImplementation(() => 0)

  describe('.from()', () => {
    for (const [errorIn, { missingStack, ...safeErrorOut }] of [
      // name assertions
      // -- unknown error names
      [new ReferenceError('random ref error'), { name: 'UnknownError' }],
      [new CustomizableTestError({ name: 'MyCustomError' }), { name: 'UnknownError' }],
      // -- safe error names
      [new AssertionError({}), { name: 'AssertionError', stack: undefined }],
      [new Error('generic error'), { name: 'Error' }],
      [new TypeError('not number!'), { name: 'TypeError' }],
      [new RangeError('out of bound'), { name: 'RangeError' }],

      // code assertions
      // -- unsafe codes
      [new CustomizableTestError({ code: 'some-things-crashed-code' }), { name: 'UnknownError' }],
      [new CustomizableTestError({ code: 'EXOD--1222' }), { name: 'UnknownError' }],
      [new CustomizableTestError({ code: 'EXOD--12345' }), { name: 'UnknownError' }],
      [new CustomizableTestError({ code: 'EXOD-' }), { name: 'UnknownError' }],
      // -- safe codes
      [new CustomizableTestError({ code: 'EPIPE' }), { name: 'UnknownError', code: 'EPIPE' }],
      [new CustomizableTestError({ code: 'EXOD-0' }), { name: 'UnknownError', code: 'EXOD-0' }],
      [
        new CustomizableTestError({ code: 'EXOD-0101' }),
        { name: 'UnknownError', code: 'EXOD-0101' },
      ],
      [new CustomizableTestError({ code: 'EXOD-22' }), { name: 'UnknownError', code: 'EXOD-22' }],
      [new CustomizableTestError({ code: 22 }), { name: 'UnknownError', code: '22' }],

      // hint assertions
      // -- unsafe hint
      [new CustomizableTestError({ hint: 'some-library-random-hint' }), { name: 'UnknownError' }],
      [new CustomizableTestError({ hint: 200 }), { name: 'UnknownError' }],
      // -- safe hint
      [
        new CustomizableTestError({ hint: 'otherErr:broadcastTx' }),
        {
          name: 'UnknownError',
          hint: 'otherErr:broadcastTx',
        },
      ],
      [
        new CustomizableTestError({ message: 'ethCall:executionReverted' }),
        {
          name: 'UnknownError',
          hint: 'ethCall:executionReverted',
        },
      ],
      [
        new CustomizableTestError({
          message: `getNftArguments bad stuff happened`,
        }),
        {
          name: 'UnknownError',
          hint: 'getNftArguments',
        },
      ],

      // combined cases
      [
        new CustomizableTestError({
          name: 'Error',
          code: 'EXOD-0',
          hint: 'retry:broadcastTx',
        }),
        {
          name: 'Error',
          code: 'EXOD-0',
          hint: 'retry:broadcastTx',
        },
      ],
      [
        new CustomizableTestError({
          name: 'Stuff',
          code: 'EXOD-0',
          hint: 'aaaa',
        }),
        {
          name: 'UnknownError',
          code: 'EXOD-0',
        },
      ],
      ...commonErrorCases,
    ] as typeof commonErrorCases) {
      it(`should convert ${errorIn.name} to ${JSON.stringify(safeErrorOut)}`, () => {
        expect(SafeError.from(errorIn).toJSON()).toEqual({
          stack: expect.any(String),
          timestamp: 0,
          ...safeErrorOut,
        })
      })
    }

    it('should provide stack frames and stack', () => {
      class SomeResourceHandle {
        doStuff() {
          return new CustomizableTestError({ message: 'unexpected things happened' })
        }
      }

      function usefulFunction() {
        return anotherUsefulFunction()
      }

      function anotherUsefulFunction() {
        function innerFunction() {
          return new SomeResourceHandle().doStuff()
        }

        return innerFunction()
      }

      const safeError = SafeError.from(usefulFunction())
      const [frame1, frame2, frame3, frame4] = safeError.stackFrames!
      expect(frame1).toEqual(
        expect.objectContaining({
          function: 'doStuff',
          method: 'doStuff',
          file: expect.stringMatching(/safe-error\.test\.ts$/u),
          line: expect.any(Number),
          column: expect.any(Number),
        })
      )
      expect(frame2).toEqual(
        expect.objectContaining({
          function: 'innerFunction',
          method: null,
          file: expect.stringMatching(/safe-error\.test\.ts$/u),
          line: expect.any(Number),
          column: expect.any(Number),
        })
      )
      expect(frame3).toEqual(
        expect.objectContaining({
          function: 'anotherUsefulFunction',
          method: null,
          file: expect.stringMatching(/safe-error\.test\.ts$/u),
          line: expect.any(Number),
          column: expect.any(Number),
        })
      )
      expect(frame4).toEqual(
        expect.objectContaining({
          function: 'usefulFunction',
          method: null,
          file: expect.stringMatching(/safe-error\.test\.ts$/u),
          line: expect.any(Number),
          column: expect.any(Number),
        })
      )

      expect(safeError.stack).toMatch(
        /UnknownError: unknownHint\n +at doStuff \(.*safe-error\.test\.ts:\d+:\d+\)\n +at innerFunction \(.*safe-error\.test\.ts:\d+:\d+\)\n +at anotherUsefulFunction \(.*safe-error\.test\.ts:\d+:\d+\)\n +at usefulFunction \(.*safe-error\.test\.ts:\d:\d+\)\n[\S\s]*/
      )
    })

    describe('"cause" errors handling', () => {
      it('should handle error with single cause', () => {
        const causeError = new Error('Cause error')
        const mainError = Object.assign(new Error('Main error'), { cause: causeError })

        const safeError = SafeError.from(mainError)

        expect(safeError.linkedErrors).toHaveLength(1)
        expect(safeError.linkedErrors![0]).toEqual(SafeError.from(causeError))
      })

      it('should handle nested cause chain', () => {
        const error3 = new Error('Error 3')
        const error2 = Object.assign(new Error('Error 2'), { cause: error3 })
        const error1 = Object.assign(new Error('Error 1'), { cause: error2 })

        const safeError = SafeError.from(error1)

        expect(safeError.linkedErrors).toHaveLength(2)

        expect(safeError.linkedErrors![0]).toEqual(SafeError.from(error2))
        expect(safeError.linkedErrors![1]).toEqual(SafeError.from(error3))
      })

      it('should cap linkedErrors at MAX_LINKED_ERRORS_DEPTH errors maximum', () => {
        let currentError = new Error('Test error')
        for (let i = MAX_LINKED_ERRORS_DEPTH * 100; i >= 1; i--) {
          currentError = Object.assign(new Error(`Test error ${i}`), { cause: currentError })
        }

        const safeError = SafeError.from(currentError)

        expect(safeError.linkedErrors).toHaveLength(MAX_LINKED_ERRORS_DEPTH)
      })

      it('should handle non-Error cause gracefully', () => {
        const mainError = Object.assign(new Error('Main error'), { cause: 'string cause' })

        const safeError = SafeError.from(mainError)

        expect(safeError.linkedErrors).toBeUndefined()
      })
    })
  })

  it('should throw error when constructed directly', () => {
    type FirstConstructorArg<T> = T extends new (arg1: infer A, ...args: any[]) => any ? A : never

    const safeErrorConstructionArguments = {
      name: 'UnknownError',
      initSymbol: Symbol('SafeError'),
    } as FirstConstructorArg<typeof SafeError> // we have to 'lie' a little bit to make TS happy

    expect(() => new SafeError(safeErrorConstructionArguments)).toThrow(
      'SafeError: use SafeError.from()'
    )
  })

  it('should prevent setting state', () => {
    const safeError = SafeError.from(new Error('stuff'))

    expect(() => {
      // @ts-expect-error: ignore TS restrictions
      safeError.name = undefined
    }).toThrow('Cannot set property')

    expect(() => {
      // @ts-expect-error: ignore TS restrictions
      safeError.code = undefined
    }).toThrow('Cannot set property')

    expect(() => {
      // @ts-expect-error: ignore TS restrictions
      safeError.hint = undefined
    }).toThrow('Cannot set property')

    expect(() => {
      // @ts-expect-error: ignore TS restrictions
      safeError.stackFrames = undefined
    }).toThrow('Cannot set property')
  })

  it('should prevent mutating the state from returned references', () => {
    const safeError = SafeError.from(new Error('stuff'))

    const observedLine = safeError.stackFrames![0]!.line
    safeError.stackFrames![0]!.line = -9999
    expect(safeError.stackFrames![0]!.line).toBe(observedLine)

    const observedStackLength = safeError.stackFrames!.length
    safeError.stackFrames!.push({})
    expect(safeError.stackFrames!.length).toBe(observedStackLength)
  })
})
