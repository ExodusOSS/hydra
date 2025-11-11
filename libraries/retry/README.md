# @exodus/retry

## Install

```sh
yarn add @exodus/retry
```

## Usage

A few examples of how to use this library:

```js
import pRetry from '@exodus/retry'

const fetchUnicorn = async () => {
  const response = await fetch('https://sindresorhus.com/unicorn')

  // Abort retrying if the resource doesn't exist
  if (response.status === 404) {
    throw new pRetry.AbortError(response.statusText)
  }

  return response.blob()
}

await pRetry(run, { retries: 5 })
```

```js
import { wrap } from '@exodus/retry'

const fetchUnicorn = async () => {
  const response = await fetch('https://sindresorhus.com/unicorn')

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  return response.blob()
}

const fetchWithRetry = wrap(fetchUnicorn, {
  onFailedAttempt: async (err) => {
    // abort
    if (err.status === 404) throw new Error('resource does not exist')

    // retry
  },
  retries: 3,
})
```
