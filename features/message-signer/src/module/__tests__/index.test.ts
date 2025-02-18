import type { Atom } from '@exodus/atoms'
import { createInMemoryAtom } from '@exodus/atoms'
import { WalletAccount } from '@exodus/models'

import { UnsupportedWalletAccountSource } from '../errors.js'
import type { IMessageSigner } from '../interfaces.js'
import messageSignerDefinition from '../message-signer.js'

const mockSeedBasedMessageSigner = {
  signMessage: jest.fn(),
}

const mockHardwareMessageSigner = {
  signMessage: jest.fn(),
}

const { factory: createMessageSigner } = messageSignerDefinition

describe('MessageSigner', () => {
  let walletAccountsAtom: Atom<{ [name: string]: WalletAccount }>
  let messageSigner: IMessageSigner

  beforeEach(() => {
    jest.clearAllMocks()

    walletAccountsAtom = createInMemoryAtom({ defaultValue: {} })
    messageSigner = createMessageSigner({
      seedBasedMessageSigner: mockSeedBasedMessageSigner,
      hardwareMessageSigner: mockHardwareMessageSigner,
      walletAccountsAtom,
    })
  })

  describe.each([
    ['exodus', mockSeedBasedMessageSigner],
    ['seed', mockSeedBasedMessageSigner],
    ['ledger', mockHardwareMessageSigner],
    ['trezor', mockHardwareMessageSigner],
  ])('%s signer', (source, signer) => {
    const baseAssetName = ''
    const message = {
      rawMessage: Buffer.from('hello world', 'utf8'),
    }
    const accountIndex = 0
    const walletAccount = new WalletAccount({
      source,
      index: accountIndex,
      ...(['ledger', 'trezor'].includes(source) && { id: '123' }),
      ...(['seed'].includes(source) && { seedId: '123' }),
    })

    beforeEach(async () => {
      await walletAccountsAtom.set({ [walletAccount.toString()]: walletAccount })
    })

    test('calls the signer', async () => {
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

    test('passes wallet account instance to signer', async () => {
      await messageSigner.signMessage({
        baseAssetName,
        message,
        walletAccount: walletAccount.toString(),
      })

      expect(signer.signMessage).toHaveBeenCalledWith({
        baseAssetName,
        message,
        walletAccount,
      })
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
  const baseAssetName = ''
  const message = ''
  const accountIndex = 0

  let messageSigner: IMessageSigner
  let walletAccountsAtom: Atom<{ [name: string]: WalletAccount }>

  beforeEach(() => {
    jest.clearAllMocks()

    walletAccountsAtom = createInMemoryAtom({ defaultValue: {} })
    messageSigner = createMessageSigner({
      walletAccountsAtom,
      seedBasedMessageSigner: mockSeedBasedMessageSigner,
    })
  })

  it.each([['exodus', mockSeedBasedMessageSigner]])(
    'should call the %s signer',
    async (source, signer) => {
      const walletAccount = new WalletAccount({
        source,
        index: accountIndex,
      })

      await walletAccountsAtom.set({ [walletAccount.toString()]: walletAccount })

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
    const walletAccount = new WalletAccount({
      source,
      index: accountIndex,
      id: '123',
    })

    await expect(
      messageSigner.signMessage({
        baseAssetName,
        message: message as never,
        walletAccount,
      })
    ).rejects.toThrow(UnsupportedWalletAccountSource)
  })
})
