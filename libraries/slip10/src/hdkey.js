import { hmacSync } from '@exodus/crypto/hmac'
import bipPath from 'bip32-path'

// assumes global Buffer
// as per spec does not generate public keys
// only works with hardened keys
// this only implements the ed25519 portion of SLIP-0010
// do not use with other key types

const HARDENED_OFFSET = 0x80_00_00_00

function splitSegments(path) {
  const pathArray = bipPath.fromString(path, true).toPathArray()
  return pathArray.map((v) => {
    const n = v - HARDENED_OFFSET // hardened paths should be above 2^32
    if (n < 0) throw new Error('invalid path: contains unhardened segment')
    return n
  })
}

export default class HdKeySlip10 {
  static fromSeed(seed) {
    // seed is HMAC'ed before any derivation, as using same seed to
    // perform secp256k1 and ed25519 operations could weaken security
    // https://github.com/satoshilabs/slips/blob/master/slip-0010.md#master-key-generation
    const hmacSeed = hmacSync('sha512', 'ed25519 seed', seed)
    const key = hmacSeed.slice(0, 32)
    const chainCode = hmacSeed.slice(32)
    return new HdKeySlip10({ key, chainCode })
  }

  constructor({ key, chainCode }) {
    this.key = key
    this.chainCode = chainCode
  }

  // https://github.com/satoshilabs/slips/blob/master/slip-0010.md#private-parent-key--private-child-key
  derive(path) {
    const segments = splitSegments(path)

    let key = this.key
    let chainCode = this.chainCode

    // let I = HMAC-SHA512(Key = cpar, Data = 0x00 || ser256(kpar) || ser32(i))
    segments.forEach((segment) => {
      const zeroPad = Buffer.from('00', 'hex')
      const hardened = Buffer.alloc(4)
      hardened.writeUInt32BE(segment + HARDENED_OFFSET, 0) // add 2^31 because all segments are hardened

      const hmacDerived = hmacSync('sha512', chainCode, [zeroPad, key, hardened])
      key = hmacDerived.slice(0, 32)
      chainCode = hmacDerived.slice(32)
    })

    return new HdKeySlip10({ key, chainCode })
  }
}
