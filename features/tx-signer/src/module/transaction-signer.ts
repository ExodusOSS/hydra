import assert from 'minimalistic-assert'
import type { WalletAccount } from '@exodus/models'
import { UnsupportedWalletAccountSource } from './errors.js'

import type {
  SignTransactionParams,
  ITransactionSigner,
  HardwareSignerProvider,
  InternalSigner,
} from './interfaces.js'
import type { Definition } from '@exodus/dependency-types'

const MODULE_ID = 'transactionSigner'

export type Dependencies = {
  hardwareWallets?: HardwareSignerProvider
  seedBasedTransactionSigner: InternalSigner
}

class TransactionSigner implements ITransactionSigner {
  readonly #seedBasedTransactionSigner
  readonly #hardwareWallets

  constructor({ hardwareWallets, seedBasedTransactionSigner }: Dependencies) {
    this.#seedBasedTransactionSigner = seedBasedTransactionSigner
    this.#hardwareWallets = hardwareWallets
  }

  #getTransactionSigner = async (walletAccount: WalletAccount): Promise<InternalSigner> => {
    if (walletAccount.isSoftware) {
      return this.#seedBasedTransactionSigner
    }

    if (walletAccount.isHardware && this.#hardwareWallets) {
      return this.#hardwareWallets.requireDeviceFor(walletAccount)
    }

    throw new UnsupportedWalletAccountSource(walletAccount.source)
  }

  signTransaction = async (opts: SignTransactionParams) => {
    assert(typeof opts === 'object', `signTransaction expected parameters`)
    const { baseAssetName, unsignedTx, walletAccount } = opts
    assert(typeof baseAssetName === 'string', `baseAssetName must be string`)
    assert(typeof unsignedTx === 'object', `unsignedTx must be object`)
    const { txData, txMeta } = unsignedTx
    assert(typeof txData === 'object' && txData !== null, `txData must be object`)
    assert(typeof txMeta === 'object' && txMeta !== null, `txMeta must be object`)
    const signer = await this.#getTransactionSigner(walletAccount)
    return signer.signTransaction({
      baseAssetName,
      unsignedTx,
      walletAccount,
    })
  }
}

const createTransactionSigner = (opts: Dependencies) => new TransactionSigner(opts)

const transactionSignerDefinition = {
  id: MODULE_ID,
  type: 'module',
  factory: createTransactionSigner,
  dependencies: ['seedBasedTransactionSigner', 'hardwareWallets?'],
  public: true,
} as const satisfies Definition

export default transactionSignerDefinition
