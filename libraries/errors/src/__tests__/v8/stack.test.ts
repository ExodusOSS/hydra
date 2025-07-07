import parseStackTrace, { captureStackTrace } from '../../stack.js'
import { extendedExpect } from '../setup.js'

function foo() {
  return new Error('boo')
}

it(`gets stack trace for v8`, () => {
  const err = foo()
  const stack = parseStackTrace(err)!
  const { stack: originalStack } = err
  expect(err.stack).toEqual(originalStack)
  expect(Array.isArray(stack)).toBe(true)

  const callSiteMatcher = {
    // all other props are matched exactly
    file: extendedExpect.filePath(),
    line: extendedExpect.number(),
    column: extendedExpect.number(),
  }

  expect({ ...stack }).toMatchSnapshot({
    ...Array.from({ length: stack.length }).fill(callSiteMatcher),
  })
})

it('parseStackTrace should return undefined if error.stack was accessed before', () => {
  const err = new Error('stuff')
  void err.stack

  const stack = parseStackTrace(err)!
  expect(stack).toEqual(undefined)
})

it('parseStackTrace should capture stack trace even if error.stack was accessed before', () => {
  const err2 = new Error('stuff')
  captureStackTrace(err2)
  void err2.stack

  expect(parseStackTrace(err2)).toBeInstanceOf(Array)
  expect(parseStackTrace(err2)!.length).toBeGreaterThan(0)
})
