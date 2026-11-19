# @exodus/simple-retry

## Install

```sh
pnpm add @exodus/simple-retry
```

## Usage

```js
import { retry } from '@exodus/simple-retry'

const broadcastTxWithRetry = retry(broadcastFunction, { delayTimesMs: ['10s'] })
const result = await broadcastTxWithRetry(plainTx)
```

It is possible to trap specific errors and mark them as final when retrying is not needed, like:

```js
const broadcastTxWithRetry = retry(
  async (plainTx) => {
    try {
      return await broadcastFunction(plainTx)
    } catch (e) {
      if (/specific-final-error/i.test(e.message)) e.finalError = true
      throw e
    }
  },
  { delayTimesMs: ['10s'] }
)
```
