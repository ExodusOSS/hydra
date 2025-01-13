# @exodus/logger

A simple logger for all things hydra. Uses the console to print messages.

## Usage

First, create a logger instance. You can provide an optional namespace here. Every message will
be prefixed with this string.

```js
import createLogger from '@exodus/logger'

const logger = createLogger()
const namespacedLogger = createLogger('dumbledore')
```

Once an instance is available, use any of the log-level methods.

The following log-levels are currently supported:

`trace`, `debug`, `log`, `info`, `warn`, `error`

```js
import createLogger from '@exodus/logger'

const logger = createLogger('dumbledore')

logger.log('It is our choices, Harry, that show what we truly are, far more than our abilities.')
// console.log: [dumbledore] It is our choices, Harry, that show what we truly are, far more than our abilities.

logger.info('We are only as strong as we are united, as weak as we are divided.')
// console.info: [dumbledore:info] We are only as strong as we are united, as weak as we are divided.
```
