import lodash from 'lodash'
import { filterAsync } from '@exodus/basic-utils'
import oldToNewStyleTokenNames from '@exodus/asset-legacy-token-name-mapping'

const { throttle } = lodash

// auto-enable tokens that are available and either built-in assets or verified custom tokens
// do NOT auto-enable assets the user has explicitly disabled
class AutoEnableAssets {
  #assetsModule
  #enabledAssetsModule
  #defaultEnabledAssetNamesAtom
  #defaultEnabledAssetNames = []
  #alwaysAutoEnable
  #enabledAndDisabledAssetsAtom
  #enabledAssetsAtom
  #nonDustBalanceAssetNamesAtom
  #ordersAtom
  #fiatOrdersAtom
  #restoreAtom
  #syncedBalancesAtom
  #availableAssetNamesAtom
  #logger
  #oldToNewStyleTokenNames

  #queuedToEnable = new Set()
  #loaded = false
  #subscriptions = []

  constructor({
    assetsModule,
    enabledAssets,
    defaultEnabledAssetNamesAtom,
    enabledAndDisabledAssetsAtom,
    nonDustBalanceAssetNamesAtom,
    ordersAtom,
    fiatOrdersAtom,
    restoreAtom,
    syncedBalancesAtom,
    enabledAssetsAtom,
    availableAssetNamesAtom,
    config,
    logger,
  }) {
    this.#assetsModule = assetsModule
    this.#enabledAssetsModule = enabledAssets
    this.#defaultEnabledAssetNamesAtom = defaultEnabledAssetNamesAtom
    this.#nonDustBalanceAssetNamesAtom = nonDustBalanceAssetNamesAtom
    this.#ordersAtom = ordersAtom
    this.#fiatOrdersAtom = fiatOrdersAtom
    this.#restoreAtom = restoreAtom
    this.#syncedBalancesAtom = syncedBalancesAtom
    this.#enabledAssetsAtom = enabledAssetsAtom
    this.#availableAssetNamesAtom = availableAssetNamesAtom
    this.#alwaysAutoEnable = config.alwaysAutoEnable ?? true
    this.#oldToNewStyleTokenNames = config.oldToNewStyleTokenNames || oldToNewStyleTokenNames
    this.#enabledAndDisabledAssetsAtom = enabledAndDisabledAssetsAtom
    this.#flush = throttle(this.#flush, config.throttleInterval, { leading: false })
    this.#logger = logger
  }

