# Simple Retry [![Build Status](https://travis-ci.com/ExodusMovement/simple-retry.svg?token=4LdsYhfLJBfrCJSUBSTg&branch=master)](https://travis-ci.com/ExodusMovement/simple-retry)

## Getting Started

```sh
yarn
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

## Tests

```sh
yarn test
yarn test --watch
```

## Publish

To publish, first set the `private` flag to false and edit the version number in `package.json`.

```sh
yarn build
NPM_CONFIG_OTP=123456 yarn release
NPM_CONFIG_OTP=123456 yarn release from-package # if 2FA token timeout, re-publish with current version in package.json
NPM_CONFIG_OTP=775106 npm publish --registry=https://registry.npmjs.org
```

After sucessfully publishing, reset the `private` flag to true and commit the version change.
