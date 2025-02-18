import { difference } from '@exodus/basic-utils'
import lodash from 'lodash'
import pDefer from 'p-defer'
import makeConcurrent from 'make-concurrent'

const { get } = lodash

const stopAndStartMonitorsByAssetNames = async ({
  currentAssetNames,
  nextAssetNames,
  stopOne,
  startOne,
}) => {
  await Promise.all(
    currentAssetNames
      .filter((assetName) => !nextAssetNames.includes(assetName))
      .map((assetName) => stopOne(assetName))
  )

  const toStart = difference(nextAssetNames, currentAssetNames)
  await Promise.all(toStart.map((network) => startOne(network)))
}

class FeeMonitors {
  #monitors = new Map()
  #fees
  #assetsModule
  #feeDataAtom
  #unobserveBaseAssetNames
  #baseAssetNamesToMonitorAtom
  #availableAssetNamesAtom
  #logger
  #started = pDefer()
  #remoteFeeData = Object.create(null)

  constructor({
    assetsModule,
    remoteConfig,
    feeDataAtom,
    baseAssetNamesToMonitorAtom,
    availableAssetNamesAtom,
    logger,
  }) {
    this.#assetsModule = assetsModule
    this.#feeDataAtom = feeDataAtom
    this.#baseAssetNamesToMonitorAtom = baseAssetNamesToMonitorAtom
    this.#availableAssetNamesAtom = availableAssetNamesAtom
    this.#logger = logger

    remoteConfig.on('sync', ({ current }) => this.#updateRemoteFeeData(current))
  }

  #getMonitorAsset = async (assetName) => {
    const asset = this.#assetsModule.getAsset(assetName)
    const availableAssetNames = new Set(await this.#availableAssetNamesAtom.get())

    return asset?.api?.features?.feeMonitor && availableAssetNames.has(asset.name)
      ? asset
      : undefined
  }

  #updateRemoteFeeData = makeConcurrent(async (data) => {
    await this.#started.promise

    for (const baseAssetName in this.#fees) {
      const feeDataJson = get(data, ['assets', baseAssetName, 'feeData'])
      if (!feeDataJson) {
        delete this.#remoteFeeData[baseAssetName]
        continue
      }

      this.#remoteFeeData[baseAssetName] = feeDataJson
      this.updateFee({ assetName: baseAssetName, feeData: feeDataJson })
    }
  })

  updateFee = async ({ assetName, feeData }) => {
    const currentFeeData = this.#fees[assetName]
    const newFeeData = currentFeeData.update({
      ...feeData,
      ...this.#remoteFeeData[assetName],
    })
    if (newFeeData === currentFeeData) return

    this.#fees[assetName] = newFeeData

    await this.#feeDataAtom.set((prevValue) => ({ ...prevValue, [assetName]: newFeeData }))
  }

  getFeeData = async ({ assetName }) => {
    return this.#fees?.[assetName]
  }

  #stopOne = async (assetName) => {
    const monitor = this.#monitors.get(assetName)

    if (!monitor) return

    await monitor.stop()
    this.#monitors.delete(assetName)
  }

  #startOne = async (assetName) => {
    try {
      if (this.#monitors.has(assetName)) return

      const asset = await this.#getMonitorAsset(assetName)

      if (!asset) return

      const updateMonitorFeeData = async (assetName, feeData) => {
        const baseAssetName = this.#assetsModule.getAsset(assetName).baseAsset.name
        return this.updateFee({ assetName: baseAssetName, feeData })
      }

      const monitor = asset.api.createFeeMonitor({ updateFee: updateMonitorFeeData })
      // FeeMonitor works like redux-thunk actions, but they don't seem to require it.
      // Using dummy values as it's running in background without Redux available.
      // Remove double ()() from asset-lib!
      await monitor.start()()

      this.#monitors.set(assetName, monitor)
    } catch (e) {
      this.#logger.error(`Cannot start fee monitor for asset ${assetName}. ${e.message}`, e)
    }
  }

  #getBaseAssets = () => {
    return Object.values(this.#assetsModule.getAssets()).filter(
      (asset) => asset.name === asset.baseAsset.name && typeof asset.api?.getFeeData === 'function'
    )
  }

  #init = async () => {
    if (this.#fees) return

    this.#fees = Object.fromEntries(
      this.#getBaseAssets().map((asset) => [asset.name, asset.api.getFeeData()])
    )

    await this.#feeDataAtom.set(this.#fees)
  }

  start = async () => {
    await this.#init()

    this.#unobserveBaseAssetNames?.()

    await new Promise((resolve) => {
      this.#unobserveBaseAssetNames = this.#baseAssetNamesToMonitorAtom.observe(
        (nextAssetNames) => {
          stopAndStartMonitorsByAssetNames({
            startOne: this.#startOne,
            stopOne: this.#stopOne,
            currentAssetNames: [...this.#monitors.keys()],
            nextAssetNames,
          }).then(resolve)
        }
      )
    })

    this.#started.resolve()
  }

  stop = () => {
    this.#unobserveBaseAssetNames?.()
    ;[...this.#monitors.keys()].forEach(this.#stopOne)
  }
}

const createFeeMonitors = (args = Object.create(null)) => new FeeMonitors(args)

const feeMonitorsDefinition = {
  id: 'feeMonitors',
  type: 'monitor',
  factory: createFeeMonitors,
  dependencies: [
    'assetsModule',
    'feeDataAtom',
    'remoteConfig',
    'baseAssetNamesToMonitorAtom',
    'availableAssetNamesAtom',
    'logger',
  ],
  public: true,
}

export default feeMonitorsDefinition
