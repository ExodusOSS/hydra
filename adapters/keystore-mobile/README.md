# `@exodus/keystore-mobile`

Secure key-value storage implementation for secrets management.

## Usage

```js
import { Platform } from 'react-native'
import createKeystore from '@exodus/keystore-mobile'
import * as reactNativeKeychain from '@exodus/react-native-keychain'

const keystore = createKeystore({
  reactNativeKeychain,
  platform: Platform.OS,
})

const horcrux = await keystore.getSecret('horcrux')
```

## Options

### authenticationPrompt?: { title, subtitle, description, cancel } | () => { ... }

Copy for the system authentication prompt shown when reading a secret protected by access control. Passed to `getInternetCredentials` on every `getSecret` call. Provide a function to resolve the copy lazily on each read, e.g. to return translated strings for the current locale. When omitted, `react-native-keychain` falls back to its default copy.

## Methods

### getSecret(key: string): Promise<any | undefined>

Fetches a secret from the keystore.

### setSecret(key: string, value: any, opts?: { accessControl, accessible, accessGroup, securityLevel }): Promise<void>

See supported values for `opts` here: https://github.com/ExodusMovement/react-native-keychain?tab=readme-ov-file#options

The default value for `opts`:

```js
// ios/android:
accessible: RNKeychain.ACCESSIBLE.WHEN_UNLOCKED,
// android:
securityLevel: RNKeychain.SECURITY_LEVEL.SECURE_SOFTWARE
```

### deleteSecret(key: string): Promise<void>

Delete a secret from the keystore.

### lock(): Promise<void>

Lock the keystore. All calls will hang until `unlock()` is called.

### unlock(): Promise<void>

Unlock the keystore and allow through all pending calls.
