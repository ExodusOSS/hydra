import elliptic from 'elliptic'
import lodash from 'lodash'
import HDKey from './hdkey.js'

const { once } = lodash

// lazy-load
const getEd25519 = once(() => elliptic.eddsa('ed25519'))

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
    const publicKey = getEd25519().keyFromSecret(this.privateKey).getPublic('hex')
    return Buffer.from(publicKey, 'hex')
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
