# `@exodus/keystore-mobile`

Secure key-value storage implementation for secrets management

## Usage

```js
import createKeystore from '@exodus/keystore-mobile'
import * as reactNativeKeychain from 'react-native-keychain'

const keystore = createKeystore({
  reactNativeKeychain,
  platform: Platform.OS,
})
```
