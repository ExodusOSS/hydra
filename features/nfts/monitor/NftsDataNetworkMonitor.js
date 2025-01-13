import { mapValuesAsync } from '@exodus/basic-utils'
import EventEmitter from 'events/'
import { getNftsAddresses } from './addresses-utils'
import { handleNftsOnImport } from './utils'

const sortByTitle = (nfts) => nfts.sort((a, b) => a.collectionName?.localeCompare(b.collectionName))

class NftsDataNetworkMonitor extends EventEmitter {
  #asset
  #network
  #addressProvider
  #nftsProxy
  #nftsModule
  #nftsConfigAtom
  #logger
  #config

  #handleImportOnNextFetch = false

  constructor({
    logger,
    asset,
    network,
    config,
    handleImportOnStart,
    addressProvider,
    nftsProxy,
    nftsModule,
    nftsConfigAtom,
  }) {
    super()
    this.#asset = asset
    this.#network = network
    this.#addressProvider = addressProvider
    this.#nftsProxy = nftsProxy
    this.#nftsModule = nftsModule
    this.#nftsConfigAtom = nftsConfigAtom
    this.#logger = logger
    this.#config = config
    this.#handleImportOnNextFetch = handleImportOnStart
  }

  fetch = async (...args) => {
    try {
      await this.#fetch(...args)
    } catch (err) {
      this.#logger.error(err)
    }
  }

  #getData = async ({ walletAccount, network }) => {
    const assetName = this.#asset.name
    const nftsProxy = this.#nftsProxy[network]

    try {
      const addresses = await getNftsAddresses({
        addressProvider: this.#addressProvider,
        asset: this.#asset,
        walletAccount,
      })

      const fetchParams = {
        includeListed: this.#config?.includeListedNfts,
        includeSpam: this.#config?.includeSpamNfts,
        addVerifiedStatus: this.#config?.fetchNftVerifiedStatus,
        includeCompressedOnSolana: this.#config?.includeCompressedOnSolana,
        includeT22OnSolana: this.#config?.includeT22OnSolana,
      }

      const nftsLists = await Promise.all(
        addresses.map((address) =>
          nftsProxy.getNftsByOwner(address.toString(), fetchParams).catch((err) => {
            this.#logger.warn(
              `There has been an error loading ${assetName} nfts for address ${address}. ${err.message}`,
              err
            )
            return null
          })
        )
      )

      // Network request failed
      if (nftsLists.includes(null)) return

      const validNftsLists = nftsLists.map((nftList, index) => {
        const ownerAddress = addresses[index].toString()
        return Array.isArray(nftList) && nftList.map((nft) => ({ ...nft, ownerAddress }))
      })

      const nfts = validNftsLists.filter(Boolean).flat()

      const sortedNfts = sortByTitle(nfts)

      return (
        (await this.#asset.api.nfts?.postProcessNfts?.({
          nfts: sortedNfts,
          assetName,
          walletAccount,
          nftsProxy,
        })) || sortedNfts
      )
    } catch (err) {
      this.#logger.warn(err.message, err)
      return null
    }
  }

  #handleNftsOnImport = async ({ nfts }) => {
    return handleNftsOnImport(
      { nfts },
      { config: this.#config, nftsConfigAtom: this.#nftsConfigAtom, nftsModule: this.#nftsModule }
    )
  }

  #fetch = async ({ walletAccounts }) => {
    const network = this.#network

    mapValuesAsync(walletAccounts, async (walletAccount) => {
      const walletAccountName = walletAccount.toString()
      const nfts = await this.#getData({ walletAccount, walletAccountName, network })

      if (nfts) {
        if (this.#handleImportOnNextFetch) {
          try {
            await this.#handleNftsOnImport({ nfts })
          } catch (err) {
            this.#logger.warn('failed to auto-approve nfts', network, err.message)
          }
        }

        this.emit('nfts', { walletAccountName, nfts })
      }
    }).then(() => {
      this.#handleImportOnNextFetch = false
    })
  }
}

export default NftsDataNetworkMonitor
