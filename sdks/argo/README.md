# @exodus/argo

The inversion of control setup that powers the Exodus wallet SDK

## Table of Contents

- [Quick Start](#quick-start)

## Quick Start

```js
import createIOC from '@exodus/argo'
import geolocation from '@exodus/geolocation'
import potter from './potter'

// 1. Set up adapters to include a logger
const adapters = {
  createLogger: (prefix) => ({
    debug: (...args) => console.log(prefix, ...args),
  }),
}

// 2. Create ioc container
const ioc = createIOC({ adapters })

// 3. Use hydra and/or your own features
// See an example feature:
// https://github.com/ExodusMovement/exodus-hydra/tree/2a12c3e8568af4cdf689815ec7e70d2580ae9a6c/features/geolocation
ioc.use(geolocation())
ioc.use(potter({ glasses: true }))

// 5. Resolve instance
const instance = ioc.resolve()
```
