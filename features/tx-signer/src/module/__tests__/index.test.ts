import { WalletAccount } from '@exodus/models'
import type { WalletAccountSource } from '@exodus/models/lib/wallet-account'

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
    [
      new WalletAccount({
        source: 'exodus',
        index: 0,
      }),
      mockSeedBasedTransactionSigner,
    ],
    [
      new WalletAccount({
        source: 'seed',
        index: 0,
        seedId: 'some',
      }),
      mockSeedBasedTransactionSigner,
    ],
    [
      new WalletAccount({
        source: 'ledger',
        index: 0,
        id: 'ledger',
      }),
      mockHardwareWalletDevice,
    ],
    [
      new WalletAccount({
        source: 'trezor',
        index: 0,
        id: 'trezor',
      }),
      mockHardwareWalletDevice,
    ],
  ])('should call the %s signer', async (walletAccount, signer) => {
    const baseAssetName = ''
    const unsignedTx = {
      txData: {},
      txMeta: {},
    }

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
    const walletAccount = new WalletAccount({
      source: 'unknown' as WalletAccountSource,
      index: accountIndex,
      id: 'unknown',
      color: '#FFF',
      icon: 'some',
    })

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

  it.each([['exodus' as WalletAccountSource, mockSeedBasedTransactionSigner]])(
    'should call the %s signer',
    async (source, signer) => {
      const baseAssetName = ''
      const unsignedTx = {
        txData: {},
        txMeta: {},
      }
      const accountIndex = 0
      const walletAccount = new WalletAccount({
        source,
        index: accountIndex,
      })

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
    ['ledger' as WalletAccountSource, mockHardwareWalletDevice],
    ['trezor' as WalletAccountSource, mockHardwareWalletDevice],
  ])('should call the %s wallet', async (source) => {
    const baseAssetName = ''
    const unsignedTx = {
      txData: {},
      txMeta: {},
    }
    const accountIndex = 0
    const walletAccount = new WalletAccount({
      id: source,
      source,
      index: accountIndex,
    })
    await expect(
      transactionSigner.signTransaction({
        baseAssetName,
        unsignedTx,
        walletAccount,
      })
    ).rejects.toThrow(UnsupportedWalletAccountSource)
  })
})
