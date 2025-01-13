import assert from 'minimalistic-assert'

export function splitDerivationPath(derivationPath: string) {
  assert(typeof derivationPath === 'string', 'derivationPath must be string')
  const parts = derivationPath.split('/')
  assert(parts.length > 1, 'invalid derivationPath: must have length > 1')
  assert(parts[0] === 'm', 'invalid derivationPath: must start with m')
  return parts.slice(1)
}

export type Bip44PathArray = [string, string, string, string, string]
export type Bip44PathArrayNumber = [number, number, number, number, number]

export function assertBip44Path(parts: string[]): asserts parts is Bip44PathArray {
  assert(parts.length === 5, 'invalid bip44 derivation path: length must be 5')
  assert(parts.every((part) => typeof part === 'string'))
}

export function splitBip44DerivationPath(derivationPath: string): Bip44PathArray {
  const parts = splitDerivationPath(derivationPath)
  assertBip44Path(parts)
  const [purpose, coin, account, change, address] = parts
  // TODO: fancy regex
  assert(purpose.endsWith("'"), 'invalid derivationPath: purpose must be hardened')
  assert(coin.endsWith("'"), 'invalid derivationPath: coin must be hardened')
  assert(account.endsWith("'"), 'invalid derivationPath: account must be hardened')
  return [purpose, coin, account, change, address]
}

export function assertBip44PathNumber(
  parts: readonly number[]
): asserts parts is Bip44PathArrayNumber {
  assert(parts.length === 5, 'invalid bip44 derivation path: length must be 5')
  assert(parts.every((part) => typeof part === 'number'))
}

export function buildBip44PathFromNumber(parts: Bip44PathArrayNumber) {
  const [purpose, coin, account, chainIndex, addressIndex] = parts

  const HARDENED_OFFSET = 0x80_00_00_00
  return `m/${purpose - HARDENED_OFFSET}'/${coin - HARDENED_OFFSET}'/${
    account - HARDENED_OFFSET
  }'/${chainIndex}/${addressIndex}`
}

export function splitBip44PathToNumber(derivationPath: string): Bip44PathArrayNumber {
  const [purpose, coin, account, change, address] = splitBip44DerivationPath(derivationPath)
  const HARDENED_OFFSET = 0x80_00_00_00
  return [
    Number(purpose.replaceAll(`'`, '')) + HARDENED_OFFSET,
    Number(coin.replaceAll(`'`, '')) + HARDENED_OFFSET,
    Number(account.replaceAll(`'`, '')) + HARDENED_OFFSET,
    Number(change),
    Number(address),
  ]
}
