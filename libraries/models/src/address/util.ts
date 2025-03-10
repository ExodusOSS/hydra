// NOTE: these are not properties on Address class since they only apply
// to UTXO based coins
import type Address from './index.js'

export function isExchangeAddress(addr: Address) {
  // https://github.com/jprichardson/exodus/issues/393
  // this will almost certainly change
  return addr.pathArray[0] === 2
}

export function isChangeAddress(addr: Address) {
  return addr.pathArray[0] === 1
}

export function isReceiveAddress(addr: Address) {
  return addr.pathArray[0] === 0
}

type KeyIdentifierLike = {
  derivationAlgorithm: string
  derivationPath: string
  keyType: KeyType
  assetName?: string
}

const requiredKeyIdentifierProps = ['derivationAlgorithm', 'derivationPath', 'keyType']

export function isKeyIdentifierLike(obj: unknown): obj is KeyIdentifierLike {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    requiredKeyIdentifierProps.every((prop) => Object.hasOwn(obj, prop))
  )
}
