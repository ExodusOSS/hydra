import pDefer from 'p-defer'
import lodash from 'lodash'

import { FUSION_CHANNEL_CONFIG, MODULE_ID } from './constants.js'
import { getConfigBySchema } from './utils.js'

const { cloneDeep } = lodash

/**
 * @class
 * @param {object}      deps
 * @param {object}      deps.fusion
 * @param {object}      deps.nftsConfigAtom
 * @param {object}      deps.nftsOptimisticAtom
 * @param {object}      deps.logger
 */
class Nfts {
  #channel
  #fusion
  #nftsConfigAtom
  #nftsOptimisticAtom
  #clearOptimisticNftTimers = new Map()
  #loaded = pDefer()
  #logger

  constructor({ fusion, nftsConfigAtom, nftsOptimisticAtom, logger }) {
    this.#fusion = fusion
    this.#nftsConfigAtom = nftsConfigAtom
    this.#nftsOptimisticAtom = nftsOptimisticAtom
    this.#logger = logger
  }

  load = async () => {
    if (this.#loaded.started) {
      return this.#loaded.promise
    }

    this.#loaded.started = true

    this.#channel = await this.#fusion.channel({
      ...FUSION_CHANNEL_CONFIG,
      processOne: this.#processOne,
    })
    await this.#channel.awaitProcessed()
    this.#loaded.resolve()
  }

  /**
   * Update or add a set of config for a list of NFTs.
   * @async
   * @param {Array} nftConfigs
   */
  upsertConfigs = async (nftConfigs) => {
    const nftsConfigData = await this.#nftsConfigAtom.get()

    const newNftsConfig = nftConfigs.reduce((acc, nftConfig) => {
      const nftConfigCleaned = getConfigBySchema(nftConfig)

      if (!nftConfigCleaned) {
        return acc
      }

      return { ...acc, ...nftConfigCleaned }
    }, nftsConfigData)

    await this.#nftsConfigAtom.set(newNftsConfig)
    await this.#syncUpToFusion(newNftsConfig)
  }

  /**
   * Update or add a new config for an NFT.
   * @async
   * @param {object} nftConfig
   */
  upsertConfig = async (nftConfig) => {
    if (!getConfigBySchema(nftConfig)) {
      throw new Error('The NFT Config object do not have a proper schema')
    }

    return this.upsertConfigs([nftConfig])
  }

  #getChannel = async () => {
    await this.#channel.awaitProcessed()
    return this.#channel
  }

  #processOne = async ({ data }) => {
    const nftsConfigData = await this.#nftsConfigAtom.get()
    const mergedData = { ...nftsConfigData, ...data }

    await this.#nftsConfigAtom.set(mergedData)

    this.#logger.debug('NFTs config updated from fusion')
  }

  #syncUpToFusion = async (nftsConfig) => {
    const channel = await this.#getChannel()

    await channel.push({
      type: FUSION_CHANNEL_CONFIG.type,
      data: nftsConfig,
    })

    this.#logger.debug('NftsConfig synced with fusion')
  }

  clear = async () => {
    this.#clearOptimisticNftTimers.forEach((id) => clearTimeout(id))
    this.#clearOptimisticNftTimers = new Map()

    await Promise.all([
      this.#nftsConfigAtom.set(undefined),
      this.#nftsOptimisticAtom.set(Object.create(null)),
    ])
  }

  #clearOptimisticNft = async ({ id, network, walletAccount }) => {
    this.#nftsOptimisticAtom.set((prevState) => {
      const newState = cloneDeep(prevState)
      delete newState?.[walletAccount]?.[network]?.[id]
      if (Object.keys(newState?.[walletAccount]?.[network]).length === 0) {
        delete newState?.[walletAccount]?.[network]
        if (Object.keys(newState?.[walletAccount]).length === 0) {
          delete newState?.[walletAccount]
        }
      }

      return newState
    })
  }

  setOptimisticNft = async ({ id, network, walletAccount }, payload) => {
    const prevTimer = this.#clearOptimisticNftTimers.get(id)
    if (prevTimer) {
      clearTimeout(prevTimer)
      this.#clearOptimisticNftTimers.delete(id)
    }

    await this.#nftsOptimisticAtom.set((prevState) => {
      return {
        ...prevState,
        [walletAccount]: {
          ...prevState[walletAccount],
          [network]: {
            ...prevState[walletAccount]?.[network],
            [id]: payload,
          },
        },
      }
    })

    if (payload.expiresAt) {
      const delay = payload.expiresAt - Date.now()
      const timer = setTimeout(
        () => this.#clearOptimisticNft({ id, network, walletAccount }),
        delay
      )
      this.#clearOptimisticNftTimers.set(id, timer)
    }
  }
}

const createNfts = (opts) => new Nfts(opts)

const nftsModuleDefinition = {
  id: MODULE_ID,
  type: 'module',
  factory: createNfts,
  dependencies: ['nftsConfigAtom', 'fusion', 'logger', 'nftsOptimisticAtom'],
  public: true,
}

export default nftsModuleDefinition
