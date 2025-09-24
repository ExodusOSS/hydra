# @exodus/errors

## Usage

```javascript
import { SafeError } from '@exodus/errors'

try {
  throw new Error('Something went wrong')
} catch (e) {
  const safeError = SafeError.from(e)

  // It's now safe to report or log the error, even to a remote server.
  console.error({
    name: safeError.name, // Sanitized error name.
    code: safeError.code, // Optional error code (if present).
    hint: safeError.hint, // Optional error hint (if present).
    stack: safeError.stack, // Sanitized stack trace.
    timestamp: safeError.timestamp, // When the error occurred.
  })
}
```

## FAQ

### Why using SafeError instead of built-in Errors?

In large codebases, errors can be thrown from anywhere, making it impossible to audit every error message for sensitive information. A single error containing sensitive data could potentially expose user information. Centralizing error handling with `SafeError` makes it possible to enforce security and consistency across the board, by ensuring:

1. **Controlled Error Flow**: All errors go through a single, well-tested sanitization layer before they hit error tracking systems.
2. **Enforceable Security**: Error handling can be owned through codeowners and covered by tests, so nothing slips through unnoticed.

In addition to enforcing these practices, `SafeError` includes a few key design decisions that make it safer and more reliable than native Error objects:

1. **Message Sanitization**: The `message` property from built-in Errors is intentionally omitted as it often contains sensitive information. Instead, a `hint` property is used that contains only sanitized, non-sensitive information.
2. **Native Stack Parsing**: The library uses the [`Error.prepareStackTrace` API](https://v8.dev/docs/stack-trace-api) to parse stack traces, providing consistent and reliable stack trace information across different JavaScript environments.
3. **Immutability**: Once created, a `SafeError` instance cannot be modified, preventing tampering with error data.
4. **Safe Serialization**: The `toJSON` method ensures safe serialization for logging or sending to error tracking services.

### Why not redacting Error messages?

Parsing/sanitization of error messages is unreliable and the cost of failure is potential loss of user funds and permanent reputation damage.

### Why not use the built-in `.stack` Error property?

Unfortunately, the built-in `.stack` property is mutable and outside of our control. Instead, we use the `Error.prepareStackTrace` API, which enables us to make sure we access the actual call stack and not a cached `err.stack` value that may have already been consumed and modified. We then parse it into a structured format that we can safely sanitize and control. This approach provides consistent, reliable stack traces across different environments (currently supporting both V8 and Hermes).

## Recipes

> [!TIP]
> Before diving into the recipes, you might want to get familiar with what a 'Safe String' is: https://github.com/ExodusMovement/exodus-hydra/tree/master/libraries/safe-string

### I want to preserve server errors in Safe Errors

Do you control the server? If so, better send short error codes from your server instead. `err.code` will [be passed through](https://github.com/ExodusOSS/hydra/blob/master/libraries/errors/src/safe-error.ts#L32) SafeError coercion.

If you do NOT control the server, and you know the specific error messages returned by the server, you can predefine them wrapped in `safeString`:

```js
import { safeString } from '@exodus/safe-string'

// From: https://github.com/ethereum/go-ethereum/blob/master/core/txpool/errors.go.
export const KnownErrors = new Set([
  safeString`already known`,
  safeString`invalid sender`,
  safeString`transaction underpriced`,
])
```

You can now handle failed requests like this:

```js
import { safeString } from '@exodus/safe-string`
import { KnownErrors } from './errors.js'

const response = await this.request(request)
const error = response?.error

if (error) {
  const message = KnownErrors.get(msg) ?? safeString`unknown error`
  throw new Error(safeString`Bad rpc response: ${message}`)
}
```

## Troubleshooting

### A SafeError instance returns `undefined` stack trace?

That likely means that something accesses `error.stack` _before_ the Safe Error constructor had a chance to apply the custom `Error.prepareStackTrace` handler. This could be React, a high-level error handler, or any other framework. `error.stack` is computed only on the first access, so the custom handler won’t be called on subsequent attempts (see the `stack.test.js` for a quick demo).

If you can identify the exact place where `.stack` is accessed, consider capturing the stack trace explicitly like this:

```javascript
import { captureStackTrace, SafeError } from '@exodus/errors'

try {
  // the devil's work
} catch (e) {
  captureStackTrace(e)
  void e.stack // Intentionally access the property to "break" it here.
  SafeError.from(e).stack // A non-empty string!
  // 🎉 Congrats — you just (hopefully) saved hours of debugging! The custom stack trace parsing logic now works because the stack was captured explicitly above.
}
```
