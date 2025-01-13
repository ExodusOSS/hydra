import messageSignerDefinition from '../message-signer.js'
import { UnsupportedWalletAccountSource } from '../errors.js'
import { WalletAccount } from '@exodus/models'

const mockSeedBasedMessageSigner = {
  signMessage: jest.fn(),
}

const mockHardwareMessageSigner = {
  signMessage: jest.fn(),
}

describe('MessageSigner', () => {
  const messageSigner = messageSignerDefinition.factory({
    seedBasedMessageSigner: mockSeedBasedMessageSigner,
    hardwareMessageSigner: mockHardwareMessageSigner,
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.each([
    ['exodus', mockSeedBasedMessageSigner],
    ['seed', mockSeedBasedMessageSigner],
    ['ledger', mockHardwareMessageSigner],
    ['trezor', mockHardwareMessageSigner],
  ])('should call the %s signer', async (source, signer) => {
    const baseAssetName = ''
    const message = {
      rawMessage: Buffer.from('hello world', 'utf8'),
    }
    const accountIndex = 0
    const walletAccount = {
      source,
      index: accountIndex,
      isSoftware: ['exodus', 'seed'].includes(source),
      isHardware: ['ledger', 'trezor'].includes(source),
    } as WalletAccount

    await messageSigner.signMessage({
      baseAssetName,
      message,
      walletAccount,
    })
    expect(signer.signMessage).toHaveBeenCalledWith({
      baseAssetName,
      message,
      walletAccount,
    })
  })

  it('should throw with unknown source ', async () => {
    const baseAssetName = ''
    const message = ''
    const accountIndex = 0
    const walletAccount = {
      index: accountIndex,
      isSoftware: false,
      isHardware: false,
    } as WalletAccount

    await expect(
      messageSigner.signMessage({
        baseAssetName,
        message: message as never,
        walletAccount,
      })
    ).rejects.toThrow(UnsupportedWalletAccountSource)
  })
})

describe('MessageSigner without hardware wallets', () => {
  const messageSigner = messageSignerDefinition.factory({
    seedBasedMessageSigner: mockSeedBasedMessageSigner,
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.each([['exodus', mockSeedBasedMessageSigner]])(
    'should call the %s signer',
    async (source, signer) => {
      const baseAssetName = ''
      const message = ''
      const accountIndex = 0
      const walletAccount = {
        source,
        index: accountIndex,
        isSoftware: true,
        isHardware: false,
      } as WalletAccount

      await messageSigner.signMessage({
        baseAssetName,
        message: message as never,
        walletAccount,
      })
      expect(signer.signMessage).toHaveBeenCalledWith({
        baseAssetName,
        message,
        walletAccount,
      })
    }
  )

  it.each([['ledger'], ['trezor']])('should call the %s wallet', async (source) => {
    const baseAssetName = ''
    const message = ''
    const accountIndex = 0
    const walletAccount = {
      source,
      index: accountIndex,
      isSoftware: false,
      isHardware: true,
    } as WalletAccount

    await expect(
      messageSigner.signMessage({
        baseAssetName,
        message: message as never,
        walletAccount,
      })
    ).rejects.toThrow(UnsupportedWalletAccountSource)
  })
})
