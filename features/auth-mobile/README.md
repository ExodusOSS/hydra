# @exodus/auth-mobile

This feature provides a platform-independent way to enable and use authentication methods such as pin and biometric authentication in mobile React Native applications.

## Install

```sh
pnpm add @exodus/auth-mobile
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

Direct construction of the Android `bioAuth` module requires `auth`, `authAtom`, and `logger`. The feature container supplies these dependencies.

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
authAtom.observe(({ hasBioAuth, biometry, hasPin, hasDeviceAuth, shouldAuthenticate }) => {
  // shouldAuthenticate is true if a PIN, biometric auth, or Device Lock is configured
  // (inidicator for the UI to restrict access to protectworthy resources such as the mnemonic phrase)
  // biometry is available biometry variant
})
```

On iOS, `auth.bio.authenticate()` returns `false` when the user cancels the Keychain prompt. Other Keychain failures are recorded through `errorTracking` and reject with `DeviceAuthenticationFailed`. Known OS error codes appear in the sanitized error message; native messages and unknown codes are omitted. Callers should catch these failures and offer a retry while keeping authentication required.

For Device Lock users, `hasDeviceAuth` and `shouldAuthenticate` remain true when the OS cannot authenticate. `deviceAuthUnavailable` tracks a failed availability check separately; it does not authorize access or turn Device Lock off. Native checks can also return false on transient errors, so unavailability is not proof that the user removed their device passcode. Availability checks time out after five seconds. A rejected or timed-out check preserves the last known availability, and late results are ignored.

`auth.refreshDeviceAuth()` reloads the complete auth state and updates availability after failed OS prompts. If loading credentials fails, it leaves the auth atom unchanged so an incomplete state cannot bypass authentication. Consumers can also call it when returning to the foreground. While device auth is unavailable, keep authentication gates closed and offer a recovery message asking the user to enable their device passcode or retry. Availability returning to normal still requires successful authentication before granting access.

### Safe report

The `auth` section includes `hasDeviceAuth`, the app's active Device Lock state, alongside the legacy `hasPin` and `hasBioAuth` flags. Device Lock can be active while both legacy flags are false. `deviceAuthStatus` separately reports whether configured Device Lock is disabled, available, or unavailable; it can be available while `hasDeviceAuth` is false if legacy biometrics take precedence. An absent `hasDeviceAuth` value means the state was not reported.
