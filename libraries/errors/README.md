# @exodus/errors

## Usage

```javascript
import { sanitizeErrorMessage, parseStackTrace } from '@exodus/errors'

try {
  // the devil's work
} catch (e) {
  console.error(sanitizeErrorMessage(e.message))
  sendToErrorTrackingServer(parseStackTrace(e))
}
```

## Troubleshooting

### `parseStackTrace` returns undefined stack trace?

That likely means that something accesses `error.stack` _before_ the `parseStackTrace` had a chance to apply the custom handler. This could be React, a high-level error handler, or any other framework. `error.stack` is computed only on the first access, so the custom handler (`prepareStackTrace`) won’t be called on subsequent attempts (see the `stack.test.js` for a quick demo).

If you can identify the exact place where `.stack` is accessed, consider capturing the stack trace explicitly like this:

```javascript
import { parseStackTrace, captureStackTrace } from '@exodus/errors'

try {
  // the devil's work
} catch (e) {
  captureStackTrace(e)
  void e.stack // Intentionally access the property to "break" it here.
  sendToErrorTrackingServer(parseStackTrace(e))
  // 🎉 Congrats — you just (hopefully) saved hours of debugging! `parseStackTrace` now works because the stack was captured explicitly above.
}
```
