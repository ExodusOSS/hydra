import { UserRefusedError, XPubUnsupportedError } from '@exodus/hw-common'
import pDefer from 'p-defer'

jest.doMock('@exodus/crypto/randomBytes', () => ({
  __esModule: true,
  randomBytes: jest.fn(),
}))

const { randomBytes } = await import('@exodus/crypto/randomBytes')
const { default: hardwareWalletsModuleDefinition } = await import('../index.js')

// Mock dependencies
const assetsModule = {
  getAsset: jest.fn(),
}

const ledgerDiscovery = {
  list: jest.fn(),
}

const userInterface = {
  getRPC: jest.fn(),
}

const publicKeyStore = {
  add: jest.fn(),
}

const wallet = {
  exists: jest.fn(),
}

const walletAccountsAtom = {
  get: jest.fn(),
}

const walletAccounts = {
  create: jest.fn(),
  setActive: jest.fn(),
}

// const txLogMonitors = {
//   update: jest.fn(),
// }

// const restoreProgressTracker = {
//   restoreAsset: jest.fn(),
// }

// Helper function to mock resolved promises
const mockResolvedPromise = (value) => jest.fn().mockResolvedValue(value)

// Helper function to mock rejected promises
const mockRejectedPromise = (error) => jest.fn().mockRejectedValue(error)

