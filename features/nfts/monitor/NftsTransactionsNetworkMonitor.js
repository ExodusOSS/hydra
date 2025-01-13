import { mapValuesAsync } from '@exodus/basic-utils'
import EventEmitter from 'events/'
import { getNftsAddresses } from './addresses-utils'

class NftsTransactionsNetworkMonitor extends EventEmitter {
  #addressProvider
  #nftsProxy
  #asset
  #network
  #logger

  constructor({ addressProvider, asset, network, nftsProxy, logger }) {
    super()

    this.#addressProvider = addressProvider
    this.#nftsProxy = nftsProxy
    this.#network = network
    this.#asset = asset
    this.#logger = logger
  }

  #fetch = async ({ walletAccounts }) => {
    mapValuesAsync(walletAccounts, async (walletAccount) => {
      const walletAccountName = walletAccount.toString()

      const txs = await this.#getTxsData({ walletAccount })

      if (txs) {
        this.#emitTxs({ walletAccountName, txs })
      }
    })
  }

  #emitTxs = (payload) => {
    this.emit('txs', payload)
  }

  #getTxsData = async ({ walletAccount }) => {
    try {
      const assetName = this.#asset.name
      const nftsProxy = this.#nftsProxy[this.#network]

      const addresses = await getNftsAddresses({
        addressProvider: this.#addressProvider,
        asset: this.#asset,
        walletAccount,
      })

      const txsLists = await Promise.all(
        addresses.map((address) =>
          nftsProxy.getNftsTransactionsByAddress(address.toString()).catch((err) => {
            this.#logger.warn(
              `There has been an error loading ${assetName} nft txs for address ${address}. ${err.message}`,
              err
            )
            return null
          })
        )
      )

      // Network request failed
      if (txsLists.includes(null)) return

      const validTxsLists = txsLists
        .map((txList, index) => {
          const ownerAddress = addresses[index].toString()
          return txList.map((tx) => ({ ...tx, ownerAddress }))
        })
        .filter(Boolean)

      const txs = validTxsLists.flat()

      return (
        (await this.#asset.api.nfts?.postProcessTxs?.({
          txs,
          assetName,
          walletAccount,
          nftsProxy,
        })) || txs
      )
    } catch (err) {
      this.#logger.warn(err.message, err)

      return null
    }
  }

  fetch = async (...args) => {
    try {
      await this.#fetch(...args)
    } catch (err) {
      this.#logger.error(err)
    }
  }
}

export default NftsTransactionsNetworkMonitor
