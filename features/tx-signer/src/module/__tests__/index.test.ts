import type { WalletAccount } from '@exodus/models'

import { UnsupportedWalletAccountSource } from '../errors.js'
import transactionSignerDefinition from '../transaction-signer.js'

const mockSeedBasedTransactionSigner = {
  signTransaction: jest.fn(),
}

const mockHardwareWalletDevice = {
  signTransaction: jest.fn(),
}

const mockHardwareWallets = {
  requireDeviceFor: jest.fn(() => mockHardwareWalletDevice),
}

describe('TransactionSigner', () => {
  const transactionSigner = transactionSignerDefinition.factory({
    seedBasedTransactionSigner: mockSeedBasedTransactionSigner,
    hardwareWallets: mockHardwareWallets as never,
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.each([
    ['exodus', mockSeedBasedTransactionSigner],
    ['seed', mockSeedBasedTransactionSigner],
    ['ledger', mockHardwareWalletDevice],
    ['trezor', mockHardwareWalletDevice],
  ])('should call the %s signer', async (source, signer) => {
    const baseAssetName = ''
    const unsignedTx = {
      txData: {},
      txMeta: {},
    }
    const accountIndex = 0
    const walletAccount = {
      source,
      index: accountIndex,
    } as WalletAccount

    await transactionSigner.signTransaction({
      baseAssetName,
      unsignedTx,
      walletAccount,
    })
    expect(signer.signTransaction).toHaveBeenCalledWith({
      baseAssetName,
      unsignedTx,
      walletAccount,
    })
  })

  it('should throw with unknown source ', async () => {
    const baseAssetName = ''
    const unsignedTx = {
      txData: {},
      txMeta: {},
    }
    const accountIndex = 0
    const walletAccount = {
      source: 'unknown',
      index: accountIndex,
    } as WalletAccount

    await expect(
      transactionSigner.signTransaction({
        baseAssetName,
        unsignedTx,
        walletAccount,
      })
    ).rejects.toThrow(UnsupportedWalletAccountSource)
  })
})

describe('TransactionSigner without hardware wallets', () => {
  const transactionSigner = transactionSignerDefinition.factory({
    seedBasedTransactionSigner: mockSeedBasedTransactionSigner,
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.each([['exodus', mockSeedBasedTransactionSigner]])(
    'should call the %s signer',
    async (source, signer) => {
      const baseAssetName = ''
      const unsignedTx = {
        txData: {},
        txMeta: {},
      }
      const accountIndex = 0
      const walletAccount = {
        source,
        index: accountIndex,
      } as WalletAccount

      await transactionSigner.signTransaction({
        baseAssetName,
        unsignedTx,
        walletAccount,
      })
      expect(signer.signTransaction).toHaveBeenCalledWith({
        baseAssetName,
        unsignedTx,
        walletAccount,
      })
    }
  )

  it.each([
    ['ledger', mockHardwareWalletDevice],
    ['trezor', mockHardwareWalletDevice],
  ])('should call the %s wallet', async (source) => {
    const baseAssetName = ''
    const unsignedTx = {
      txData: {},
      txMeta: {},
    }
    const accountIndex = 0
    const walletAccount = {
      source,
      index: accountIndex,
    } as WalletAccount

    await expect(
      transactionSigner.signTransaction({
        baseAssetName,
        unsignedTx,
        walletAccount,
      })
    ).rejects.toThrow(UnsupportedWalletAccountSource)
  })
})
