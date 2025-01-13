import { createInMemoryAtom } from '@exodus/atoms'

import { createHardwareWalletConnectedAssetNamesAtom } from '../index'

describe('createHardwareWalletConnectedAssetNamesAtom', () => {
  // Mock dependencies
  const assetsModule = {
    getAssets: jest.fn().mockReturnValue({
      bitcoin: { name: 'bitcoin', baseAsset: { name: 'bitcoin', bip44: 0x80_00_00_00 } },
      ethereum: { name: 'ethereum', baseAsset: { name: 'ethereum', bip44: 0x80_00_00_3c } },
      litecoin: { name: 'litecoin', baseAsset: { name: 'litecoin', bip44: 0x80_00_00_02 } },
    }),
  }

  const hardwareWalletPublicKeysAtom = createInMemoryAtom({
    defaultValue: {
      'Wallet Account 1': {
        "m/44'/0'/0'": 'publicKey1',
        "m/44'/60'/0'": 'publicKey2',
      },
      'Wallet Account 2': {
        "m/44'/2'/0'": 'publicKey3',
      },
    },
  })

  const walletAccountsAtom = createInMemoryAtom({
    defaultValue: {
      'Wallet Account 1': { name: 'Wallet Account 1', isHardware: true },
      'Wallet Account 2': { name: 'Wallet Account 2', isHardware: true },
      'Wallet Account 3': { name: 'Wallet Account 3', isHardware: false },
    },
  })

  // Call the function
  const result = createHardwareWalletConnectedAssetNamesAtom({
    assetsModule,
    hardwareWalletPublicKeysAtom,
    walletAccountsAtom,
  })

  it('should return an object mapping wallet account names to synced asset names', async () => {
    // Assert the result
    expect(await result.get()).toEqual({
      'Wallet Account 1': ['bitcoin', 'ethereum'],
      'Wallet Account 2': ['litecoin'],
    })
  })

  it('should update if a public key gets added', async () => {
    await hardwareWalletPublicKeysAtom.set({
      ...(await hardwareWalletPublicKeysAtom.get()),
      'Wallet Account 2': {
        "m/44'/2'/0'": 'publicKey3',
        "m/44'/60'/0'": 'publicKey4',
      },
    })
    // Assert the result
    expect(await result.get()).toEqual({
      'Wallet Account 1': ['bitcoin', 'ethereum'],
      'Wallet Account 2': ['ethereum', 'litecoin'],
    })
  })
})
