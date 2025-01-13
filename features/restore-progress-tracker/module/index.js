import ExodusModule from '@exodus/module' // eslint-disable-line import/no-deprecated
import makeConcurrent from 'make-concurrent'
import { pick } from '@exodus/basic-utils'

class RestoreProgressTracker extends ExodusModule {
  #assetsModule
  #baseAssetNamesToMonitorAtom
  #availableAssetNamesAtom
  #restoringAssetsAtom
  #restoreAllStarted
  #assetNamesToNotWait = []
  #assetsWaitingSecondTick = {}

  constructor({
    assetsModule,
    restoringAssetsAtom,
    baseAssetNamesToMonitorAtom,
    availableAssetNamesAtom,
    txLogMonitors,
    logger,
    config,
  }) {
    super({ logger })
    this.#assetsModule = assetsModule
    this.#restoringAssetsAtom = restoringAssetsAtom
    this.#baseAssetNamesToMonitorAtom = baseAssetNamesToMonitorAtom
    this.#availableAssetNamesAtom = availableAssetNamesAtom
    this.#assetNamesToNotWait = new Set(config.assetNamesToNotWait)

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

  restoreAll = async () => {
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
    this.#checkRestoreAllFinished(restoringAssets)
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

  #checkRestoreAllFinished = (restoringAssets) => {
    if (!this.#restoreAllStarted) return

    const restoringAssetsToWait = Object.keys(restoringAssets).filter(
      (assetName) => !this.#assetNamesToNotWait.has(assetName)
    )
    if (restoringAssetsToWait.length === 0) {
      this.emit('restored')
    }
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

  #onRestoredAsset = async ({ assetName: baseAssetName }) => {
    if (
      this.#restoreAllStarted &&
      this.#assetsWaitingSecondTick[baseAssetName] &&
      this.#assetsWaitingSecondTick[baseAssetName] === 'wait'
    ) {
      this.#assetsWaitingSecondTick[baseAssetName] = 'completed'
      return
    }

    const restoringAssets = (await this.#restoringAssetsAtom.get()) || {}

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

    this.#checkRestoreAllFinished(newRestoringAssets)
  }

  clear = async () => {
    await this.#restoringAssetsAtom.set(undefined)
  }
}

const createRestoreProgressTracker = (opts) => new RestoreProgressTracker(opts)

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'restoreProgressTracker',
  type: 'module',
  factory: createRestoreProgressTracker,
  dependencies: [
    'assetsModule',
    'restoringAssetsAtom',
    'baseAssetNamesToMonitorAtom',
    'availableAssetNamesAtom',
    'txLogMonitors',
    'logger',
    'config',
  ],
  public: true,
}