describe('HardwareWallets', () => {
  let hardwareWallets = null

  beforeEach(() => {
    hardwareWallets = hardwareWalletsModuleDefinition.factory({
      assetsModule,
      ledgerDiscovery,
      logger: console,
      userInterface,
      publicKeyStore,
      wallet,
      walletAccountsAtom,
      walletAccounts,
      // txLogMonitors,
      // restoreProgressTracker,
    })
    jest.resetAllMocks()
  })

  describe('constructor', () => {
    it('should properly create module', () => {
      expect(hardwareWallets).toBeDefined()
    })
  })

  describe('isDeviceConnected', () => {
    it('should return true if devices are connected', async () => {
      ledgerDiscovery.list.mockResolvedValueOnce([{}])
      const result = await hardwareWallets.isDeviceConnected()
      expect(result).toBe(true)
    })

    it('should return false if no devices are connected', async () => {
      ledgerDiscovery.list.mockResolvedValueOnce([])
      const result = await hardwareWallets.isDeviceConnected()
      expect(result).toBe(false)
    })
  })

  describe('canAccessAsset', () => {
    const assetName = 'assetName'

    it('should return true if asset can be accessed', async () => {
      const baseAsset = {
        name: 'baseAssetName',
      }

      const mockDevice = {
        listUseableAssetNames: mockResolvedPromise([baseAsset.name]),
      }
      const mockDescriptor = { get: () => mockDevice }
      assetsModule.getAsset.mockReturnValueOnce({ baseAsset })
      ledgerDiscovery.list.mockResolvedValueOnce([mockDescriptor])

      const result = await hardwareWallets.canAccessAsset({ assetName })
      expect(result).toBe(true)
    })

    it('should return false if asset cannot be accessed', async () => {
      const baseAsset = {
        name: 'baseAssetName',
      }
      const mockDevice = {
        listUseableAssetNames: mockResolvedPromise([]),
      }

      const mockDescriptor = { get: () => mockDevice }
      assetsModule.getAsset.mockReturnValueOnce({ baseAsset })
      ledgerDiscovery.list.mockResolvedValueOnce([mockDescriptor])

      const result = await hardwareWallets.canAccessAsset({ assetName })
      expect(result).toBe(false)
    })
  })

  describe('listUseableAssetNames', () => {
    it('should list usable asset names', async () => {
      const assetNames = ['asset1', 'asset2']
      const mockDevice = {
        listUseableAssetNames: mockResolvedPromise(assetNames),
      }
      const mockDescriptor = { get: () => mockDevice }
      ledgerDiscovery.list.mockResolvedValue([mockDescriptor])

      const result = await hardwareWallets.listUseableAssetNames()
      expect(result).toEqual(assetNames)
    })
  })

  describe('ensureApplicationIsOpened', () => {
    const assetName = 'assetName'

    it('should ensure application is opened', async () => {
      const baseAsset = { name: 'baseAssetName' }
      const mockDevice = {
        ensureApplicationIsOpened: jest.fn(),
      }
      const mockDescriptor = { get: () => mockDevice }
      assetsModule.getAsset.mockReturnValue({ baseAsset })

      ledgerDiscovery.list.mockResolvedValue([mockDescriptor])

      await hardwareWallets.ensureApplicationIsOpened({ assetName })
      expect(ledgerDiscovery.list).toHaveBeenCalledTimes(3)
    })
  })

  describe('canAccessAsset', () => {
    const assetName = 'assetName'

    it('should return true if asset can be accessed', async () => {
      const baseAsset = {
        name: 'baseAssetName',
      }

      const mockDevice = {
        listUseableAssetNames: mockResolvedPromise([baseAsset.name]),
      }
      const mockDescriptor = { get: () => mockDevice }
      assetsModule.getAsset.mockReturnValueOnce({ baseAsset })
      ledgerDiscovery.list.mockResolvedValueOnce([mockDescriptor])

      const result = await hardwareWallets.canAccessAsset({ assetName })
      expect(result).toBe(true)
    })

    it('should return false if asset cannot be accessed', async () => {
      const baseAsset = {
        name: 'baseAssetName',
      }
      const mockDevice = {
        listUseableAssetNames: mockResolvedPromise([]),
      }
      const mockDescriptor = { get: () => mockDevice }

      assetsModule.getAsset.mockReturnValueOnce({ baseAsset })
      ledgerDiscovery.list.mockResolvedValueOnce([mockDescriptor])

      const result = await hardwareWallets.canAccessAsset({ assetName })
      expect(result).toBe(false)
    })
  })

  describe('scan', () => {
    it('should scan the first 2 addresses for a given asset name and set of accountIndexes', async () => {
      const assetName = 'bitcoin'
      const accountIndexes = [0, 1]
      const addressOffset = 0

      const mockAsset = {
        api: {
          getSupportedPurposes: jest.fn().mockReturnValue([44]),
          getKeyIdentifier: jest.fn().mockImplementation(({ accountIndex, addressIndex }) => {
            return {
              derivationPath: `m/44'/0'/${accountIndex}'/0/${addressIndex}`,
            }
          }),
          getBalanceForAddress: jest.fn().mockImplementation((address) => `balance_for_${address}`),
        },
      }
      mockAsset.baseAsset = mockAsset
      assetsModule.getAsset.mockReturnValue(mockAsset)

      const mockDevice = {
        getAddress: jest.fn().mockImplementation(({ derivationPath }) => {
          return 'address_' + derivationPath
        }),
      }

      const mockDescriptor = { get: () => mockDevice }
      ledgerDiscovery.list.mockResolvedValue([mockDescriptor])

      wallet.exists.mockResolvedValue(true)
      walletAccountsAtom.get.mockResolvedValue([
        {
          source: 'ledger',
          index: 1,
        },
      ])

      const result = await hardwareWallets.scan({ assetName, accountIndexes, addressOffset })
      expect(result).toEqual([
        {
          accountIndex: 0,
          addressToBalanceMap: {
            "address_m/44'/0'/0'/0/0": "balance_for_address_m/44'/0'/0'/0/0",
            "address_m/44'/0'/0'/0/1": "balance_for_address_m/44'/0'/0'/0/1",
          },
          mayAlreadyBeSynced: false,
        },
        {
          accountIndex: 1,
          addressToBalanceMap: {
            "address_m/44'/0'/1'/0/0": "balance_for_address_m/44'/0'/1'/0/0",
            "address_m/44'/0'/1'/0/1": "balance_for_address_m/44'/0'/1'/0/1",
          },
          mayAlreadyBeSynced: true,
        },
      ])
      expect(mockDevice.getAddress.mock.calls).toEqual([
        [
          {
            assetName,
            derivationPath: "m/44'/0'/0'/0/0",
          },
        ],
        [
          {
            assetName,
            derivationPath: "m/44'/0'/0'/0/1",
          },
        ],
        [
          {
            assetName,
            derivationPath: "m/44'/0'/1'/0/0",
          },
        ],
        [
          {
            assetName,
            derivationPath: "m/44'/0'/1'/0/1",
          },
        ],
      ])
    })
  })

  describe('sync', () => {
    const accountIndex = 0
    const assetName = 'fakeasset'
    const mockAsset = {
      name: assetName,
      api: { getSupportedPurposes: jest.fn(), getKeyIdentifier: jest.fn() },
    }
    mockAsset.baseAsset = mockAsset
    const syncedKeysId = 'deadbeefdeadbeef'

    const mockDevice = {
      descriptor: { model: 'nanoS' },
      listUseableAssetNames: jest.fn(),
      getXPub: jest.fn(),
      getPublicKey: jest.fn().mockResolvedValue('publicKey'),
    }

    const mockDescriptor = { get: () => mockDevice }

    beforeEach(() => {
      mockDevice.listUseableAssetNames.mockResolvedValue([assetName])
      mockAsset.api.getSupportedPurposes.mockReturnValue([44, 49, 84, 86])
      mockAsset.api.getKeyIdentifier.mockImplementation(({ purpose, accountIndex }) => {
        return {
          derivationPath: `m/${purpose}'/0'/${accountIndex}'`,
        }
      })
      assetsModule.getAsset.mockReturnValue(mockAsset)
      ledgerDiscovery.list.mockResolvedValue([mockDescriptor])
      randomBytes.mockReturnValue(Buffer.from(syncedKeysId, 'hex'))
    })

    it('should sync XPUB with the hardware wallet device', async () => {
      mockDevice.getXPub.mockResolvedValue('xpub')
      const result = await hardwareWallets.sync({ accountIndex })
      expect(result).toBe(syncedKeysId)
      expect(mockDevice.listUseableAssetNames).toHaveBeenCalled()
      expect(mockDevice.getXPub.mock.calls).toEqual([
        [
          {
            assetName,
            derivationPath: "m/44'/0'/0'",
          },
        ],
        [
          {
            assetName,
            derivationPath: "m/49'/0'/0'",
          },
        ],
        [
          {
            assetName,
            derivationPath: "m/84'/0'/0'",
          },
        ],
        [
          {
            assetName,
            derivationPath: "m/86'/0'/0'",
          },
        ],
      ])
    })

    it('should throw for other errors', async () => {
      const error = new Error('random other error')
      mockDevice.getXPub.mockRejectedValue(error)
      await expect(hardwareWallets.sync({ accountIndex })).rejects.toEqual(error)
    })

    it('should sync public keys with the hardware wallet device', async () => {
      mockDevice.getXPub.mockRejectedValue(new XPubUnsupportedError())
      mockDevice.getPublicKey.mockImplementation(
        ({ derivationPath }) => `publicKey_${derivationPath}`
      )
      const result = await hardwareWallets.sync({ accountIndex })
      expect(result).toBe(syncedKeysId)
      expect(mockDevice.listUseableAssetNames).toHaveBeenCalled()
      expect(mockDevice.getPublicKey.mock.calls).toEqual([
        [
          {
            assetName,
            derivationPath: "m/44'/0'/0'",
          },
        ],
        [
          {
            assetName,
            derivationPath: "m/49'/0'/0'",
          },
        ],
        [
          {
            assetName,
            derivationPath: "m/84'/0'/0'",
          },
        ],
        [
          {
            assetName,
            derivationPath: "m/86'/0'/0'",
          },
        ],
      ])
    })
  })

  describe('addPublicKeysToWalletAccount', () => {
    it('should store the synced keys', async () => {
      const accountIndex = 0
      const assetName = 'ethereum'

      const mockAsset = {
        name: assetName,
        api: { getSupportedPurposes: jest.fn(), getKeyIdentifier: jest.fn() },
      }
      mockAsset.baseAsset = mockAsset

      const mockDevice = {
        listUseableAssetNames: jest.fn().mockResolvedValue([assetName]),
        getXPub: jest.fn().mockResolvedValue('xpub'),
        getPublicKey: jest.fn().mockResolvedValue('publicKey'),
      }

      const mockDescriptor = {
        get: () => ({
          descriptor: mockDescriptor,
          ...mockDevice,
        }),
      }

      mockAsset.api.getSupportedPurposes.mockReturnValue([44])
      mockAsset.api.getKeyIdentifier.mockImplementation(({ purpose, accountIndex }) => {
        return {
          derivationPath: `m/${purpose}'/1337'/${accountIndex}'`,
        }
      })
      assetsModule.getAsset.mockReturnValue(mockAsset)
      ledgerDiscovery.list.mockResolvedValue([mockDescriptor])

      const randomness = 'deadbeefdeadbeef'
      randomBytes.mockReturnValueOnce(Buffer.from(randomness, 'hex'))

      const syncedKeysId = await hardwareWallets.sync({ accountIndex })
      expect(syncedKeysId).toBe(randomness)

      const walletAccountName = 'ledger_0_deadbeef'
      await hardwareWallets.addPublicKeysToWalletAccount({
        walletAccount: { name: walletAccountName },
        syncedKeysId,
      })

      expect(publicKeyStore.add).toHaveBeenCalledWith({
        keyIdentifier: {
          derivationPath: "m/44'/1337'/0'",
        },
        publicKey: undefined,
        walletAccount: { name: 'ledger_0_deadbeef' },
        xpub: 'xpub',
      })
      // expect(restoreProgressTracker.restoreAsset).toHaveBeenCalledWith('ethereum')
      // expect(restoreProgressTracker.restoreAsset).toHaveBeenCalledWith('matic')
    })
  })

  describe('create', () => {
    it('should create a new wallet account', async () => {
      const accountIndex = 0
      const id = 'a96474a689c625e6a7ac5c6013ad3d187f93c37b0dca6a1c8b0052de95e18aed'
      const walletAccountName = `ledger_${accountIndex}_${id}`
      const assetName = 'ethereum'

      const mockAsset = {
        name: assetName,
        api: { getSupportedPurposes: jest.fn(), getKeyIdentifier: jest.fn() },
      }
      mockAsset.baseAsset = mockAsset

      const mockDevice = {
        listUseableAssetNames: jest.fn().mockResolvedValue([assetName]),
        getXPub: jest.fn().mockResolvedValue('xpub'),
        getPublicKey: jest.fn().mockResolvedValue('publicKey'),
      }

      const mockDescriptor = {
        model: 'nanoS',
        get: () => ({
          descriptor: mockDescriptor,
          ...mockDevice,
        }),
      }

      mockAsset.api.getSupportedPurposes.mockReturnValue([44])
      mockAsset.api.getKeyIdentifier.mockImplementation(({ purpose, accountIndex }) => {
        return {
          derivationPath: `m/${purpose}'/1337'/${accountIndex}'`,
        }
      })
      assetsModule.getAsset.mockReturnValue(mockAsset)
      ledgerDiscovery.list.mockResolvedValue([mockDescriptor])

      // synced keys id randomness
      const randomness = 'deadbeefdeadbeef'
      randomBytes.mockReturnValueOnce(Buffer.from(randomness, 'hex'))

      // wallet account id randomness
      randomBytes.mockReturnValueOnce(Buffer.from(id, 'hex'))

      const syncedKeysId = await hardwareWallets.sync({ accountIndex })
      await hardwareWallets.create({ syncedKeysId })

      expect(walletAccounts.create).toHaveBeenCalledWith({
        color: '#f5e400',
        compatibilityMode: 'ledger',
        enabled: true,
        icon: 'ledger',
        id,
        index: accountIndex,
        is2FA: undefined,
        isMultisig: false,
        label: 'Ledger',
        lastConnected: undefined,
        model: 'nanoS',
        seedId: undefined,
        source: 'ledger',
      })
      expect(walletAccounts.setActive).toHaveBeenCalledWith(walletAccountName)
    })
  })

  describe('signTransaction', () => {
    const baseAssetName = 'assetName'
    const unsignedTx = {}
    const walletAccount = { index: 0 }
    const signTransactionParams = { baseAssetName, unsignedTx, walletAccount }

    it('should sign a transaction successfully', async () => {
      const baseAsset = {
        api: {
          signHardware: mockResolvedPromise('signedTx'),
        },
      }

      const mockDevice = {
        ensureApplicationIsOpened: jest.fn(),
      }
      const mockDescriptor = {
        model: 'nanoS',
        get: () => ({
          descriptor: mockDescriptor,
          ...mockDevice,
        }),
      }

      assetsModule.getAsset.mockReturnValue(baseAsset)
      ledgerDiscovery.list.mockResolvedValue([mockDescriptor])

      const uiResult = pDefer()
      userInterface.getRPC.mockReturnValue({
        callMethod: jest.fn(() => uiResult.promise),
      })

      const result = await hardwareWallets.signTransaction(signTransactionParams)
      uiResult.resolve({ tryAgain: false })
      expect(result).toBe('signedTx')
    })

    it('should throw UserCancelledError on failure', async () => {
      const baseAsset = {
        api: {
          signHardware: mockRejectedPromise(new Error('timeout')),
        },
      }

      const mockDevice = {
        ensureApplicationIsOpened: jest.fn(),
      }

      const mockDescriptor = {
        get: () => ({
          descriptor: mockDescriptor,
          ...mockDevice,
        }),
      }
      assetsModule.getAsset.mockReturnValue(baseAsset)
      ledgerDiscovery.list.mockResolvedValue([mockDescriptor])

      const uiResult = pDefer()
      userInterface.getRPC.mockReturnValue({
        callMethod: jest.fn(() => uiResult.promise),
      })

      await expect(hardwareWallets.signTransaction(signTransactionParams)).rejects.toThrow(
        UserRefusedError
      )
      uiResult.resolve({ tryAgain: false })
    })
  })

  describe('signMessage', () => {
    const assetName = 'assetName'
    const derivationPath = 'derivationPath'
    const message = 'message'
    const signMessageParams = { assetName, derivationPath, message }

    it('should sign a message successfully', async () => {
      const baseAsset = {
        name: 'baseAssetName',
        api: {},
      }

      const mockDevice = {
        ensureApplicationIsOpened: jest.fn(),
        signMessage: mockResolvedPromise('signedMessage'),
      }
      const mockDescriptor = {
        model: 'nanoS',
        get: () => ({
          descriptor: mockDescriptor,
          ...mockDevice,
        }),
      }

      assetsModule.getAsset.mockReturnValue({ baseAsset })
      ledgerDiscovery.list.mockResolvedValue([mockDescriptor])

      const uiResult = pDefer()
      userInterface.getRPC.mockReturnValue({
        callMethod: jest.fn(() => uiResult.promise),
      })

      const result = await hardwareWallets.signMessage(signMessageParams)
      uiResult.resolve({ tryAgain: false })
      expect(result).toBe('signedMessage')
    })

    it('should throw UserCancelledError on failure', async () => {
      const baseAsset = {
        name: 'baseAssetName',
        api: {},
      }

      const mockDevice = {
        ensureApplicationIsOpened: jest.fn(),
        signMessage: mockRejectedPromise(new Error('timeout')),
      }
      const mockDescriptor = {
        model: 'nanoS',
        get: () => ({
          descriptor: mockDescriptor,
          ...mockDevice,
        }),
      }
      assetsModule.getAsset.mockReturnValue({ baseAsset })
      ledgerDiscovery.list.mockResolvedValue([mockDescriptor])

      const uiResult = pDefer()
      userInterface.getRPC.mockReturnValue({
        callMethod: jest.fn(() => uiResult.promise),
      })

      await expect(hardwareWallets.signMessage(signMessageParams)).rejects.toThrow(UserRefusedError)
      uiResult.resolve({ tryAgain: false })
    })
  })
})
