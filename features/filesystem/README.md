# @exodus/filesystem

Module for tracking filesystem info

## Install

```sh
yarn add @exodus/filesystem
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

### UI Side

See [using the sdk](../../docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.

```jsx
import { selectors } from '~/ui/flux'

const AvailableSpace = () => {
  const freeSpace = useSelector(selectors.filesystem.freeSpace)
  const totalSpace = useSelector(selectors.filesystem.totalSpace)

  return (
    <Text>
      Space available: {freeSpace} / {totalSpace}
    </Text>
  )
}
```
