# @exodus/storage-mobile

## Usage

To use the module call the factory and pass in required dependencies

```ts
import createHash from 'create-hash'
import createStorageMobile from '@exodus/storage-mobile'
import AsyncStorage from '@exodus/react-native-async-storage'
import fs from '@exodus/react-native-fs'

const hashString = (str) => createHash('sha256').update(str).digest('hex').slice(0, 20)

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
```
