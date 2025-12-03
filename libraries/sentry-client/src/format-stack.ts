import type { SentryStackFrame, RewriteFilenameParams, FormatStackFramesParams } from './types.js'

// adapted from MIT-licensed
// https://github.com/getsentry/sentry-javascript/blob/03b74616740ac867c6b6b5e75d91ff5779ca972c/packages/utils/src/stacktrace.ts
// https://github.com/getsentry/sentry-react-native/blob/8df8f60cddb3398f535cd16295db25f4201ed961/src/js/integrations/rewriteframes.ts#L41

// Copyright (c) 2019 Sentry (https://sentry.io) and individual contributors. All rights reserved.

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
// Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// Copyright (c) 2011 Felix Geisendörfer (felix@debuggable.com)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

const STACKTRACE_FRAME_LIMIT = 50

// adapted from MIT-licensed
// https://github.com/getsentry/sentry-react-native/blob/ff6e2679d124113853f3a2d10d5812614151cbd1/src/js/integrations/rewriteframes.ts#L16

const rewriteFilename = ({ frame: _frame, jsEngine }: RewriteFilenameParams): SentryStackFrame => {
  const frame = { ..._frame }
  if (!frame.filename) return frame

  frame.filename = frame.filename
    .replace(/^file:\/\//u, '')
    .replace(/^address at /u, '')
    .replace(/^.*\/[^.]+(\.app|.*(?=\/))/u, '')

  if (frame.filename === '[native code]' || frame.filename === 'native') {
    return frame
  }

  // Check Hermes Bytecode Frame and convert to 1-based column
  if (jsEngine === 'hermes' && frame.lineno === 1 && frame.colno !== undefined) {
    // hermes bytecode columns are 0-based, while v8 and jsc are 1-based
    // Hermes frames without debug info have always line = 1 and col points to a bytecode pos
    // https://github.com/facebook/react/issues/21792#issuecomment-873171991
    frame.colno += 1
  }

  // https://github.com/getsentry/sentry-react-native/issues/3348
  if (frame.filename === '/InternalBytecode.js') {
    frame.in_app = false
  }

  const appPrefix = 'app://'
  // We always want to have a triple slash
  frame.filename =
    frame.filename.indexOf('/') === 0
      ? `${appPrefix}${frame.filename}`
      : `${appPrefix}/${frame.filename}`

  return frame
}

export default function formatStackFrames({
  frames,
  jsEngine,
}: FormatStackFramesParams): SentryStackFrame[] {
  if (frames.length === 0) {
    return []
  }

  frames = frames.slice(0, STACKTRACE_FRAME_LIMIT).reverse()
  return (
    frames
      .map(({ async, method, line, column, file, function: fn }) => ({
        async,
        method,
        lineno: line,
        colno: column,
        filename: file || frames[frames.length - 1]?.file,
        function: fn || '?',
      }))
      // This is to ensure that the frame values are not null.
      .map((frame) =>
        Object.fromEntries(Object.entries(frame).map(([k, v]) => [k, v === null ? undefined : v]))
      )
      .map((frame) => rewriteFilename({ frame, jsEngine }))
  )
}
