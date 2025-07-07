import { stackFramesToString } from '../../stack.js'

describe('stackFramesToString', () => {
  it('returns undefined when no stack frames', () => {
    expect(stackFramesToString()).toBeUndefined()
  })

  it('converts stack frames to string', () => {
    expect(
      stackFramesToString([
        {
          function: 'fn1',
          method: null,
          file: 'file1',
          line: 1,
          column: 2,
        },
        {
          function: null,
          method: null,
          file: 'file2',
          line: null,
          column: null,
        },
        {
          function: null,
          method: null,
          file: undefined,
          line: null,
          column: null,
        },
      ])
    ).toEqual(
      `    at fn1 (file1:1:2)
    at unknownFn (file2)
    at unknownFn`
    )
  })
})
