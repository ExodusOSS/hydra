import addressCacheMemoryModuleDefinition from './address-cache/memory.js'
import assert from 'minimalistic-assert'
import { Address, WalletAccount } from '@exodus/models'
import { isNil } from '@exodus/basic-utils'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { AddressProvider } from './address-provider.js'
import { createPath } from './utils.js'
import KeyIdentifier from '@exodus/key-identifier'

const { get, merge } = lodash

class MockableAddressProvider extends AddressProvider {
  #assetsAtom
  #storage

  // oxlint-disable-next-line @exodus/oxlint-plugin-hydra/constructor-params
  constructor({ addressCache = addressCacheMemoryModuleDefinition.factory(), ...rest }) {
    super({ addressCache, ...rest })
    this.#assetsAtom = rest.assetsAtom
    this.#storage = rest.unsafeStorage.namespace('debug')
  }

  #getAsset = async (assetName) => {
    const { value: assets } = await this.#assetsAtom.get()
    return assets[assetName]
  }

  async #getMockAddress({ purpose, assetName, walletAccount, chainIndex, addressIndex }) {
    const hasIndex = !isNil(addressIndex) && !isNil(chainIndex)
    const hasPurpose = !isNil(purpose)

    const asset = await this.#getAsset(assetName)
    const walletAccountName = walletAccount.toString()
    const mockAddresses = await this.#storage.get('mockableAddressProvider')
    const keyIdentifier = new KeyIdentifier(
      asset.baseAsset.api.getKeyIdentifier({
        purpose,
        accountIndex: walletAccount.index,
        chainIndex,
        addressIndex,
        compatibilityMode: walletAccount.compatibilityMode,
      })
    )

    if (hasPurpose && hasIndex) {
      const address = get(mockAddresses?.addresses, [
        walletAccountName,
        asset.baseAsset?.name || assetName,
        `${purpose}/${chainIndex}/${addressIndex}`,
        'address',
      ])

      if (address) {
        return new Address(address, {
          path: createPath({ chainIndex, addressIndex }),
          purpose,
          walletAccount: walletAccountName,
          keyIdentifier,
        })
      }
    }

    if (hasPurpose) {
      const address = get(mockAddresses?.addresses, [
        walletAccountName,
        asset.baseAsset?.name || assetName,
        `${purpose}`,
        'address',
      ])

      if (address) {
        return new Address(address, {
          ...(hasIndex ? { path: createPath({ chainIndex, addressIndex }) } : {}),
          purpose,
          walletAccount: walletAccountName,
          keyIdentifier,
        })
      }
    }

    const address = get(mockAddresses?.addresses, [
      walletAccountName,
      asset.baseAsset?.name || assetName,
      'address',
    ])

    if (address) {
      return new Address(address, {
        ...(hasIndex ? { path: createPath({ chainIndex, addressIndex }) } : {}),
        purpose: purpose ?? (await this.getDefaultPurpose({ walletAccount, assetName })),
        walletAccount: walletAccountName,
        keyIdentifier,
      })
    }
  }

  getAddress = async (opts) => {
    let { purpose, assetName, walletAccount, chainIndex, addressIndex } = opts
    assert(!isNil(walletAccount), `need to specify a walletAccount`)
    assert(!isNil(assetName), `need to specify an asset`)
    // not required with some compatibility modes, e.g. 'xverse'
    assert(
      !isNil(chainIndex) || isNil(addressIndex),
      'provide both "chainIndex" and "addressIndex" or neither'
    )

    const mockAddress = await this.#getMockAddress(opts)
    if (mockAddress) return mockAddress

    purpose = purpose ?? (await this.getDefaultPurpose({ walletAccount, assetName }))
    return super.getAddress({ ...opts, purpose })
  }

  mockAddress = async ({
    walletAccount = WalletAccount.DEFAULT_NAME,
    assetName,
    address,
    purpose,
    chainIndex,
    addressIndex,
  }) => {
    assert(!isNil(walletAccount), `need to specify a walletAccount`)
    assert(!isNil(assetName), `need to specify an asset`)
    assert(!isNil(address), `need to specify an address`)
    assert(
      !isNil(chainIndex) || isNil(addressIndex),
      'chainIndex must be provided if addressIndex is provided'
    )
    const hasIndex = !isNil(addressIndex) && !isNil(chainIndex)
    const hasPurpose = !isNil(purpose)

    const currentConfig = await this.#storage.get('mockableAddressProvider')
    let newAddress
    if (hasPurpose && hasIndex) {
      const key = `${purpose}/${chainIndex}/${addressIndex}`
      newAddress = { [walletAccount]: { [assetName]: { [key]: { address } } } }
    } else if (hasPurpose) {
      newAddress = { [walletAccount]: { [assetName]: { [purpose]: { address } } } }
    } else {
      newAddress = { [walletAccount]: { [assetName]: { address } } }
    }

    const newConfig = merge({}, currentConfig, { addresses: newAddress })
    await this.#storage.set('mockableAddressProvider', newConfig)
  }

  importReport = async (report) => {
    const addresses = Object.create(null)
    for (const walletAccount in report) {
      addresses[walletAccount] = Object.create(null)
      for (const assetName in report[walletAccount]) {
        addresses[walletAccount][assetName] = Object.create(null)
        for (const bip in report[walletAccount][assetName]) {
          // assets whose purposes could not be determined are exported as { error }
          if (bip === 'error') continue

          const { address } = report[walletAccount][assetName][bip]
          const purposeStr = bip.replace(/^bip/u, '')
          if (isNaN(purposeStr)) throw new Error(`Invalid bip: ${bip}`)

          // The report only has a single address per purpose.
          // This will cause all chainIndex/addressIndex pairs to fall back to the same address.
          addresses[walletAccount][assetName][purposeStr] = { address }
        }
      }
    }

    await this.#storage.set('mockableAddressProvider', { addresses })
  }

  clear = () => this.#storage.delete('mockableAddressProvider')
}

export const createMockableAddressProvider = (opts) => new MockableAddressProvider(opts)

const mockableAddressProviderDefinition = {
  id: 'mockableAddressProvider',
  type: 'module',
  factory: createMockableAddressProvider,
  dependencies: [
    'assetsAtom',
    'publicKeyProvider',
    'addressCache',
    'knownAddresses',
    'accountStatesAtom',
    'assetSources',
    'unsafeStorage',
    'logger',
    'multisigAtom?',
    'externalWalletAddressesAtom',
  ],
  public: true,
}

export default mockableAddressProviderDefinition
