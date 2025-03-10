import parseStackTrace from '../../stack.js'
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
