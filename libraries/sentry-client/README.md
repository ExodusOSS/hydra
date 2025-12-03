# @exodus/sentry-client

API client for sanitizing and sending errors to Sentry.io.

## Usage

```js
import createSentryClient from '@exodus/sentry-client'
import { safeString } from '@exodus/safe-string'

const client = createSentryClient({
  fetchival,
  config: {
    // get this from your sentry project page at https://xxxxxx.sentry.io/settings/projects/node/keys/
    // strip the project ID url path from the url they provide
    dsnUrl: 'https://<publicKey>@<someId>.ingest.sentry.io',
    publicKey: '<publicKey>',
    projectId: '<projectId>',
    environment: 'staging',
    // optional
    os: 'ios',
    osVersion: '1.2.3',
    platform: 'test',
    appVersion: '3.2.1',
    jsEngine: 'hermes', // or 'jsc'
  },
})

// Note: all error messages must be safe for logging and should never expose sensitive data.
// Use the `safeString` tag to sanitize any dynamic values (e.g., PII, secrets etc.).
client.captureError({
  // Will be sanitized to: "Failed to send recovery email: <redacted>"
  error: new Error(safeString`Failed to send recovery email: ${email}`),
})
```
