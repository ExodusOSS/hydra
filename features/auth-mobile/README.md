# @exodus/auth-mobile

This feature provides a platform-independent way to enable and use authentication methods such as pin and biometric authentication in mobile React Native applications.

## Install

```sh
yarn add @exodus/auth-mobile
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK.

```js
await exodus.auth.setPin('123456') // set 6 number pin
await exodus.auth.isCorrectPin('645123') // false

await exodus.auth.enableBioAuth() // enables bio authentication such as fingerprint or face id

await exodus.auth.bio.trigger() // start the bio authentication process
await exodus.auth.bio.stop() // abort
```

If you're building a feature that requires access to authentication details, you can depend on `authAtom` and observe changes:

```js
authAtom.observe(({ hasBioAuth, biometry, hasPin, shouldAuthentiate }) => {
  // shouldAuthenticate is true if either a pin was set or bio auth enabled
  // (inidicator for the UI to restrict access to protectworthy resources such as the mnemonic phrase)
  // biometry is available biometry variant
})
```
