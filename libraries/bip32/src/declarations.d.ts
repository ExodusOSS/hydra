// Concrete type declarations for the `@exodus/crypto/*` subpath exports we use.
//
// DO NOT DELETE on the assumption that the dependency's own types suffice.
// @exodus/crypto DOES ship `.d.ts` (wired via its `exports` "types"), but its
// `Output<F>` format→return mapping resolves through an extensionless
// `import ... from './types'` that is invalid under `moduleResolution: nodenext`.
// The repo's `skipLibCheck: true` suppresses the error and silently collapses
// the affected sync byte-returning functions (privateKeyToPublicKey, hashSync,
// hmacSync, ...) to `any` — verified empirically. These local declarations
// override that with the real, concrete format→return mapping; removing them
// regresses every such call site to `any` with no typecheck failure.
//
// The `form`/`format` argument selects the output container. Mapping (from
// `@exodus/crypto`'s `utils/output.mjs`): `'hex'` → string, `'buffer'` →
// Buffer, `'uint8'` → Uint8Array. Hash defaults to `'buffer'`; the secp256k1
// byte APIs default to `'uint8'`. Only the exports `@exodus/bip32` consumes are
// declared.

declare module '@exodus/crypto/hash' {
  type HashInput = string | Uint8Array | readonly Uint8Array[]

  export function hash(type: string, data: HashInput): Promise<Buffer>
  export function hash(type: string, data: HashInput, form: 'buffer'): Promise<Buffer>
  export function hash(type: string, data: HashInput, form: 'uint8'): Promise<Uint8Array>
  export function hash(type: string, data: HashInput, form: 'hex'): Promise<string>

  export function hashSync(type: string, data: HashInput): Buffer
  export function hashSync(type: string, data: HashInput, form: 'buffer'): Buffer
  export function hashSync(type: string, data: HashInput, form: 'uint8'): Uint8Array
  export function hashSync(type: string, data: HashInput, form: 'hex'): string
}

declare module '@exodus/crypto/hmac' {
  type HashInput = string | Uint8Array | readonly Uint8Array[]
  type Secret = string | Uint8Array

  export function hmac(type: string, secret: Secret, data: HashInput): Promise<Buffer>
  export function hmac(
    type: string,
    secret: Secret,
    data: HashInput,
    form: 'buffer'
  ): Promise<Buffer>
  export function hmac(
    type: string,
    secret: Secret,
    data: HashInput,
    form: 'uint8'
  ): Promise<Uint8Array>
  export function hmac(type: string, secret: Secret, data: HashInput, form: 'hex'): Promise<string>

  export function hmacSync(type: string, secret: Secret, data: HashInput): Buffer
  export function hmacSync(type: string, secret: Secret, data: HashInput, form: 'buffer'): Buffer
  export function hmacSync(type: string, secret: Secret, data: HashInput, form: 'uint8'): Uint8Array
  export function hmacSync(type: string, secret: Secret, data: HashInput, form: 'hex'): string
}

declare module '@exodus/crypto/randomBytes' {
  export function randomBytes(size: number): Buffer
}

declare module '@exodus/crypto/secp256k1' {
  // bip32-local widening: the upstream contract is non-null (`StrictUint8Array`),
  // but bip32's nullable key setters pass `Buffer | null`. The validators return
  // `false` for null at runtime, so accepting it here is behaviour-faithful.
  export function privateKeyIsValid(params: { privateKey: Uint8Array | null }): boolean
  export function publicKeyIsValid(params: {
    publicKey: Uint8Array | null
    compressed?: boolean
  }): boolean

  export function privateKeyToPublicKey(params: {
    privateKey: Uint8Array
    compressed?: boolean
  }): Uint8Array
  export function privateKeyToPublicKey(params: {
    privateKey: Uint8Array
    compressed?: boolean
    format: 'uint8'
  }): Uint8Array
  export function privateKeyToPublicKey(params: {
    privateKey: Uint8Array
    compressed?: boolean
    format: 'buffer'
  }): Buffer
  export function privateKeyToPublicKey(params: {
    privateKey: Uint8Array
    compressed?: boolean
    format: 'hex'
  }): string

  export function publicKeyConvert(params: {
    publicKey: Uint8Array
    compressed: boolean
  }): Uint8Array
  export function publicKeyConvert(params: {
    publicKey: Uint8Array
    compressed: boolean
    format: 'uint8'
  }): Uint8Array
  export function publicKeyConvert(params: {
    publicKey: Uint8Array
    compressed: boolean
    format: 'buffer'
  }): Buffer
  export function publicKeyConvert(params: {
    publicKey: Uint8Array
    compressed: boolean
    format: 'hex'
  }): string

  export function privateKeyTweakAdd(params: {
    privateKey: Uint8Array
    tweak: Uint8Array
  }): Uint8Array
  export function privateKeyTweakAdd(params: {
    privateKey: Uint8Array
    tweak: Uint8Array
    format: 'uint8'
  }): Uint8Array
  export function privateKeyTweakAdd(params: {
    privateKey: Uint8Array
    tweak: Uint8Array
    format: 'buffer'
  }): Buffer
  export function privateKeyTweakAdd(params: {
    privateKey: Uint8Array
    tweak: Uint8Array
    format: 'hex'
  }): string

  export function publicKeyTweakAddScalar(params: {
    publicKey: Uint8Array
    tweak: Uint8Array
    compressed?: boolean
  }): Uint8Array
  export function publicKeyTweakAddScalar(params: {
    publicKey: Uint8Array
    tweak: Uint8Array
    compressed?: boolean
    format: 'uint8'
  }): Uint8Array
  export function publicKeyTweakAddScalar(params: {
    publicKey: Uint8Array
    tweak: Uint8Array
    compressed?: boolean
    format: 'buffer'
  }): Buffer
  export function publicKeyTweakAddScalar(params: {
    publicKey: Uint8Array
    tweak: Uint8Array
    compressed?: boolean
    format: 'hex'
  }): string
}
