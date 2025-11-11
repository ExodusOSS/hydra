import { WalletAccount } from '@exodus/models'
import { LEDGER_SRC } from '@exodus/models/lib/wallet-account'

import hardwareSignerDefinition from '../hardware-signer.js'

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
  },
}

const assetsModule = {
  getAsset: (assetName: keyof typeof assets) => assets[assetName],
}

const mockHardwareDevice = {
  signMessage: jest.fn(),
}

const mockHardwareWallets = {
  requireDeviceFor: () => mockHardwareDevice,
}

const setup = () => {
  const hardwareMessageSigner = hardwareSignerDefinition.factory({
    assetsModule: assetsModule as never,
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
    const walletAccount = new WalletAccount({ index: 1, source: LEDGER_SRC, id: 'something' })
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
