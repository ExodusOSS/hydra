import { SafeError } from '@exodus/errors'

import formatStackFrames from '../src/format-stack.js'
import type { JsEngine } from '../src/types.js'

// EXODUS_TEST_PLATFORM is set by the test runner ('node', 'jsc', 'hermes', ...).
// formatStackFrames only special-cases 'hermes'; other values traverse the same
// code path. Cast at the env boundary — env vars are inherently `string | undefined`.
const jsEngine = process.env.EXODUS_TEST_PLATFORM as JsEngine

test(`formatStackTrace (${jsEngine})`, () => {
  const stackFrames = SafeError.from(new Error('my 12 word phrase')).stackFrames
  if (!stackFrames) throw new Error('expected stackFrames to be defined')
  const actual = formatStackFrames({
    frames: stackFrames,
    jsEngine,
  })

  expect(
    actual.map((frame) => ({ ...frame, colno: expect.any(Number), lineno: expect.any(Number) }))
  ).toMatchSnapshot()
})
