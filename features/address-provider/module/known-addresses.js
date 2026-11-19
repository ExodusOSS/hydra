import typeforce from '@exodus/typeforce'
import { TxSet, WalletAccount } from '@exodus/models'
import { getAddressesFromTxLog } from './utils.js'
import { flattenToPaths } from '@exodus/basic-utils'

const getCacheKey = ({ walletAccount, assetName }) => `${walletAccount}|${assetName}`

class KnownAddresses {
  #txLogsAtom
  #assetsAtom
  #cache = new Map()
  #unsubscribe

  constructor({ txLogsAtom, assetsAtom }) {
    this.#txLogsAtom = txLogsAtom
    this.#assetsAtom = assetsAtom
  }

  #getTxLog = async ({ walletAccount, assetName }) => {
    const { value } = await this.#txLogsAtom.get()
    return value[walletAccount]?.[assetName] ?? TxSet.EMPTY
  }

  start = () => {
    const invalidateCache = (txsByAssetSource) => {
      flattenToPaths(txsByAssetSource).forEach(([walletAccount, assetName]) => {
        this.#cache.delete(getCacheKey({ walletAccount, assetName }))
      })
    }

    this.#unsubscribe = this.#txLogsAtom.observe(({ changes }) => invalidateCache(changes))
  }

  #getAsset = async (assetName) => {
    const { value: assets } = await this.#assetsAtom.get()
    return assets[assetName]
  }

  #cached = (fn) => async (opts) => {
    const { walletAccount, assetName } = opts
    const key = getCacheKey({ walletAccount, assetName })

    const cached = this.#cache.get(key)
    if (cached) return cached

    const result = await fn(opts)
    this.#cache.set(key, result)
    return result
  }

  get = this.#cached(async (opts) => {
    typeforce(
      {
        walletAccount: (value) => value instanceof WalletAccount,
        assetName: 'String',
      },
      opts,
      true
    )

    const { walletAccount, assetName } = opts

    const txLog = await this.#getTxLog({
      assetName,
      walletAccount: walletAccount.toString(),
    })

    const asset = await this.#getAsset(assetName)
    return getAddressesFromTxLog({ asset, txLog, walletAccount })
  })

  stop = () => {
    this.#unsubscribe?.()
  }
}

const knownAddressesDefinition = {
  id: 'knownAddresses',
  type: 'module',
  factory: (deps) => new KnownAddresses(deps),
  dependencies: ['assetsAtom', 'txLogsAtom'],
  public: true,
}

export default knownAddressesDefinition
