# @exodus/auth-mobile

Usage

```js
import auth from '@exodus/auth-mobile'

exodus.use(auth())
exodus.resolve()

// Exposes a range of methods to enable, remove, and use authentication

await exodus.auth.setPin('123456') // set 6 number pin
await exodus.auth.isCorrectPin('645123') // false

await exodus.auth.enableBioAuth() // enables bio authentication such as fingerprint or face id

await exodus.auth.bio.trigger() // start the bio authentication process
await exodus.auth.bio.stop() // abort

// Current auth details can be subscribed to via the auth atom

authAtom.observe(({ hasBioAuth, biometry, hasPin, shouldAuthentiate }) => {
  // shouldAuthenticate is true if either a pin was set or bio auth enabled
  // (inidicator for the UI to restrict access to protectworthy resources such as the mnemonic phrase)
  // biometry is available biometry variant
})
```
