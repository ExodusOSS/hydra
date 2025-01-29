# @exodus/storage-mobile

React Native specific implementation of the [unified storage spec](../storage-spec) for mobile apps.

> [!IMPORTANT]
> Most likely you should use `@exodus/adapters-mobile` instead, which will configure this for you.

## Install

```sh
yarn add @exodus/storage-mobile
```

## Usage

To use the module call the factory and pass in required dependencies

```ts
import { hashSync } from '@exodus/crypto/hash'
import createStorageMobile from '@exodus/storage-mobile'
import AsyncStorage from '@exodus/react-native-async-storage'
import fs from '@exodus/react-native-fs'

const hashString = (str) => hashSync('sha256', str, 'hex').slice(0, 20)

const storage = createStorageMobile({
  asyncStorage: AsyncStorage,
  androidFallback: {
    filesystem: {
      rimraf: fs.unlink.bind(fs),
      mkdirp: fs.mkdir.bind(fs),
      readUtf8: fs.readUtf8.bind(fs),
      writeUtf8: fs.writeUtf8.bind(fs),
    },
    placeholder: '~', // will be written to the async storage for files larger than the threshold
    rootDir: fs.DocumentDirectoryPath + '/async-storage',
    hashString,
    threshold: 1.9 * 1024 * 1024, // 2 megs, slightly lower to avoid the edge cases too close to the limit
  },
})

// use as any other `@exodus/storage-spec` compliant interface
```
