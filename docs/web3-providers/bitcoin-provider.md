---
sidebar_position: 4
---

# Bitcoin Provider API

Exodus injects a global API into websites visited by its users at
`window.BitcoinProvider`

```typescript
interface BitcoinProvider {
  connect: (request: string) => Promise<GetAddressResponse>
  signTransaction: (request: string) => Promise<SignTransactionResponse>
  signMessage: (request: string) => Promise<string>
}
```

## Supported Networks

| ID      |      Name       |
| ------- | :-------------: |
| Mainnet | Bitcoin Mainnet |

## Methods

### `connect(request)`

Use `connect` to request access to the user's account. This will open a pop-up
asking the user to approve the connection. If the user approves, Exodus will
return addresses related to the **Mainnet** network.

#### Example

```typescript
const payload: GetAddressPayload = {
  purposes: [AddressPurposes.ORDINALS, AddressPurposes.PAYMENT],
}
const request = jsontokens.createUnsecuredToken(payload)
const response: GetAddressResponse = await provider.connect(request)
```

#### Types

```typescript
connect: (request: string) => Promise<GetAddressResponse>

// types
interface Address {
  address: string
  publicKey: string
  purpose: AddressPurposes
}

declare enum AddressPurposes {
  PAYMENT = 'payment',
  ORDINALS = 'ordinals',
}

interface GetAddressPayload {
  purposes: Array<AddressPurposes>
  message: string
}

interface GetAddressResponse {
  addresses: Array<Address>
}
```

### `signTransaction(request)`

Use `signTransaction` to request a Bitcoin transaction signing.

```typescript
signTransaction: (request: string) => Promise<SignTransactionResponse>
```

#### Example

```typescript
const payload: SignTransactionPayload = {
  psbtBase64: `dGhpcyBpcyBhIG5ldyBiYXNlNjQgc3RyaW5nICFmY2Q1Nzg5YS1iYzU1LTQ2ZDgtYjg0YS05MTY5YjI5YWIwYzc=`,
  broadcast: false,
  inputsToSign: [
    {
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      signingIndexes: [1],
    },
  ],
}
const request = jsontokens.createUnsecuredToken(payload)
const response: SignTransactionResponse = await provider.signTransaction(request)
```

#### Types

```typescript
signTransaction: (request: string) => Promise<SignTransactionResponse>

// types
interface SignTransactionPayload extends PsbtPayload {
  message?: string
}

type PsbtPayload = {
  psbtBase64: string
  inputsToSign: InputToSign[]
  broadcast?: boolean
}

interface InputToSign {
  address: string
  signingIndexes: number[]
  sigHash?: number // SIGHASH_ALL will be used by default.
}

interface SignTransactionResponse {
  psbtBase64: string
  txId?: string
}
```

### `signMessage(request)`

Use `signMessage` function to request wallet to sign a message.

When you sign a message using Exodus, you should expect following signature
types:

1. [ECDSA](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm)
   signatures over the [secp256k1 curve](https://www.secg.org/sec2-v2.pdf) when
   signing with the BTC payment (`p2sh(p2wpkh)`) address
2. [BIP322](https://bips.xyz/322) signatures when signing with the Ordinals
   (`p2tr`) address

#### Example

```typescript
const payload: SignMessagePayload = {
  address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  message: 'Lorem ipsum',
}
const request = jsontokens.createUnsecuredToken(payload)

const response = await provider.signMessage(request)
```

#### Types

```typescript
signMessage: (request: string) => Promise<string>

interface SignMessagePayload {
  address: string
  message: string
}

type SignMessageResponse = string

type SignMessageOptions = RequestOptions<SignMessagePayload, SignMessageResponse>
```
