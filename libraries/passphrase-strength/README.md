# @exodus/passphrase-strength

## Usage

```javascript
import { usePassphraseStrength } from '@exodus/passphrase-strength'
```

Check if your password ("correct horse battery staple") is strong enough.

```javascript
const result = usePassphraseStrength({
 minimumPassphraseLength = 8,
 passphrase,
 minimumValidScore,
})
const { passphraseIsStrong, passphraseScore } = result
```
