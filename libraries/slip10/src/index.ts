import { edwardsToPublicSync } from '@exodus/crypto/curve25519'
import HDKey from './hdkey.js'

type XPriv = { key: string; chainCode: string }
type SLIP10Params = { key: Buffer; chainCode: Buffer; curve?: 'ed25519' }

export default class SLIP10 {
  key: Buffer | undefined
  chainCode: Buffer | undefined
  readonly curve: 'ed25519'

  static fromSeed(seed: Buffer | Uint8Array): SLIP10 {
    const { key, chainCode } = HDKey.fromSeed(seed)
    return new SLIP10({ key, chainCode })
  }

  static fromXPriv(xpriv: XPriv): SLIP10 {
    const key = Buffer.from(xpriv.key, 'hex')
    const chainCode = Buffer.from(xpriv.chainCode, 'hex')
    return new SLIP10({ key, chainCode })
  }

  constructor({ key, chainCode, curve = 'ed25519' }: SLIP10Params) {
    if (curve !== 'ed25519') throw new Error('Only ed25519 curve is currently supported')
    this.key = key
    this.chainCode = chainCode
    this.curve = curve
  }

  derive(path: string): SLIP10 {
    if (this.key === undefined || this.chainCode === undefined) throw new Error('key is not set')
    const { key, chainCode } = new HDKey({ key: this.key, chainCode: this.chainCode }).derive(path)
    return new SLIP10({ key, chainCode })
  }

  get privateKey(): Buffer | undefined {
    return this.key
  }

  get publicKey(): Buffer {
    if (this.key === undefined) throw new Error('key is not set')
    return edwardsToPublicSync({ privateKey: this.key, format: 'buffer' })
  }

  wipePrivateData(): void {
    this.key = undefined
    this.chainCode = undefined
  }

  toJSON() {
    if (this.key === undefined || this.chainCode === undefined) throw new Error('key is not set')
    return {
      xpriv: {
        key: this.key.toString('hex'),
        chainCode: this.chainCode.toString('hex'),
      },
    }
  }
}
