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
