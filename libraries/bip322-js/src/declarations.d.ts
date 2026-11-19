declare module '@exodus/crypto/hash'
declare module '@exodus/crypto/secp256k1'
declare module '@exodus/crypto/tiny-secp256k1-compat'
declare module 'bech32' {
  export function decode(str: string): { prefix: string; words: number[] }
  export function fromWords(words: number[]): number[]
}
declare module 'varuint-bitcoin' {
  export function encodingLength(n: number): number
  export function encode(n: number, buffer: Buffer, offset: number): Buffer
}
