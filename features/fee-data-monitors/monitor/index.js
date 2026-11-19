import { difference } from '@exodus/basic-utils'
import pDefer from 'p-defer'
import makeConcurrent from 'make-concurrent'

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
  #assetsAtom
  #feeDataAtom
  #unobserveBaseAssetNames
  #baseAssetNamesToMonitorAtom
  #availableAssetNamesAtom
  #logger
  #started = pDefer()
  #remoteFeeData = Object.create(null)
  #remoteConfigAtom
  #unobserveRemoteConfig

  constructor({
    assetsAtom,
    remoteConfigAtom,
    feeDataAtom,
    baseAssetNamesToMonitorAtom,
    availableAssetNamesAtom,
    logger,
  }) {
    this.#assetsAtom = assetsAtom
    this.#feeDataAtom = feeDataAtom
    this.#baseAssetNamesToMonitorAtom = baseAssetNamesToMonitorAtom
    this.#availableAssetNamesAtom = availableAssetNamesAtom
    this.#logger = logger
    this.#remoteConfigAtom = remoteConfigAtom
  }

  #getMonitorAsset = async (assetName) => {
    const assetsAtomValue = await this.#assetsAtom.get()
    const asset = assetsAtomValue.value[assetName]
    const availableAssetNames = new Set(await this.#availableAssetNamesAtom.get())

    return asset?.api?.features?.feeMonitor && availableAssetNames.has(asset.name)
      ? asset
      : undefined
  }

  // Merges remote config over the monitor's fee data. Returns true when the asset's fee changed.
  #applyFee = (assetName, feeData) => {
    const currentFeeData = this.#fees[assetName]
    const newFeeData = currentFeeData.update({
      ...feeData,
      ...this.#remoteFeeData[assetName],
    })
    if (newFeeData === currentFeeData) return false

    this.#fees[assetName] = newFeeData
    return true
  }

  #publishFees = () => this.#feeDataAtom.set({ ...this.#fees })

  #updateRemoteFeeData = makeConcurrent(async (data) => {
    await this.#started.promise

    let changed = false

    for (const baseAssetName in this.#fees) {
      const feeDataJson = data?.assets?.[baseAssetName]?.feeData
      if (!feeDataJson) {
        delete this.#remoteFeeData[baseAssetName]
        continue
      }

      this.#remoteFeeData[baseAssetName] = feeDataJson

      try {
        if (this.#applyFee(baseAssetName, feeDataJson)) changed = true
      } catch (error) {
        // An asset whose payload cannot be applied must not stop the others.
        this.#logger.error(
          `Cannot apply remote fee data for asset ${baseAssetName}. ${error?.message ?? error}`,
          error
        )
      }
    }

    if (changed) void this.#publishFees()
  })

  updateFee = async ({ assetName, feeData }) => {
    if (this.#applyFee(assetName, feeData)) await this.#publishFees()
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
        const assetsAtomValue = await this.#assetsAtom.get()
        const baseAssetName = assetsAtomValue.value[assetName].baseAsset.name
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

  #getBaseAssets = async () => {
    const assetsAtomValue = await this.#assetsAtom.get()
    return Object.values(assetsAtomValue.value).filter(
      (asset) => asset.name === asset.baseAsset.name && typeof asset.api?.getFeeData === 'function'
    )
  }

  #init = async () => {
    if (this.#fees) return

    const baseAssets = await this.#getBaseAssets()
    this.#fees = Object.fromEntries(baseAssets.map((asset) => [asset.name, asset.api.getFeeData()]))

    await this.#publishFees()
  }

  start = async () => {
    this.#unobserveRemoteConfig = this.#remoteConfigAtom.observe(({ config }) =>
      this.#updateRemoteFeeData(config)
    )

    await this.#init()

    this.#unobserveBaseAssetNames?.()

    await new Promise((resolve) => {
      this.#unobserveBaseAssetNames = this.#baseAssetNamesToMonitorAtom.observe(
        (nextAssetNames) => {
          void stopAndStartMonitorsByAssetNames({
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
    this.#started.resolve()
    this.#unobserveRemoteConfig?.()
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
    'assetsAtom',
    'feeDataAtom',
    'remoteConfigAtom',
    'baseAssetNamesToMonitorAtom',
    'availableAssetNamesAtom',
    'logger',
  ],
  public: true,
}

export default feeMonitorsDefinition
