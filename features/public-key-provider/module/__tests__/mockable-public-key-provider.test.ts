import KeyIdentifier from '@exodus/key-identifier'
import { WalletAccount } from '@exodus/models'

import type { MockablePublicKeyProviderDependencies } from '../mockable-public-key-provider.js'
import { MockablePublicKeyProvider } from '../mockable-public-key-provider.js'

const xpubs = {
  exodus_0: {
    bitcoin: {
      44: 'xpub01',
      84: 'xpub02',
    },
    litecoin: {
      49: 'xpub03',
    },
  },
  exodus_1: {
    bitcoin: {
      44: 'xpub04',
    },
  },
}

const getKeyIdentifierFactory =
  (assetName: string, coinType: number) =>
  ({ purpose, accountIndex }: any) => {
    const derivationPath = `m/${purpose}'/${coinType}'/${accountIndex}'`

    return new KeyIdentifier({
      derivationAlgorithm: 'BIP32',
      keyType: 'secp256k1',
      assetName,
      derivationPath,
    })
  }

const assetsModule = {
  getAsset: jest.fn().mockImplementation((name) => {
    switch (name) {
      case 'bitcoin':
        return {
          baseAsset: {
            api: {
              getKeyIdentifier: getKeyIdentifierFactory('bitcoin', 0),
            },
          },
        }
      case 'litecoin':
        return {
          baseAsset: {
            api: {
              getKeyIdentifier: getKeyIdentifierFactory('litecoin', 2),
            },
          },
        }
    }
  }),
}

const publicKeyStore = {
  add: jest.fn().mockImplementation(async () => {}),
  delete: jest.fn().mockImplementation(async () => {}),
  clearSoftwareWalletAccountKeys: jest.fn().mockImplementation(async () => {}),
}

const logger = {
  warn: jest.fn(),
  debug: jest.fn(),
}

const walletAccountsAtom = {
  get: jest.fn().mockResolvedValue({
    exodus_0: {
      index: 0,
      isSoftware: true,
      toString: jest.fn().mockReturnValue('exodus_0'),
    },
    exodus_1: {
      index: 1,
      isSoftware: true,
      toString: jest.fn().mockReturnValue('exodus_1'),
    },
  }),
}

const deps = {
  assetsModule,
  publicKeyStore,
  logger,
  walletAccountsAtom,
  config: { debug: true },
} as unknown as MockablePublicKeyProviderDependencies

describe('MockablePublicKeyProvider', () => {
  let instance: MockablePublicKeyProvider

  beforeEach(() => {
    jest.clearAllMocks()
    instance = new MockablePublicKeyProvider(deps)
  })

  describe('mocking through IoC container', () => {
    it('ingests all provided mocks', async () => {
      instance = new MockablePublicKeyProvider({ ...deps, config: { xpubs } })
      await instance.onReady

      expect(publicKeyStore.add).toHaveBeenCalledTimes(4)
      expect(publicKeyStore.add).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          xpub: 'xpub01',
          keyIdentifier: new KeyIdentifier({
            assetName: 'bitcoin',
            keyType: 'secp256k1',
            derivationAlgorithm: 'BIP32',
            derivationPath: "m/44'/0'/0'",
          }),
        })
      )

      expect(publicKeyStore.add).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          xpub: 'xpub03',
          keyIdentifier: new KeyIdentifier({
            assetName: 'litecoin',
            keyType: 'secp256k1',
            derivationAlgorithm: 'BIP32',
            derivationPath: "m/49'/2'/0'",
          }),
        })
      )

      expect(publicKeyStore.add).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({
          xpub: 'xpub02',
          keyIdentifier: new KeyIdentifier({
            assetName: 'bitcoin',
            keyType: 'secp256k1',
            derivationAlgorithm: 'BIP32',
            derivationPath: "m/84'/0'/0'",
          }),
        })
      )

      expect(publicKeyStore.add).toHaveBeenNthCalledWith(
        4,
        expect.objectContaining({
          xpub: 'xpub04',
          keyIdentifier: new KeyIdentifier({
            assetName: 'bitcoin',
            keyType: 'secp256k1',
            derivationAlgorithm: 'BIP32',
            derivationPath: "m/44'/0'/1'",
          }),
        })
      )
    })

    it('throws when mocking xpubs for non-software wallets', async () => {
      walletAccountsAtom.get.mockResolvedValueOnce({
        exodus_0: {
          index: 0,
          isSoftware: false,
          toString: jest.fn().mockReturnValue('exodus_0'),
        },
      })

      expect(async () => {
        instance = new MockablePublicKeyProvider({ ...deps, config: { xpubs } })
        await instance.onReady
      }).rejects.toThrow('mocking xpubs is currently only supported for software walletAccounts')
    })
  })

  describe('.mockXPub()', () => {
    const walletAccount = new WalletAccount({ ...WalletAccount.DEFAULT })
    const payload = {
      walletAccount,
      xpub: 'xpub05',
      keyIdentifier: {
        assetName: 'bitcoin',
        keyType: 'secp256k1',
        derivationAlgorithm: 'BIP32',
        derivationPath: "m/44'/0'/0'",
      },
    }

    it('mocks a single xpub', async () => {
      await instance.mockXPub(payload)
      expect(publicKeyStore.add).toHaveBeenCalledTimes(1)
      expect(publicKeyStore.add).toHaveBeenCalledWith(payload)
    })

    it('throws for non-software accounts', async () => {
      expect(async () => {
        await instance.mockXPub({
          ...payload,
          walletAccount: new WalletAccount({
            ...walletAccount,
            source: WalletAccount.TREZOR_SRC,
            id: 'trezor',
          }),
        })
      }).rejects.toThrow('mocking xpubs is currently only supported for software walletAccounts')
    })
  })

  describe('unmockXPub', () => {
    const payload = {
      walletAccountName: 'exodus_0',
      keyIdentifier: {
        assetName: 'bitcoin',
        keyType: 'secp256k1',
        derivationAlgorithm: 'BIP32',
        derivationPath: "m/44'/0'/0'",
      },
    }

    it('clears a single xpub mock', async () => {
      await instance.unmockXPub(payload)
      expect(publicKeyStore.delete).toHaveBeenCalledTimes(1)
      expect(publicKeyStore.delete).toHaveBeenCalledWith(payload)
    })
  })

  describe('clearAllMocks', () => {
    it('clears all mocks at once', async () => {
      jest.clearAllMocks()
      await instance.clearAllMocks()
      expect(publicKeyStore.clearSoftwareWalletAccountKeys).toHaveBeenCalledTimes(1)
    })
  })
})
