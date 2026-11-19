import assetSources from '@exodus/asset-sources'
import { createInMemoryAtom } from '@exodus/atoms'
import { getSeedId } from '@exodus/key-utils'
import { WalletAccount } from '@exodus/models'
import publicKeyProvider from '@exodus/public-key-provider'
import BJSON from 'buffer-json'

import { createAddressCache } from '../../module/address-cache/memory.js'
import addressProviderDefinition from '../../module/address-provider.js'
import knownAddressesDefinition from '../../module/known-addresses.js'
import seedAssets from './seed/_assets.js'
import { wallets } from './seed/fixtures/index.js'
import { createKeychain } from './seed/keychain.js'

const assetSourcesDefinition = assetSources().definitions.find(
  ({ definition }) => definition.id === 'assetSources'
).definition

const availableAssetNamesByWalletAccountAtomDefinition = assetSources().definitions.find(
  ({ definition }) => definition.id === 'availableAssetNamesByWalletAccountAtom'
).definition

const publicKeyProviderDefinition = publicKeyProvider().definitions.find(
  ({ definition }) => definition.id === 'publicKeyProvider'
).definition

const { factory: createPublicKeyProvider } = publicKeyProviderDefinition

export const seed = BJSON.parse(JSON.stringify(wallets.valid[0].masterSeed))
export const seedId = await getSeedId(seed)

export const walletAccount = new WalletAccount({ ...WalletAccount.DEFAULT, seedId })
export const walletAccount2 = new WalletAccount({ ...WalletAccount.DEFAULT, index: 1, seedId })

export const publicKeyStore = { get: jest.fn(), add: jest.fn() }

export const trezorAccount = new WalletAccount({
  source: 'trezor',
  id: '69b383b8477be56d6ff5ba24cff0c24e',
  model: 'T',
  index: 0,
})

export const setup = async (overrides = {}) => {
  const walletAccounts = overrides.walletAccounts || {
    [walletAccount]: walletAccount,
    [walletAccount2]: walletAccount2,
    [trezorAccount]: trezorAccount,
  }

  const assets = overrides.assets || seedAssets
  const assetsAtom = overrides.assetsAtom || createInMemoryAtom({ defaultValue: { value: assets } })

  const walletAccountsAtom =
    overrides.walletAccountsAtom ||
    createInMemoryAtom({
      defaultValue: walletAccounts,
    })

  const enabledWalletAccountsAtom = walletAccountsAtom
  const availableAssetNamesByWalletAccountAtom =
    overrides.availableAssetNamesByWalletAccountAtom ||
    availableAssetNamesByWalletAccountAtomDefinition.factory({
      assetsAtom,
      enabledWalletAccountsAtom,
      availableAssetNamesAtom: createInMemoryAtom({ defaultValue: Object.keys(assets) }),
    })

  const assetSources =
    overrides.assetSources ||
    assetSourcesDefinition.factory({
      assetsAtom,
      availableAssetNamesByWalletAccountAtom,
      walletAccountsAtom,
    })

  const keychain = overrides.keychain || (await createKeychain({ seed }))

  const publicKeyProvider =
    overrides.publicKeyProvider ||
    createPublicKeyProvider({
      keychain,
      walletAccountsAtom,
      publicKeyStore,
      getBuildMetadata: jest.fn().mockResolvedValue({ dev: false }),
    })

  const addressCache = overrides.addressCache || createAddressCache()

  const txLogsAtom = createInMemoryAtom({ defaultValue: { value: overrides.txLogs || {} } })
  const knownAddresses =
    overrides.knownAddresses || knownAddressesDefinition.factory({ txLogsAtom, assetsAtom })

  knownAddresses.start()

  const accountStatesAtom = createInMemoryAtom({
    defaultValue: { value: overrides.accountStates || {} },
  })

  const externalWalletAddressesAtom =
    overrides.externalWalletAddressesAtom || createInMemoryAtom({ defaultValue: {} })

  const addressProvider = addressProviderDefinition.factory({
    assetsAtom,
    addressCache,
    accountStatesAtom,
    publicKeyProvider,
    knownAddresses,
    walletAccountsAtom,
    assetSources,
    multisigAtom: overrides.multisigAtom,
    externalWalletAddressesAtom,
  })

  return {
    assetsAtom,
    addressCache,
    assetSources,
    keychain,
    publicKeyProvider,
    walletAccountsAtom,
    availableAssetNamesByWalletAccountAtom,
    knownAddresses,
    accountStatesAtom,
    addressProvider,
    enabledWalletAccountsAtom,
    externalWalletAddressesAtom,
  }
}

export { default as assets } from './seed/_assets.js'
