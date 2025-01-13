import { WalletAccount } from '@exodus/models'
import typeforce from '@exodus/typeforce'

const HARDENED_INDEX_REGEX = /^\d+'$/u
const index = typeforce.anyOf('Number', (value) => HARDENED_INDEX_REGEX.test(value))

export const types = {
  purpose: 'Number',
  assetName: 'String',
  walletAccount: (value) => value instanceof WalletAccount,
  chainIndex: index,
  addressIndex: index,
  nonEmptyString: (it) => typeof it === 'string' && it !== '',
}

types.assetSource = {
  assetName: types.assetName,
  walletAccount: types.walletAccount,
}

types.pojoAssetSource = {
  assetName: types.assetName,
  walletAccount: 'String',
}
