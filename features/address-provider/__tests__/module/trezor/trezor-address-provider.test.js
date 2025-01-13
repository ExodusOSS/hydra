import { createInMemoryAtom } from '@exodus/atoms'
import KeyIdentifier from '@exodus/key-identifier'
import { WalletAccount } from '@exodus/models'
import { PublicKeyProvider } from '@exodus/public-key-provider/lib/module/public-key-provider.js'
import publicKeyStoreDefinition from '@exodus/public-key-provider/lib/module/store/index.js'

import createAddressCache from '../../../module/address-cache/memory-test.js'
import addressProviderDefinition from '../../../module/address-provider.js'
import knownAddressesDefinition from '../../../module/known-addresses.js'
import createAssetsForTesting from './_assets.js'
import { createTxLogsAtom } from './fixtures/blockchainMetadata.js'
import { fixture as publicKeys } from './fixtures/public-keys.js'

const { factory: createAddressProvider } = addressProviderDefinition

const mockLogger = { warn: jest.fn() }
const hardwareWalletPublicKeysAtom = createInMemoryAtom({ defaultValue: Object.create(null) })
const softwareWalletPublicKeysAtom = createInMemoryAtom({ defaultValue: Object.create(null) })
const mockWaletAccounts = {
  setAccounts: (data) => hardwareWalletPublicKeysAtom.set(data),
}
const { factory: createKnownAddresses } = knownAddressesDefinition
const { factory: createPublicKeyStore } = publicKeyStoreDefinition

