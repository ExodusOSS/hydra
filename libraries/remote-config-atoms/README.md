# `@exodus/remote-config-atoms`

Factory for creating read-only [atoms](../atoms/README.md) for values stored in [remote-config](../../features/remote-config/README.md).

## Install

```sh
yarn add @exodus/remote-config-atoms
```

## Usage

> [!WARNING]
> As client-side access to remote-config is read-only, `remoteConfigAtom.set(value)` will always reject.

```js
import { createRemoteConfigAtomFactory } from '@exodus/atoms'

// Remote config atoms
const createRemoteConfigAtom = createRemoteConfigAtomFactory({ remoteConfig })

const fiatOnrampConfigAtom = createRemoteConfigAtom({
  path: `dapps.fiatOnramp`,
  defaultValue: {},
})
```
