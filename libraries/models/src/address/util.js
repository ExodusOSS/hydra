// NOTE: these are not properties on Address class since they only apply
// to UTXO based coins

export function isExchangeAddress(addr) {
  // https://github.com/jprichardson/exodus/issues/393
  // this will almost certainly change
  return addr.pathArray[0] === 2
}

export function isChangeAddress(addr) {
  return addr.pathArray[0] === 1
}

export function isReceiveAddress(addr) {
  return addr.pathArray[0] === 0
}
