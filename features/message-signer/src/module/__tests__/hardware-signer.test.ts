import { createInMemoryAtom } from '@exodus/atoms'
import { WalletAccount } from '@exodus/models'

import hardwareSignerDefinition from '../hardware-signer.js'
import type { Asset } from '../interfaces.js'

const assets = {
  ethereum: {
    api: {
      defaultAddressPath: 'm/0/0',
      getKeyIdentifier: ({ accountIndex, chainIndex, addressIndex }: any) => ({
        derivationAlgorithm: 'BIP32',
        derivationPath: `m/44'/0'/${accountIndex}'/${chainIndex}/${addressIndex}`,
        keyType: 'secp256k1',
      }),
      signMessage: jest.fn(),
    },
    get baseAsset() {
      return assets.ethereum
    },
  } as unknown as Asset,
}

const assetsAtom = createInMemoryAtom({ defaultValue: { value: assets } })

const mockHardwareDevice = {
  signMessage: jest.fn(),
}

const mockHardwareWallets = {
  requireDeviceFor: () => mockHardwareDevice,
}

const setup = () => {
  const hardwareMessageSigner = hardwareSignerDefinition.factory({
    assetsAtom,
    hardwareWallets: mockHardwareWallets as never,
    assetSources: {
      getSupportedPurposes: async () => [44],
    },
  })

  return {
    hardwareMessageSigner,
  }
}

describe('HardwareMessageSigner', () => {
  it('sign a message with the default address', async () => {
    const { hardwareMessageSigner } = setup()
    const walletAccount = new WalletAccount({
      index: 1,
      source: WalletAccount.LEDGER_SRC,
      id: 'something',
    })
    const expectedResult = Buffer.alloc(32)
    mockHardwareDevice.signMessage.mockReturnValueOnce(expectedResult)
    const signedMessage = await hardwareMessageSigner.signMessage({
      baseAssetName: 'ethereum',
      walletAccount,
      message: {
        rawMessage: Buffer.from('hello world', 'utf8'),
      },
    })
    expect(mockHardwareDevice.signMessage).toHaveBeenCalledWith({
      assetName: 'ethereum',
      derivationPath: `m/44'/0'/1'/0/0`,
      message: {
        rawMessage: Buffer.from('hello world', 'utf8'),
      },
    })
    expect(signedMessage).toBe(expectedResult)
  })
})
