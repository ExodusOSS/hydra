export class BlockchainQuery {
  #blockchainMetadata

  constructor({ blockchainMetadata }) {
    this.#blockchainMetadata = blockchainMetadata
  }

  isUsedRecipientAddress = async ({ walletAccount, assetName, address }) => {
    const txLogs = await this.#blockchainMetadata.getTxLog({
      walletAccount,
      assetName,
    })

    return [...txLogs].some((tx) => isTxSentToAddress({ tx, address }))
  }
}

function isTxSentToAddress({ tx, address }) {
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

const createBlockchainQuery = (args) => new BlockchainQuery({ ...args })

const blockchainQueryModuleDefinition = {
  id: 'blockchainQuery',
  type: 'module',
  factory: createBlockchainQuery,
  dependencies: ['blockchainMetadata'],
}

export default blockchainQueryModuleDefinition
