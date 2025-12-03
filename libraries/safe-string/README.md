# @exodus/safe-string

Build safe strings that can be used in error messages and stack traces without leaking sensitive information.

## Usage

```ts
import { safeString, isSafe } from '@exodus/safe-string'

const planet = 'world'
const result = safeString`Hello ${planet}`
console.log(result) // 'Hello <redacted>'

isSafe(result) // true
```
