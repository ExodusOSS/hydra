import { AssertionError } from 'assert'

import { SafeError } from '../../index.js'

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
    for (const [errorIn, safeErrorOut] of [
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
        new CustomizableTestError({ hint: SafeError.hints.broadcastTx.other }),
        {
          name: 'UnknownError',
          hint: SafeError.hints.broadcastTx.other,
        },
      ],
      [
        new CustomizableTestError({ message: SafeError.hints.ethCall.executionReverted }),
        {
          name: 'UnknownError',
          hint: SafeError.hints.ethCall.executionReverted,
        },
      ],
      [
        new CustomizableTestError({
          message: `${SafeError.hints.getNftArguments.general} bad stuff happened`,
        }),
        {
          name: 'UnknownError',
          hint: SafeError.hints.getNftArguments.general,
        },
      ],

      // combined cases
      [
        new CustomizableTestError({
          name: 'Error',
          code: 'EXOD-0',
          hint: SafeError.hints.broadcastTx.retry,
        }),
        {
          name: 'Error',
          code: 'EXOD-0',
          hint: SafeError.hints.broadcastTx.retry,
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
    ]) {
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
