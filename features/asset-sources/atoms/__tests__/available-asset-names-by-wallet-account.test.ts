import { createInMemoryAtom } from '@exodus/atoms'
import { WalletAccount } from '@exodus/models'

import type { Assets } from '../../types.js'
import { availableAssetNamesByWalletAccountAtomDefinition } from '../available-asset-names-by-wallet-account.js'
import { createAssetsForTesting } from './test-utils.js'

describe('availableAssetNamesByWalletAccountAtom', () => {
  let assets: Assets

  beforeEach(() => {
    const { assets: testAssets } = createAssetsForTesting()
    assets = testAssets
  })

  describe('Trezor wallet accounts', () => {
    it('should return supported assets for Trezor T model', async () => {
      const trezorAccount = new WalletAccount({
        source: WalletAccount.TREZOR_SRC,
        id: 'trezor_123',
        model: 'T',
        index: 0,
      })

      const enabledWalletAccountsAtom = createInMemoryAtom({
        defaultValue: {
          [trezorAccount.toString()]: trezorAccount,
        },
      })

      const atom = availableAssetNamesByWalletAccountAtomDefinition.factory({
        assetsAtom: createInMemoryAtom({ defaultValue: { value: assets } }),
        availableAssetNamesAtom: createInMemoryAtom({
          defaultValue: ['bitcoin', 'dogecoin', 'ethereum', 'litecoin', 'solana', 'stellar'],
        }),
        enabledWalletAccountsAtom,
      })

      const result = await atom.get()

      expect(result[trezorAccount.toString()]).toContain('bitcoin')
      expect(result[trezorAccount.toString()]).toContain('ethereum')
      expect(result[trezorAccount.toString()]).not.toContain('solana')
    })

    it('should return supported assets for Trezor One model', async () => {
      const trezorOneAccount = new WalletAccount({
        source: WalletAccount.TREZOR_SRC,
        id: 'trezor_one_456',
        model: '1',
        index: 0,
      })

      const enabledWalletAccountsAtom = createInMemoryAtom({
        defaultValue: {
          [trezorOneAccount.toString()]: trezorOneAccount,
        },
      })

      const atom = availableAssetNamesByWalletAccountAtomDefinition.factory({
        assetsAtom: createInMemoryAtom({ defaultValue: { value: assets } }),
        availableAssetNamesAtom: createInMemoryAtom({
          defaultValue: ['bitcoin', 'ethereum', 'litecoin'],
        }),
        enabledWalletAccountsAtom,
      })

      const result = await atom.get()

      expect(result[trezorOneAccount.toString()]).toContain('bitcoin')
      expect(result[trezorOneAccount.toString()]).toContain('ethereum')
    })
  })

  describe('Ledger wallet accounts', () => {
    it('should return supported assets for Ledger Nano S', async () => {
      const ledgerAccount = new WalletAccount({
        source: WalletAccount.LEDGER_SRC,
        id: 'ledger_789',
        model: 'nanoS',
        index: 0,
      })

      const enabledWalletAccountsAtom = createInMemoryAtom({
        defaultValue: {
          [ledgerAccount.toString()]: ledgerAccount,
        },
      })

      const atom = availableAssetNamesByWalletAccountAtomDefinition.factory({
        assetsAtom: createInMemoryAtom({ defaultValue: { value: assets } }),
        availableAssetNamesAtom: createInMemoryAtom({
          defaultValue: ['bitcoin', 'dogecoin', 'ethereum', 'litecoin', 'solana', 'stellar'],
        }),
        enabledWalletAccountsAtom,
      })

      const result = await atom.get()

      expect(result[ledgerAccount.toString()]).toContain('bitcoin')
      expect(result[ledgerAccount.toString()]).toContain('ethereum')
      expect(result[ledgerAccount.toString()]).toContain('solana')
    })

    it('should return supported assets for Ledger Nano X', async () => {
      const ledgerXAccount = new WalletAccount({
        source: WalletAccount.LEDGER_SRC,
        id: 'ledger_x_101',
        model: 'nanoX',
        index: 0,
      })

      const enabledWalletAccountsAtom = createInMemoryAtom({
        defaultValue: {
          [ledgerXAccount.toString()]: ledgerXAccount,
        },
      })

      const atom = availableAssetNamesByWalletAccountAtomDefinition.factory({
        assetsAtom: createInMemoryAtom({ defaultValue: { value: assets } }),
        availableAssetNamesAtom: createInMemoryAtom({
          defaultValue: ['bitcoin', 'dogecoin', 'ethereum', 'litecoin', 'solana', 'stellar'],
        }),
        enabledWalletAccountsAtom,
      })

      const result = await atom.get()

      expect(result[ledgerXAccount.toString()]).toContain('bitcoin')
      expect(result[ledgerXAccount.toString()]).toContain('ethereum')
      expect(result[ledgerXAccount.toString()]).toContain('solana')
    })
  })

  describe('Passkeys wallet accounts', () => {
    it('should return assets that support signWithSigner', async () => {
      const passkeyAccount = new WalletAccount({
        source: WalletAccount.PASSKEY_SRC,
        index: 0,
        seedId: 'passkey_seed_123',
      })

      const enabledWalletAccountsAtom = createInMemoryAtom({
        defaultValue: {
          [passkeyAccount.toString()]: passkeyAccount,
        },
      })

      const atom = availableAssetNamesByWalletAccountAtomDefinition.factory({
        assetsAtom: createInMemoryAtom({ defaultValue: { value: assets } }),
        availableAssetNamesAtom: createInMemoryAtom({
          defaultValue: ['bitcoin', 'dogecoin', 'ethereum', 'litecoin', 'solana', 'stellar'],
        }),
        enabledWalletAccountsAtom,
      })

      const result = await atom.get()

      expect(result[passkeyAccount.toString()]).toContain('ethereum')
      expect(result[passkeyAccount.toString()]).toContain('solana')
      expect(result[passkeyAccount.toString()]).toContain('bitcoin')
    })
  })

  describe('Exodus wallet accounts', () => {
    it('should return all available asset names for Exodus accounts', async () => {
      const exodusAccount = new WalletAccount({
        source: WalletAccount.EXODUS_SRC,
        index: 0,
      })

      const availableAssetNames = ['bitcoin', 'ethereum', 'solana', 'litecoin']
      const enabledWalletAccountsAtom = createInMemoryAtom({
        defaultValue: {
          [exodusAccount.toString()]: exodusAccount,
        },
      })

      const atom = availableAssetNamesByWalletAccountAtomDefinition.factory({
        assetsAtom: createInMemoryAtom({ defaultValue: { value: assets } }),
        availableAssetNamesAtom: createInMemoryAtom({
          defaultValue: availableAssetNames,
        }),
        enabledWalletAccountsAtom,
      })

      const result = await atom.get()

      expect(result[exodusAccount.toString()]).toEqual(availableAssetNames)
    })
  })

  describe('Multiple wallet accounts', () => {
    it('should handle multiple wallet accounts of different types', async () => {
      const trezorAccount = new WalletAccount({
        source: WalletAccount.TREZOR_SRC,
        id: 'trezor_multi_1',
        model: 'T',
        index: 0,
      })

      const ledgerAccount = new WalletAccount({
        source: WalletAccount.LEDGER_SRC,
        id: 'ledger_multi_2',
        model: 'nanoS',
        index: 0,
      })

      const passkeyAccount = new WalletAccount({
        source: WalletAccount.PASSKEY_SRC,
        index: 0,
        seedId: 'passkey_multi_seed',
      })

      const exodusAccount = new WalletAccount({
        source: WalletAccount.EXODUS_SRC,
        index: 0,
      })

      const walletAccounts = {
        [trezorAccount.toString()]: trezorAccount,
        [ledgerAccount.toString()]: ledgerAccount,
        [passkeyAccount.toString()]: passkeyAccount,
        [exodusAccount.toString()]: exodusAccount,
      }

      const enabledWalletAccountsAtom = createInMemoryAtom({
        defaultValue: walletAccounts,
      })

      const atom = availableAssetNamesByWalletAccountAtomDefinition.factory({
        assetsAtom: createInMemoryAtom({ defaultValue: { value: assets } }),
        availableAssetNamesAtom: createInMemoryAtom({
          defaultValue: ['bitcoin', 'dogecoin', 'ethereum', 'litecoin', 'solana', 'stellar'],
        }),
        enabledWalletAccountsAtom,
      })

      const result = await atom.get()

      expect(result).toHaveProperty(trezorAccount.toString())
      expect(result).toHaveProperty(ledgerAccount.toString())
      expect(result).toHaveProperty(passkeyAccount.toString())
      expect(result).toHaveProperty(exodusAccount.toString())

      expect(result[exodusAccount.toString()]).toEqual([
        'bitcoin',
        'dogecoin',
        'ethereum',
        'litecoin',
        'solana',
        'stellar',
      ])
    })
  })

  describe('Memoization behavior', () => {
    it('should memoize results for same inputs', async () => {
      const trezorAccount = new WalletAccount({
        source: WalletAccount.TREZOR_SRC,
        id: 'trezor_memo_1',
        model: 'T',
        index: 0,
      })

      const enabledWalletAccountsAtom = createInMemoryAtom({
        defaultValue: {
          [trezorAccount.toString()]: trezorAccount,
        },
      })

      const atom = availableAssetNamesByWalletAccountAtomDefinition.factory({
        assetsAtom: createInMemoryAtom({ defaultValue: { value: assets } }),
        availableAssetNamesAtom: createInMemoryAtom({
          defaultValue: ['bitcoin', 'ethereum'],
        }),
        enabledWalletAccountsAtom,
      })

      const result1 = await atom.get()
      const result2 = await atom.get()

      expect(result1).toEqual(result2)
      expect(result1[trezorAccount.toString()]).toEqual(result2[trezorAccount.toString()])
    })

    it('should update when dependencies change', async () => {
      const exodusAccount = new WalletAccount({
        source: WalletAccount.EXODUS_SRC,
        index: 0,
      })

      const availableAssetNamesAtom = createInMemoryAtom({
        defaultValue: ['bitcoin', 'ethereum', 'litecoin'],
      })

      const enabledWalletAccountsAtom = createInMemoryAtom({
        defaultValue: {
          [exodusAccount.toString()]: exodusAccount,
        },
      })

      const atom = availableAssetNamesByWalletAccountAtomDefinition.factory({
        assetsAtom: createInMemoryAtom({ defaultValue: { value: assets } }),
        availableAssetNamesAtom,
        enabledWalletAccountsAtom,
      })

      const initialResult = await atom.get()
      expect(initialResult[exodusAccount.toString()]).toEqual(['bitcoin', 'ethereum', 'litecoin'])

      await availableAssetNamesAtom.set(['bitcoin', 'ethereum', 'litecoin', 'solana'])
      const updatedResult = await atom.get()

      expect(updatedResult[exodusAccount.toString()]).not.toEqual(
        initialResult[exodusAccount.toString()]
      )
      expect(updatedResult[exodusAccount.toString()]).toEqual([
        'bitcoin',
        'ethereum',
        'litecoin',
        'solana',
      ])
    })
  })

  describe('Edge cases', () => {
    it('should handle empty wallet accounts', async () => {
      const enabledWalletAccountsAtom = createInMemoryAtom({
        defaultValue: {},
      })

      const atom = availableAssetNamesByWalletAccountAtomDefinition.factory({
        assetsAtom: createInMemoryAtom({ defaultValue: { value: assets } }),
        availableAssetNamesAtom: createInMemoryAtom({
          defaultValue: ['bitcoin', 'ethereum'],
        }),
        enabledWalletAccountsAtom,
      })

      const result = await atom.get()
      expect(result).toEqual({})
    })

    it('should handle empty available asset names', async () => {
      const trezorAccount = new WalletAccount({
        source: WalletAccount.TREZOR_SRC,
        id: 'trezor_empty_1',
        model: 'T',
        index: 0,
      })

      const enabledWalletAccountsAtom = createInMemoryAtom({
        defaultValue: {
          [trezorAccount.toString()]: trezorAccount,
        },
      })

      const atom = availableAssetNamesByWalletAccountAtomDefinition.factory({
        assetsAtom: createInMemoryAtom({ defaultValue: { value: assets } }),
        availableAssetNamesAtom: createInMemoryAtom({
          defaultValue: [],
        }),
        enabledWalletAccountsAtom,
      })

      const result = await atom.get()
      expect(result[trezorAccount.toString()]).toEqual([])
    })

    it('should handle undefined model for hardware wallets', async () => {
      const trezorAccount = new WalletAccount({
        source: WalletAccount.TREZOR_SRC,
        id: 'trezor_undefined_1',
        model: undefined as any,
        index: 0,
      })

      const enabledWalletAccountsAtom = createInMemoryAtom({
        defaultValue: {
          [trezorAccount.toString()]: trezorAccount,
        },
      })

      const atom = availableAssetNamesByWalletAccountAtomDefinition.factory({
        assetsAtom: createInMemoryAtom({ defaultValue: { value: assets } }),
        availableAssetNamesAtom: createInMemoryAtom({
          defaultValue: ['bitcoin', 'ethereum'],
        }),
        enabledWalletAccountsAtom,
      })

      const result = await atom.get()
      expect(result[trezorAccount.toString()]).toBeDefined()
    })
  })

  describe('Passkeys with combined assets', () => {
    it('should include combined assets when at least one child supports passkeys', async () => {
      const passkeyAccount = new WalletAccount({
        source: WalletAccount.PASSKEY_SRC,
        index: 0,
        seedId: 'passkey_123',
      })

      const enabledWalletAccountsAtom = createInMemoryAtom({
        defaultValue: {
          [passkeyAccount.toString()]: passkeyAccount,
        },
      })

      const atom = availableAssetNamesByWalletAccountAtomDefinition.factory({
        assetsAtom: createInMemoryAtom({ defaultValue: { value: assets } }),
        availableAssetNamesAtom: createInMemoryAtom({
          defaultValue: [
            'dogecoin',
            'litecoin',
            'solana',
            'stellar',
            'ethereum',
            'usdcoin',
            '_usdcoin',
          ],
        }),
        enabledWalletAccountsAtom,
      })

      const result = await atom.get()
      const passkeyAssets = result[passkeyAccount.toString()]

      expect(passkeyAssets).toContain('dogecoin')
      expect(passkeyAssets).toContain('litecoin')
      expect(passkeyAssets).toContain('solana')
      expect(passkeyAssets).toContain('stellar')
      expect(passkeyAssets).toContain('ethereum')
      expect(passkeyAssets).toContain('usdcoin')
      expect(passkeyAssets).toContain('_usdcoin')
    })

    it('should exclude combined assets when no children support passkeys', async () => {
      const mockAssets: Assets = {
        ...assets,
        testcoin: {
          ...assets.bitcoin!,
          name: 'testcoin',
          baseAsset: {
            ...assets.bitcoin!.baseAsset,
            api: {
              ...assets.bitcoin!.baseAsset.api,
              features: {
                ...assets.bitcoin!.baseAsset.api?.features,
                signWithSigner: false,
              },
            },
          },
        } as any,
        _testcoin: {
          ...assets.bitcoin!,
          name: '_testcoin',
          baseAssetName: 'testcoin',
          isCombined: true,
          combinedAssetNames: ['testcoin'],
          baseAsset: {
            ...assets.bitcoin!.baseAsset,
            api: {
              ...assets.bitcoin!.baseAsset.api,
              features: {
                ...assets.bitcoin!.baseAsset.api?.features,
                signWithSigner: false,
              },
            },
          },
        } as any,
      }

      const passkeyAccount = new WalletAccount({
        source: WalletAccount.PASSKEY_SRC,
        index: 0,
        seedId: 'passkey_456',
      })

      const enabledWalletAccountsAtom = createInMemoryAtom({
        defaultValue: {
          [passkeyAccount.toString()]: passkeyAccount,
        },
      })

      const atom = availableAssetNamesByWalletAccountAtomDefinition.factory({
        assetsAtom: createInMemoryAtom({ defaultValue: { value: mockAssets } }),
        availableAssetNamesAtom: createInMemoryAtom({
          defaultValue: ['testcoin', '_testcoin'],
        }),
        enabledWalletAccountsAtom,
      })

      const result = await atom.get()
      const passkeyAssets = result[passkeyAccount.toString()]

      expect(passkeyAssets).not.toContain('testcoin')
      expect(passkeyAssets).not.toContain('_testcoin')
    })
  })
})
