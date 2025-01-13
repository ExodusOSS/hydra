import type { WalletAccount } from '@exodus/models'
import { UnsupportedWalletAccountSource } from './errors.js'

import type { SignMessageParams, IMessageSigner, InternalSigner } from './interfaces.js'
import type { Definition } from '@exodus/dependency-types'

const MODULE_ID = 'messageSigner'

export type Dependencies = {
  seedBasedMessageSigner: InternalSigner
  hardwareMessageSigner?: InternalSigner
}

class MessageSigner implements IMessageSigner {
  readonly #seedBasedMessageSigner
  readonly #hardwareMessageSigner

  constructor({ hardwareMessageSigner, seedBasedMessageSigner }: Dependencies) {
    this.#seedBasedMessageSigner = seedBasedMessageSigner
    this.#hardwareMessageSigner = hardwareMessageSigner
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

  signMessage = async (opts: SignMessageParams) => {
    const { baseAssetName, message, walletAccount, purpose } = opts
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
  dependencies: ['seedBasedMessageSigner', 'hardwareMessageSigner?'],
  public: true,
} as const satisfies Definition

export default messageSignerDefinition
