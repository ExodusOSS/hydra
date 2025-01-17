import { edwardsToPublicSync } from '@exodus/crypto/curve25519'
import HDKey from './hdkey.js'

export default class SLIP10 {
  static fromSeed(seed) {
    const { key, chainCode } = HDKey.fromSeed(seed)
    return new SLIP10({ key, chainCode })
  }

  static fromXPriv(xpriv) {
    const key = Buffer.from(xpriv.key, 'hex')
    const chainCode = Buffer.from(xpriv.chainCode, 'hex')
    return new SLIP10({ key, chainCode })
  }

  constructor({ key, chainCode, curve = 'ed25519' }) {
    if (curve !== 'ed25519') throw new Error('Only ed25519 curve is currently supported')
    this.key = key
    this.chainCode = chainCode
    this.curve = curve
  }

  derive(path) {
    const { key, chainCode } = new HDKey({
      key: this.key,
      chainCode: this.chainCode,
    }).derive(path)
    return new SLIP10({ key, chainCode })
  }

  get privateKey() {
    return this.key
  }

  get publicKey() {
    return edwardsToPublicSync({ privateKey: this.privateKey, format: 'buffer' })
  }

  wipePrivateData() {
    this.key = undefined
    this.chainCode = undefined
  }

  toJSON() {
    return {
      xpriv: {
        key: this.key.toString('hex'),
        chainCode: this.chainCode.toString('hex'),
      },
    }
  }
}
