# @exodus/key-challenge

The challenge envelope used to prove control of a key. The verifier and the
prover both build the same bytes, so this package is the one place the layout
is defined.

## Envelope

```
exodus/challenge/v1:{"verifier":…,"purpose":…,"challenge":…}
```

The `exodus/challenge/v1` namespace is fixed by this package and versioned with
it. It sits outside the JSON body, so the plaintext is not itself valid JSON
and nothing another protocol produces as JSON can collide with it. The nonce
is what makes a challenge unguessable; every other field is a constant a
caller could produce without holding any key.

`verifier` names the service that issued the challenge and `purpose` names the
operation within it. Which key is being proven is not part of the envelope:
the verifier already knows it, because it sealed to that key or is checking a
signature from it, so repeating it inside the bytes adds nothing.

## Use

A verifier that seals to an encryption key, or issues a nonce for a signing
key, builds the payload:

```js
import { serializeChallenge } from '@exodus/key-challenge'

const plaintext = serializeChallenge({
  verifier: 'exodus-pay',
  purpose: 'fusion-key-ownership',
  challenge: nonce,
})
```

A prover that receives a payload asserts it before reading the nonce:

```js
import { parseChallenge } from '@exodus/key-challenge'

const nonce = parseChallenge({
  plaintext,
  verifier: 'exodus-pay',
  purpose: 'fusion-key-ownership',
})
```

`parseChallenge` compares an ordered literal rather than parsing and comparing
fields. `JSON.parse` resolves a duplicated key to its last occurrence while a
prefix pins the first, so parse-and-compare would accept a payload whose first
`purpose` is wrong. Only the nonce is read from the parse.

A prover that already knows the nonce — because the verifier issued it in the
clear for it to sign — builds the same payload with `serializeChallenge` instead.
It must never sign bytes the verifier supplied, or it becomes a signing oracle
for whatever those bytes were.

Fields may be appended after `challenge` without a prover release. Nothing may
be inserted before it.

## What this package does not do

No key material, no crypto, no storage. Generating the nonce, sealing or
signing, and remembering what was issued belong to the verifier.
