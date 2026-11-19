// Test-only type declarations for untyped dev dependencies. Scoped to
// `__tests__/` (excluded from the build) so they never reach the published
// surface. Derived from each package's actual exports / the call sites here.

declare module '@exodus/bip39' {
  // @exodus/bip39 ships untyped `.js` source. Only `mnemonicToSeed` is used.
  export function mnemonicToSeed(opts: {
    mnemonic: string
    password?: string
    validate?: boolean
    wordlist?: string[]
    format?: 'uint8' | 'buffer' | 'hex'
  }): Promise<Uint8Array>
}

declare module 'bigi' {
  // Only the static `fromBuffer` is exercised (its result is handed to ecurve).
  interface BigInteger {
    toBuffer(size?: number): Buffer
  }
  const BigInteger: {
    fromBuffer(buffer: Uint8Array): BigInteger
  }
  export default BigInteger
}

declare module 'ecurve' {
  import type BigInteger from 'bigi'

  interface Point {
    multiply(k: BigInteger): Point
    getEncoded(compressed: boolean): Buffer
  }

  interface Curve {
    G: Point
  }

  const ecurve: {
    getCurveByName(name: string): Curve
  }

  export default ecurve
}
