import type { Definition } from '@exodus/dependency-types'
import type { Tx } from '@exodus/models'
import type { AddressAssetSource, BlockchainMetadata, BlockchainQuery } from '../types.js'

class BlockchainQueryImpl implements BlockchainQuery {
  #blockchainMetadata

  constructor({ blockchainMetadata }: { blockchainMetadata: BlockchainMetadata }) {
    this.#blockchainMetadata = blockchainMetadata
  }

  isUsedRecipientAddress = async ({ walletAccount, assetName, address }: AddressAssetSource) => {
    const txLogs = await this.#blockchainMetadata.getTxLog({
      walletAccount,
      assetName,
    })

    return [...txLogs].some((tx) => isTxSentToAddress({ tx, address }))
  }
}

function isTxSentToAddress({ tx, address }: { tx: Tx; address: string }) {
  if (!tx.sent || tx.selfSend) {
    return false
  }

  let recipientAddressMatches = false
  if (Array.isArray(tx.data?.sent)) {
    recipientAddressMatches = tx.data.sent.some(
      ({ address: sentTxAddress }) => sentTxAddress === address
    )
  } else if (tx.to) {
    recipientAddressMatches = tx.to === address
  }

  return recipientAddressMatches
}

export { BlockchainQueryImpl as BlockchainQuery }

const createBlockchainQuery = (args: { blockchainMetadata: BlockchainMetadata }): BlockchainQuery =>
  new BlockchainQueryImpl({ ...args })

const blockchainQueryModuleDefinition = {
  id: 'blockchainQuery',
  type: 'module',
  factory: createBlockchainQuery,
  dependencies: ['blockchainMetadata'] as const,
} as const satisfies Definition

export default blockchainQueryModuleDefinition
