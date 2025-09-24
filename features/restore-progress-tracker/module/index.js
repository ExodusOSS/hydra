import makeConcurrent from 'make-concurrent'
import { pick } from '@exodus/basic-utils'

class RestoreProgressTracker {
  #assetsModule
  #baseAssetNamesToMonitorAtom
  #availableAssetNamesAtom
  #restoringAssetsAtom
  #restoreAllStarted
  #txLogMonitors
  #assetsWaitingSecondTick = Object.create(null)

  constructor({
    assetsModule,
    restoringAssetsAtom,
    baseAssetNamesToMonitorAtom,
    availableAssetNamesAtom,
    txLogMonitors,
    config,
  }) {
    this.#assetsModule = assetsModule
    this.#restoringAssetsAtom = restoringAssetsAtom
    this.#baseAssetNamesToMonitorAtom = baseAssetNamesToMonitorAtom
    this.#availableAssetNamesAtom = availableAssetNamesAtom
    this.#txLogMonitors = txLogMonitors

    config.monitorEvents.forEach((monitorEvent) =>
      txLogMonitors.on(monitorEvent, this.#concurrentRestoreAssetHandler)
    )
    txLogMonitors.on('unknown-tokens', this.#handleUnknownTokensDuringRestore)
  }

  #concurrentRestoreAssetHandler = makeConcurrent((...args) => this.#onRestoredAsset(...args), {
    concurrency: 1,
  })

  #handleUnknownTokensDuringRestore = ({ baseAssetName }) => {
    if (this.#restoreAllStarted && !this.#assetsWaitingSecondTick[baseAssetName]) {
      this.#assetsWaitingSecondTick[baseAssetName] = 'wait'
    }
  }

  restoreAll = async (shouldRestartMonitors) => {
    this.#restoreAllStarted = false
    this.#assetsWaitingSecondTick = Object.create(null)
    const availableAssets = await this.#getAvailableAssets()
    const availableEnabledBaseAssetNames = await this.#getAvailableEnabledBaseAssetNames()
    const availableEnabledBaseAssetNamesSet = new Set(availableEnabledBaseAssetNames)
    const restoringAssets = Object.fromEntries(
      Object.keys(availableAssets)
        .filter((assetName) => {
          const asset = availableAssets[assetName]
          if (asset.isCombined) return false
          return availableEnabledBaseAssetNamesSet.has(asset.baseAsset.name)
        })
        .map((assetName) => [assetName, true])
    )

    if (Object.keys(restoringAssets).length > 0) {
      await this.#restoringAssetsAtom.set(restoringAssets)
    }

    this.#restoreAllStarted = true
    if (shouldRestartMonitors) {
      this.#txLogMonitors.updateAll()
    }
  }

  restoreAsset = async (assetName) => {
    const restoringAssets = await this.#restoringAssetsAtom.get()
    if (restoringAssets[assetName]) return

    const newRestoringAssets = {
      ...restoringAssets,
      [assetName]: true,
    }
    await this.#restoringAssetsAtom.set(newRestoringAssets)
  }

  #getAvailableAssets = async () => {
    const assets = this.#assetsModule.getAssets()
    const availableAssetNames = await this.#availableAssetNamesAtom.get()
    return pick(assets, availableAssetNames)
  }

  #getAvailableEnabledBaseAssetNames = async () => this.#baseAssetNamesToMonitorAtom.get()

  #getAssetNamesOnSameChain = async (baseAssetName) => {
    const assets = this.#assetsModule.getAssets()
    const availableAssetNames = await this.#availableAssetNamesAtom.get()
    return availableAssetNames.filter((assetName) => {
      const asset = assets[assetName]
      if (!asset) return false
      return !asset.isCombined && asset.baseAsset.name === baseAssetName
    })
  }

  #onRestoredAsset = async ({ assetName: baseAssetName, tickErrors, error }) => {
    if (Boolean(error) || Boolean(tickErrors)) {
      return
    }

    if (
      this.#restoreAllStarted &&
      this.#assetsWaitingSecondTick[baseAssetName] &&
      this.#assetsWaitingSecondTick[baseAssetName] === 'wait'
    ) {
      this.#assetsWaitingSecondTick[baseAssetName] = 'completed'
      return
    }

    const restoringAssets = (await this.#restoringAssetsAtom.get()) || Object.create(null)

    if (Object.keys(restoringAssets).length === 0) return

    const assetNames = await this.#getAssetNamesOnSameChain(baseAssetName)
    const toRemoveRestoringFlag = assetNames.filter((assetName) => restoringAssets[assetName])

    if (toRemoveRestoringFlag.length === 0) return

    const newRestoringAssets = Object.fromEntries(
      Object.entries(restoringAssets).filter(
        ([assetName]) => !toRemoveRestoringFlag.includes(assetName)
      )
    )

    await this.#restoringAssetsAtom.set(newRestoringAssets)
  }

  clear = async () => {
    await this.#restoringAssetsAtom.set(undefined)
  }
}

const createRestoreProgressTracker = (opts) => new RestoreProgressTracker(opts)

const restoreProgressTrackerDefinition = {
  id: 'restoreProgressTracker',
  type: 'module',
  factory: createRestoreProgressTracker,
  dependencies: [
    'assetsModule',
    'restoringAssetsAtom',
    'baseAssetNamesToMonitorAtom',
    'availableAssetNamesAtom',
    'txLogMonitors',
    'config',
  ],
  public: true,
}

export default restoreProgressTrackerDefinition