describe('hardware wallet addresses', () => {
  const assetName = 'bitcoin'

  const { assetsModule, assets } = createAssetsForTesting()

  const walletAccount = new WalletAccount({
    source: WalletAccount.TREZOR_SRC,
    index: 0,
    model: 'T',
    id: '69b383b8477be56d6ff5ba24cff0c24e',
    enabled: true,
    label: 'Very secret',
  })
  let addressProvider
  let addressCache
  let publicKeyStore
  let walletAccountsAtom
  let assetSources

  beforeEach(async () => {
    jest.clearAllMocks()
    await hardwareWalletPublicKeysAtom.set(publicKeys)

    walletAccountsAtom = createInMemoryAtom({
      defaultValue: { [walletAccount]: walletAccount },
    })

    publicKeyStore = createPublicKeyStore({
      logger: mockLogger,
      walletAccounts: mockWaletAccounts,
      hardwareWalletPublicKeysAtom,
      softwareWalletPublicKeysAtom,
      walletAccountsAtom,
    })

    const txLogsAtom = createTxLogsAtom()
    const knownAddresses = createKnownAddresses({ txLogsAtom, assetsModule })

    addressCache = createAddressCache()
    assetSources = {
      isSupported: jest.fn(),
      getSupportedPurposes: jest.fn(),
    }

    addressProvider = createAddressProvider({
      publicKeyProvider: new PublicKeyProvider({
        publicKeyStore,
        walletAccountsAtom,
        getBuildMetadata: jest.fn().mockResolvedValue({ dev: false }),
      }),
      assetsModule,
      knownAddresses,
      addressCache,
      logger: mockLogger,
      assetSources,
    })
  })

  describe('getDefaultAddress', () => {
    beforeEach(() => {
      assetSources.isSupported.mockResolvedValue(true)
      assetSources.getSupportedPurposes.mockResolvedValue([84, 49])
    })

    it('should return default address', async () => {
      const address = await addressProvider.getDefaultAddress({
        walletAccount,
        assetName,
      })

      expect(address.toJSON()).toEqual({
        address: 'bc1quv5u46jwcvsx7t0cutfaxa36kuktf8ays8745g',
        meta: {
          path: 'm/0/0',
          purpose: 84,
          walletAccount: walletAccount.toString(),
          keyIdentifier: expect.any(KeyIdentifier),
        },
      })
    })
  })

  describe('getReceiveAddresses', () => {
    beforeEach(() => {
      assetSources.isSupported.mockResolvedValue(true)
      assetSources.getSupportedPurposes.mockResolvedValue([84, 49])
    })

    it('should return all used and the first unused address in multiAddressMode', async () => {
      const addresses = await addressProvider.getReceiveAddresses({
        walletAccount,
        assetName,
        purpose: 84,
        multiAddressMode: true,
      })

      expect(addresses.toArray()).toEqual([
        expect.objectContaining({
          meta: {
            path: 'm/0/0',
            purpose: 84,
            walletAccount: walletAccount.toString(),
            keyIdentifier: new KeyIdentifier({
              assetName,
              derivationPath: "m/84'/0'/0'/0/0",
              keyType: 'secp256k1',
              derivationAlgorithm: 'BIP32',
            }),
          },
        }),
        expect.objectContaining({
          meta: {
            path: 'm/0/1',
            purpose: 84,
            walletAccount: walletAccount.toString(),
            keyIdentifier: new KeyIdentifier({
              assetName,
              derivationPath: "m/84'/0'/0'/0/1",
              keyType: 'secp256k1',
              derivationAlgorithm: 'BIP32',
            }),
          },
        }),
        expect.objectContaining({
          meta: {
            path: 'm/0/2',
            purpose: 84,
            walletAccount: walletAccount.toString(),
            keyIdentifier: new KeyIdentifier({
              assetName,
              derivationPath: "m/84'/0'/0'/0/2",
              keyType: 'secp256k1',
              derivationAlgorithm: 'BIP32',
            }),
          },
        }),
      ])
    })

    it('should return default receive address if not multiAddressMode', async () => {
      const addresses = await addressProvider.getReceiveAddresses({
        walletAccount,
        assetName,
        purpose: 84,
        multiAddressMode: false,
      })

      expect(addresses.toArray()).toEqual([
        expect.objectContaining({
          meta: {
            path: 'm/0/0',
            purpose: 84,
            walletAccount: walletAccount.toString(),
            keyIdentifier: new KeyIdentifier({
              assetName,
              derivationPath: "m/84'/0'/0'/0/0",
              keyType: 'secp256k1',
              derivationAlgorithm: 'BIP32',
            }),
          },
        }),
      ])
    })

    it('should return addresses for supported purposes when no purpose provided', async () => {
      const trezorAccount = new WalletAccount({ ...walletAccount, id: 'abc' })
      await walletAccountsAtom.set((prev) => ({ ...prev, [trezorAccount]: trezorAccount }))

      const addresses = await addressProvider.getReceiveAddresses({
        walletAccount: trezorAccount,
        assetName,
        multiAddressMode: true,
      })

      expect(addresses.toArray()).toEqual([
        expect.objectContaining({
          address: 'bc1quv5u46jwcvsx7t0cutfaxa36kuktf8ays8745g',
          meta: {
            path: 'm/0/0',
            purpose: 84,
            walletAccount: trezorAccount.toString(),
            keyIdentifier: new KeyIdentifier({
              assetName,
              derivationPath: "m/84'/0'/0'/0/0",
              keyType: 'secp256k1',
              derivationAlgorithm: 'BIP32',
            }),
          },
        }),
        expect.objectContaining({
          address: '363X2DSXeRHRZoZso6xr1oJzxLYpVin9AW',
          meta: {
            path: 'm/0/0',
            purpose: 49,
            walletAccount: trezorAccount.toString(),
            keyIdentifier: new KeyIdentifier({
              assetName,
              derivationPath: "m/49'/0'/0'/0/0",
              keyType: 'secp256k1',
              derivationAlgorithm: 'BIP32',
            }),
          },
        }),
      ])
    })
  })

  describe('getReceiveAddress', () => {
    beforeEach(() => {
      assetSources.isSupported.mockResolvedValue(true)
      assetSources.getSupportedPurposes.mockResolvedValue([84, 49])
    })

    it('should return address for purpose 49, multiAddressMode: true', async () => {
      const address = await addressProvider.getReceiveAddress({
        walletAccount,
        assetName,
        purpose: 49,
        multiAddressMode: true,
      })

      expect(address.toJSON()).toEqual({
        address: '3Jpc8iuLhvb3CkapT9ioZg8SZ5qRjyUqBm',
        meta: {
          path: 'm/0/3',
          purpose: 49,
          walletAccount: walletAccount.toString(),
          keyIdentifier: expect.any(KeyIdentifier),
        },
      })
    })

    it('should return address for purpose 49, multiAddressMode: false', async () => {
      const address = await addressProvider.getReceiveAddress({
        walletAccount,
        assetName,
        purpose: 49,
        multiAddressMode: false,
      })

      expect(address.toJSON()).toEqual({
        address: '363X2DSXeRHRZoZso6xr1oJzxLYpVin9AW',
        meta: {
          path: 'm/0/0',
          purpose: 49,
          walletAccount: walletAccount.toString(),
          keyIdentifier: expect.any(KeyIdentifier),
        },
      })
    })

    it('should return address for supplied address index', async () => {
      const address = await addressProvider.getReceiveAddress({
        walletAccount,
        assetName,
        addressIndex: 12,
        multiAddressMode: true,
      })

      expect(address.toJSON()).toEqual({
        address: 'bc1qs7v8c57qlnr22t6ztqd9cyq5yu9q9tcue6qqh8',
        meta: {
          path: 'm/0/2',
          purpose: 84,
          walletAccount: walletAccount.toString(),
          keyIdentifier: expect.any(KeyIdentifier),
        },
      })
    })

    it('should override address index for multi address assets', async () => {
      const address = await addressProvider.getReceiveAddress({
        walletAccount,
        assetName,
        addressIndex: 55,
        multiAddressMode: true,
      })

      expect(address.toJSON()).toEqual({
        address: 'bc1qs7v8c57qlnr22t6ztqd9cyq5yu9q9tcue6qqh8',
        meta: {
          path: 'm/0/2',
          purpose: 84,
          walletAccount: walletAccount.toString(),
          keyIdentifier: expect.any(KeyIdentifier),
        },
      })
    })

    it('should return correct receive address with defaults for address index and purpose', async () => {
      const address = await addressProvider.getReceiveAddress({
        walletAccount,
        assetName,
        multiAddressMode: true,
      })

      expect(address.toJSON()).toEqual({
        address: 'bc1qs7v8c57qlnr22t6ztqd9cyq5yu9q9tcue6qqh8',
        meta: {
          path: 'm/0/2',
          purpose: 84,
          walletAccount: walletAccount.toString(),
          keyIdentifier: expect.any(KeyIdentifier),
        },
      })
    })
  })

  describe('getChangeAddress', () => {
    beforeEach(() => {
      assetSources.isSupported.mockResolvedValue(true)
      assetSources.getSupportedPurposes.mockResolvedValue([84, 49])
    })

    it('should return address for purpose 49, multiAddressMode: true', async () => {
      const address = await addressProvider.getChangeAddress({
        walletAccount,
        assetName,
        purpose: 49,
        multiAddressMode: true,
      })

      expect(address.toJSON()).toEqual({
        address: '38j3zxtJPqgBE9J8QzaDvcA7hoAzeoHLJN',
        meta: {
          path: 'm/1/1',
          purpose: 49,
          walletAccount: walletAccount.toString(),
          keyIdentifier: expect.any(KeyIdentifier),
        },
      })
    })

    it('should return address for purpose 49, multiAddressMode: false', async () => {
      const address = await addressProvider.getChangeAddress({
        walletAccount,
        assetName,
        purpose: 49,
        multiAddressMode: false,
      })

      expect(address.toJSON()).toEqual({
        address: '3JTayXaovs7JKtoxJuTyEFzs9SMbni1jfS',
        meta: {
          path: 'm/1/0',
          purpose: 49,
          walletAccount: walletAccount.toString(),
          keyIdentifier: expect.any(KeyIdentifier),
        },
      })
    })

    it('should override address index for multi address assets', async () => {
      const address = await addressProvider.getChangeAddress({
        walletAccount,
        assetName,
        addressIndex: 42,
        multiAddressMode: true,
      })

      expect(address.toJSON()).toEqual({
        address: 'bc1qpl3mp7ftrltua2upfecu7jp2jjryu3eqge5x0x',
        meta: {
          path: 'm/1/1',
          purpose: 84,
          walletAccount: walletAccount.toString(),
          keyIdentifier: expect.any(KeyIdentifier),
        },
      })
    })

    it('should return one with defaults for address index and purpose', async () => {
      const address = await addressProvider.getChangeAddress({
        walletAccount,
        assetName,
        multiAddressMode: true,
      })

      expect(address.toJSON()).toEqual({
        address: 'bc1qpl3mp7ftrltua2upfecu7jp2jjryu3eqge5x0x',
        meta: {
          path: 'm/1/1',
          purpose: 84,
          walletAccount: walletAccount.toString(),
          keyIdentifier: expect.any(KeyIdentifier),
        },
      })
    })
  })

  describe('getUnusedAddressIndexes', () => {
    beforeEach(() => {
      assetSources.isSupported.mockResolvedValue(true)
      assetSources.getSupportedPurposes.mockResolvedValue([84, 49])
    })

    it('should return unused indexes', async () => {
      await expect(
        addressProvider.getUnusedAddressIndexes({
          assetName,
          walletAccount,
        })
      ).resolves.toEqual(
        expect.arrayContaining([
          {
            chain: [2, 1],
            purpose: 84,
          },
          {
            chain: [3, 1],
            purpose: 49,
          },
        ])
      )
    })

    it('should only return indexes for supplied purpose', async () => {
      await expect(
        addressProvider.getUnusedAddressIndexes({
          assetName,
          walletAccount,
          purpose: 49,
        })
      ).resolves.toEqual([
        {
          purpose: 49,
          chain: [3, 1],
        },
      ])
    })

    it('should throw when passing a purpose that is not supported', async () => {
      await expect(
        addressProvider.getUnusedAddressIndexes({
          assetName,
          walletAccount,
          purpose: 249,
        })
      ).rejects.toThrow(
        'purpose "249" is not supported for asset "bitcoin" in wallet "trezor_0_69b383b8477be56d6ff5ba24cff0c24e"'
      )
    })
  })

  describe('getUnusedAddress', () => {
    beforeEach(() => {
      assetSources.isSupported.mockResolvedValue(true)
      assetSources.getSupportedPurposes.mockResolvedValue([84])
    })

    it('should create address from unused address index', async () => {
      const receiveAddress = await addressProvider.getUnusedAddress({
        walletAccount,
        assetName,
        chainIndex: 0,
      })

      const changeAddress = await addressProvider.getUnusedAddress({
        walletAccount,
        assetName,
        chainIndex: 1,
      })

      expect(receiveAddress.toJSON()).toEqual({
        address: 'bc1qs7v8c57qlnr22t6ztqd9cyq5yu9q9tcue6qqh8',
        meta: {
          path: 'm/0/2',
          purpose: 84,
          walletAccount: walletAccount.toString(),
          keyIdentifier: expect.any(KeyIdentifier),
        },
      })

      expect(changeAddress.toJSON()).toEqual({
        address: 'bc1qpl3mp7ftrltua2upfecu7jp2jjryu3eqge5x0x',
        meta: {
          path: 'm/1/1',
          purpose: 84,
          walletAccount: walletAccount.toString(),
          keyIdentifier: expect.any(KeyIdentifier),
        },
      })
    })
  })

  describe('getAddress', () => {
    it('should supply stakingPublicKey to encodePublic', async () => {
      assetSources.isSupported.mockResolvedValue(true)
      assetSources.getSupportedPurposes.mockResolvedValue([1852])

      assets.cardano.keys.encodePublic = jest.fn(assets.cardano.keys.encodePublic)

      await addressProvider.getAddress({
        assetName: 'cardano',
        purpose: 1852,
        addressIndex: 0,
        chainIndex: 0,
        walletAccount,
      })

      const account = publicKeys[walletAccount.toString()]["m/1852'/1815'/0'/0/0"]
      const accountStaking = publicKeys[walletAccount.toString()]["m/1852'/1815'/0'/2/0"]
      expect(assets.cardano.keys.encodePublic).toHaveBeenCalledWith(
        Buffer.from(account.publicKey, 'hex'),
        { purpose: 1852 },
        Buffer.from(accountStaking.publicKey, 'hex')
      )
    })

    it('should work with Monero public key format', async () => {
      assetSources.isSupported.mockResolvedValue(true)
      assetSources.getSupportedPurposes.mockResolvedValue([44])

      await addressProvider.getAddress({
        assetName: 'monero',
        purpose: 44,
        addressIndex: 0,
        chainIndex: 0,
        walletAccount,
      })

      const account = publicKeys[walletAccount.toString()]["m/44'/128'/0'"]
      expect(assets.monero.keys.encodePublic).toHaveBeenCalledWith(
        {
          spendPub: Buffer.from(account.publicKey.spendPub, 'hex'),
          viewPriv: Buffer.from(account.publicKey.viewPriv, 'hex'),
          viewPub: Buffer.from(account.publicKey.viewPub, 'hex'),
        },
        { purpose: 44 },
        account.stakingPublicKey
      )
    })

    it('should return address from cache if `useCache` is true', async () => {
      assetSources.isSupported.mockResolvedValue(true)
      assetSources.getSupportedPurposes.mockResolvedValue([84])

      addressCache.get = jest.fn(addressCache.get)
      addressCache.set = jest.fn(addressCache.set)

      const first = await addressProvider.getReceiveAddress({
        walletAccount,
        assetName,
        purpose: 84,
        addressIndex: 0,
        chainIndex: 0,
      })

      const second = await addressProvider.getReceiveAddress({
        walletAccount,
        assetName,
        purpose: 84,
        addressIndex: 0,
        chainIndex: 0,
        useCache: true,
      })

      expect(first).toEqual(second)
      expect(addressCache.get).toHaveBeenCalledTimes(2)
      expect(addressCache.set).toHaveBeenCalledTimes(1)
    })
  })
})
