export type Encrypt = (data: Buffer) => Promise<Buffer>
export type Decrypt = Encrypt

export type CryptoFunctions = {
  encrypt: Encrypt
  decrypt: Decrypt
}
