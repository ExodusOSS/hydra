import addressProviderDefinition from '../../../module/address-provider.js'
import { assets, setup, walletAccount } from '../utils.js'

const { bitcoin } = assets
const assetName = bitcoin.name
const { factory: createAddressProvider } = addressProviderDefinition

describe('cache behavior', () => {
  let addressProvider
  let addressCacheGet

  beforeEach(() => {
    const {
      assetsModule,
      accountStatesAtom,
      walletAccountsAtom,
      assetSources,
      publicKeyProvider,
      knownAddresses,
      addressCache,
    } = setup()

    addressCacheGet = jest.spyOn(addressCache, 'get')

    addressProvider = createAddressProvider({
      assetsModule,
      addressCache,
      accountStatesAtom,
      publicKeyProvider,
      knownAddresses,
      walletAccountsAtom,
      assetSources,
    })
  })

  test('getReceiveAddress() does not use address cache by default', async () => {
    await addressProvider.getReceiveAddress({
      assetName,
      walletAccount,
      purpose: 44,
      chainIndex: 1,
      addressIndex: 55,
    })

    expect(addressCacheGet).not.toHaveBeenCalled()
  })

  test('getReceiveAddresses() does not use address cache by default', async () => {
    await addressProvider.getReceiveAddresses({
      assetName,
      walletAccount,
      purpose: 44,
    })

    expect(addressCacheGet).not.toHaveBeenCalled()
  })

  test('getReceiveAddress() uses address cache if requested', async () => {
    addressCacheGet.mockImplementation(({ baseAssetName, walletAccountName, derivationPath }) => {
      expect(baseAssetName).toBe(assetName)
      expect(walletAccountName).toBe(walletAccount.toString())
      expect(derivationPath).toBe("m/44'/0'/0'/0/0")
      return { address: 'cached-address' }
    })

    const address = await addressProvider.getReceiveAddress({
      assetName,
      walletAccount,
      purpose: 44,
      chainIndex: 1,
      addressIndex: 55,
      useCache: true,
    })

    expect(address.toString()).toBe('cached-address')
  })

  test('getReceiveAddresses() uses address cache if requested', async () => {
    addressCacheGet.mockImplementation(({ baseAssetName, walletAccountName, derivationPath }) => {
      expect(baseAssetName).toBe(assetName)
      expect(walletAccountName).toBe(walletAccount.toString())
      expect(derivationPath).toBe("m/44'/0'/0'/0/0")
      return { address: 'cached-address' }
    })

    const address = await addressProvider.getReceiveAddresses({
      assetName,
      walletAccount,
      purpose: 44,
      useCache: true,
    })

    expect(address.toString()).toBe('cached-address')
  })
})