  onUnlock = async () => {
    if (this.#loaded) {
      return
    }

    this.#loaded = true

    this.#defaultEnabledAssetNames = await this.#defaultEnabledAssetNamesAtom.get()

    const toAutoEnable = await this.#filterAutoEnableable(this.#defaultEnabledAssetNames)
    this.#enqueue(toAutoEnable)
    this.#subscriptions = [
      this.#nonDustBalanceAssetNamesAtom?.observe?.(
        this.#alwaysAutoEnable ? this.#enqueue : this.#maybeAutoEnable
      ),
      this.#ordersAtom?.observe(this.#handleOrders),
      this.#fiatOrdersAtom?.observe(this.#handleFiatOrders),
      this.#syncedBalancesAtom?.observe(this.#handleSyncedBalances),
      this.#enabledAndDisabledAssetsAtom.observe((value) => {
        this.#handleFormerBultInTokens(value)
      }),
    ].filter(Boolean)
  }

  onStop = () => {
    this.#subscriptions.forEach((unsubscribe) => unsubscribe())
    this.#subscriptions = []
  }

  #filterAutoEnableable = async (assetNames) =>
    filterAsync(assetNames, async (assetName) => {
      // user knows best
      if (await this.#enabledAssetsModule.wasChangedByUser(assetName)) return false

      const asset = this.#assetsModule.getAsset(assetName)
      if (!asset) {
        this.#logger.debug(`Can't get asset for assetName=${assetName}`)
        return false
      }

      return !asset.isCombined
    })

  #maybeAutoEnable = async (assetNames) => {
    assetNames = [...new Set(assetNames)]
    const assetNamesToEnable = await this.#filterAutoEnableable(assetNames)

    if (assetNamesToEnable.length === 0) return

    this.#logger.debug(
      `auto-enabling assets that are available and either:
        1. handled from orders, or
        2. handled from synced-balances`,
      assetNamesToEnable
    )

    this.#enqueue(assetNamesToEnable)
  }

  #enqueue = (assetNames) => {
    assetNames.forEach((name) => this.#queuedToEnable.add(name))
    this.#flush()
  }

  #flush = async () => {
    if (this.#queuedToEnable.size === 0) return

    const toEnable = [...this.#queuedToEnable]
    this.#queuedToEnable = new Set()
    await this.#enabledAssetsModule.enable(toEnable)
  }

  // enable assets to make order show up faster
  #handleOrders = async (orderSet) => {
    // Don't enable assets during restore as their balance will be 0 until the monitor picks them up
    const isRestoring = await this.#restoreAtom.get()
    if (isRestoring) return

    const assetNamesToEnable = [...orderSet].flatMap((order) => [order.fromAsset, order.toAsset])

    await this.#maybeAutoEnable(assetNamesToEnable)
  }

  #handleFiatOrders = async (orders) => {
    if (!orders) return

    const assetNamesToEnable = [...orders].map((order) =>
      order.orderType === 'buy' ? order.toAsset : order.fromAsset
    )

    await this.#maybeAutoEnable(assetNamesToEnable)
  }

  #handleFormerBultInTokens = async (value) => {
    // Don't enable assets during restore as their balance will be 0 until the monitor picks them up
    const isRestoring = await this.#restoreAtom.get()
    if (isRestoring) return

    const newTokenNamesToEnable = Object.keys(value.disabled)
      .map((assetName) => {
        const newStyleTokenName = this.#oldToNewStyleTokenNames[assetName]
        const asset = this.#assetsModule.getAsset(assetName)
        const newAsset = this.#assetsModule.getAsset(newStyleTokenName)
        const assetDisabledInConfig = value.disabled[assetName] === true
        const newAssetDisabledInConfig = value.disabled[newStyleTokenName] === true
        return assetDisabledInConfig || newAssetDisabledInConfig || !!asset || !!newAsset
          ? undefined
          : newStyleTokenName
      })
      .filter((assetName) => !!assetName)

    this.#enqueue(newTokenNamesToEnable)
  }

  #handleSyncedBalances = async (byAssetSource) => {
    const isRestoring = await this.#restoreAtom.get()
    if (isRestoring) return

    const enabledAssets = await this.#enabledAssetsAtom.get()
    const availableAssetNames = new Set(await this.#availableAssetNamesAtom.get())
    const notEnabledAssetNamesWithSyncedBalance = new Set()

    Object.values(byAssetSource).forEach((byAssetName) => {
      Object.entries(byAssetName)
        .filter(([assetName]) => !enabledAssets[assetName] && availableAssetNames.has(assetName))
        .forEach(([assetName, balance]) => {
          if (!balance.isZero) {
            notEnabledAssetNamesWithSyncedBalance.add(assetName)
          }
        })
    })

    const notEnabledAssetNamesWithSyncedBalanceList = [...notEnabledAssetNamesWithSyncedBalance]

    this.#maybeAutoEnable(notEnabledAssetNamesWithSyncedBalanceList)
  }
}

const createAutoEnableAssets = (...args) => new AutoEnableAssets(...args)

const autoEnableAssetsPluginDefinition = {
  id: 'autoEnableAssetsPlugin',
  type: 'plugin',
  factory: createAutoEnableAssets,
  dependencies: [
    'assetsModule',
    'enabledAssets',
    'defaultEnabledAssetNamesAtom',
    'enabledAndDisabledAssetsAtom',
    'nonDustBalanceAssetNamesAtom?',
    'ordersAtom?',
    'fiatOrdersAtom?',
    'restoreAtom',
    'syncedBalancesAtom?',
    'enabledAssetsAtom',
    'availableAssetNamesAtom',
    'logger',
    'config',
  ],
  public: true,
}

export default autoEnableAssetsPluginDefinition
