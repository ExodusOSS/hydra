import { SafeError } from '@exodus/errors'

import formatStackFrames from '../src/format-stack.js'

const jsEngine = process.env.EXODUS_TEST_PLATFORM

test(`formatStackTrace (${jsEngine})`, () => {
  const actual = formatStackFrames({
    frames: SafeError.from(new Error('my 12 word phrase')).stackFrames,
    jsEngine,
  })

  expect(
    actual.map((frame) => ({ ...frame, colno: expect.any(Number), lineno: expect.any(Number) }))
  ).toMatchSnapshot()
})
