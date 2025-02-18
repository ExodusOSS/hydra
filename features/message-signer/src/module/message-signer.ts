import type { WalletAccount } from '@exodus/models'
import { UnsupportedWalletAccountSource } from './errors.js'

import type { SignMessageParams, IMessageSigner, InternalSigner } from './interfaces.js'
import type { Definition } from '@exodus/dependency-types'
import type { Atom } from '@exodus/atoms'
import assert from 'minimalistic-assert'

const MODULE_ID = 'messageSigner'

export type Dependencies = {
  seedBasedMessageSigner: InternalSigner
  hardwareMessageSigner?: InternalSigner
  walletAccountsAtom: Atom<{ [name: string]: WalletAccount }>
}

class MessageSigner implements IMessageSigner {
  readonly #seedBasedMessageSigner
  readonly #hardwareMessageSigner
  readonly #walletAccountsAtom

  constructor({ hardwareMessageSigner, seedBasedMessageSigner, walletAccountsAtom }: Dependencies) {
    this.#seedBasedMessageSigner = seedBasedMessageSigner
    this.#hardwareMessageSigner = hardwareMessageSigner
    this.#walletAccountsAtom = walletAccountsAtom
  }

  #getMessageSigner = async (walletAccount: WalletAccount): Promise<InternalSigner> => {
    if (walletAccount.isSoftware) {
      return this.#seedBasedMessageSigner
    }

    if (walletAccount.isHardware && this.#hardwareMessageSigner) {
      return this.#hardwareMessageSigner
    }

    throw new UnsupportedWalletAccountSource(walletAccount.source)
  }

  #normalizeWalletAccount = async (
    walletAccount: WalletAccount | string
  ): Promise<WalletAccount> => {
    if (typeof walletAccount === 'string') {
      const walletAccounts = await this.#walletAccountsAtom.get()
      const instance = walletAccounts[walletAccount]
      assert(instance, `wallet account ${walletAccount} not found`)

      return instance
    }

    return walletAccount
  }

  signMessage = async (opts: SignMessageParams) => {
    const { baseAssetName, message, purpose } = opts
    const walletAccount = await this.#normalizeWalletAccount(opts.walletAccount)

    const signer = await this.#getMessageSigner(walletAccount)
    return signer.signMessage({
      baseAssetName,
      walletAccount,
      purpose,
      message,
    })
  }
}

const createMessageSigner = (opts: Dependencies) => new MessageSigner(opts)

const messageSignerDefinition = {
  id: MODULE_ID,
  type: 'module',
  factory: createMessageSigner,
  dependencies: ['seedBasedMessageSigner', 'hardwareMessageSigner?', 'walletAccountsAtom'],
  public: true,
} as const satisfies Definition

export default messageSignerDefinition
