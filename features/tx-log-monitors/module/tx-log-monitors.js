import { createLimiter } from '@exodus/asset-lib'
import { difference, intersection } from '@exodus/basic-utils'
import EventEmitter from 'events/events.js'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

const { isEqual } = lodash

const TX_LOG_TICK_CONCURRENCY = 5

class Monitors extends EventEmitter {
  #serverConfigs = new Map()
  #monitors = new Map()
  #assetsAtom
  // deprecated: please use for `createHistoryMonitor` and NOTHING ELSE! The asset factory should supply ACI to the monitor.
  #assetClientInterface
  #assetsConfigAtom
  #txLogLimiterRunner
  #baseAssetNamesToMonitorAtom
  #logger
  #subscriptions = []
  #txLogTickConcurrency
  #yieldToUI
  #orderedFirst
  #orderedLast
  #queuedRefresh

  constructor({
    assetsAtom,
    assetClientInterface,
    assetsConfigAtom,
    baseAssetNamesToMonitorAtom,
    logger,
    yieldToUI = async () => {},
    config = Object.create(null),
  }) {
    super()

    this.#logger = logger
    this.#assetsAtom = assetsAtom
    this.#assetClientInterface = assetClientInterface
    this.#assetsConfigAtom = assetsConfigAtom
    this.#baseAssetNamesToMonitorAtom = baseAssetNamesToMonitorAtom
    this.#txLogTickConcurrency = config.txLogTickConcurrency || TX_LOG_TICK_CONCURRENCY
    this.#yieldToUI = yieldToUI
    this.#orderedFirst = config.orderedFirst || []
    this.#orderedLast = config.orderedLast || []
    this.#queuedRefresh = new Set([])

    // Shared limiter for all monitors and all blockchain, up to 5 monitors' ticks can be done in parallel.
    // concurrency could be config driven
    const concurrencyLimiterLogger = {
      trace: (...args) => logger.trace('[exodus:limit-concurrency:trace]', ...args),
      log: (...args) => logger.log('[exodus:limit-concurrency]', ...args),
      info: (...args) => logger.info('[exodus:limit-concurrency:info]', ...args),
      warn: (...args) => logger.warn('[exodus:limit-concurrency:warn]', ...args),
      error: (...args) => logger.error('[exodus:limit-concurrency:error]', ...args),
      debug: () => null, // silent
    }
    this.#txLogLimiterRunner = createLimiter({
      name: 'tx-log monitor tick',
      concurrency: this.#txLogTickConcurrency,
      logger: concurrencyLimiterLogger,
    })
  }

  #initMonitor = async ({ assetName }) => {
    const assetsConfig = await this.#assetsConfigAtom.get()
    this.#setServer({ assetName, config: assetsConfig[assetName] })
  }

  #updateMonitors = (assetsConfig) => {
    for (const [assetName, config] of Object.entries(assetsConfig)) {
      this.#setServer({ assetName, config })
    }
  }

  #setServer = ({ assetName, config }) => {
    if (!assetName || !config) return

    const monitor = this.#monitors.get(assetName)
    if (!monitor || !monitor.setServer) return

    const currentConfig = this.#serverConfigs.get(assetName)

    if (currentConfig && isEqual(config, currentConfig)) return

    monitor.setServer(config)

    this.#serverConfigs.set(assetName, config)
  }

  update = async (opts) => {
    const { assetName, refresh } = opts
    const monitor = this.#monitors.get(assetName)

    if (monitor) {
      return monitor.update(opts)
    }

    if (refresh) {
      this.#queuedRefresh.add(assetName)
    }
  }

  updateAll = async () => {
    const baseAssetNames = await this.#baseAssetNamesToMonitorAtom.get()
    return Promise.all(baseAssetNames.map((assetName) => this.update({ assetName })))
  }

  #stopOne = async (assetName) => {
    const monitor = this.#monitors.get(assetName)

    if (!monitor) return

    await monitor.stop()
    this.#monitors.delete(assetName)
  }

  #getMonitorAsset = async (assetName) => {
    const { value: assets } = await this.#assetsAtom.get()
    const asset = assets[assetName]
    if (!asset) return

    return asset.api?.createHistoryMonitor ? asset : undefined
  }

  #startOne = async (assetName) => {
    const asset = await this.#getMonitorAsset(assetName)

    if (this.#monitors.has(assetName) || !asset) return

    const assetMonitorLogger = {
      trace: (...args) => this.#logger.trace(`[exodus:${assetName}_txLogMonitor:trace]`, ...args),
      log: (...args) => this.#logger.log(`[exodus:${assetName}_txLogMonitor]`, ...args),
      info: (...args) => this.#logger.info(`[exodus:${assetName}_txLogMonitor:info]`, ...args),
      warn: (...args) => this.#logger.warn(`[exodus:${assetName}_txLogMonitor:warn]`, ...args),
      error: (...args) => this.#logger.error(`[exodus:${assetName}_txLogMonitor:error]`, ...args),
      debug: (...args) => this.#logger.debug(`[exodus:${assetName}_txLogMonitor:debug]`, ...args),
    }

    const monitor = asset.api.createHistoryMonitor({
      asset,
      assetClientInterface: this.#assetClientInterface, // @deprecated: all assets supply ACI themselves, so this is ignored
      runner: this.#txLogLimiterRunner,
      yieldToUI: this.#yieldToUI,
      logger: assetMonitorLogger,
    })

    // This is supposed to initialize the monitor, however this hook will be pushed
    // after 'before-start' hooks pushed by the monitor's constructor.
    monitor.addHook('before-start', ({ monitor }) => this.#initMonitor({ assetName, monitor }))

    if (monitor.on) {
      monitor.on('unknown-tokens', (assetIds) => {
        this.emit('unknown-tokens', { baseAssetName: assetName, assetIds })
      })

      if (monitor.hooks) {
        Object.keys(monitor.hooks).forEach((eventName) =>
          monitor.on(eventName, (params) => this.emit(eventName, { assetName, params }))
        )
      }
    }

    this.#monitors.set(assetName, monitor)

    const refresh = this.#queuedRefresh.delete(assetName)

    return monitor.start({ assetName, refresh })
  }

  #unsubscribe = () => {
    this.#subscriptions.forEach((unsubscribe) => unsubscribe())
    this.#subscriptions = []
  }

  stop = async () => {
    this.#unsubscribe()
    await Promise.all([...this.#monitors.keys()].map(this.#stopOne))
  }

  start = async () => {
    this.#unsubscribe()
    this.#subscriptions.push(this.#assetsConfigAtom.observe(this.#updateMonitors))

    await new Promise((resolve) => {
      this.#subscriptions.push(
        this.#baseAssetNamesToMonitorAtom.observe(async (nextAssetNames) => {
          const { value: assets } = await this.#assetsAtom.get()
          const baseAssetNames = Object.values(assets)
            .filter((asset) => asset.name === asset.baseAsset.name)
            .map(({ name }) => name)

          const unordered = difference(baseAssetNames, [
            ...this.#orderedFirst,
            ...this.#orderedLast,
          ])

          const ordered = [...this.#orderedFirst, ...unordered, ...this.#orderedLast]
          nextAssetNames = intersection(ordered, nextAssetNames)

          void this.#stopAndStartMonitorsByAssetNames({
            currentAssetNames: [...this.#monitors.keys()],
            nextAssetNames,
          }).then(resolve)
        })
      )
    })
  }

  #stopAndStartMonitorsByAssetNames = async ({ currentAssetNames, nextAssetNames }) => {
    await Promise.all(
      currentAssetNames
        .filter((assetName) => !nextAssetNames.includes(assetName))
        .map((assetName) => this.#stopOne(assetName))
    )

    for (const assetName of nextAssetNames) {
      this.#startOne(assetName).catch((err) => {
        this.#logger.warn(`Error starting history monitor for ${assetName}`, err)
        this.emit('monitor-start-failure', { assetName, err })
      })
      await this.#yieldToUI(0)
    }
  }
}

const createMonitors = (args) => new Monitors({ ...args })

const txLogMonitorsModuleDefinition = {
  id: 'txLogMonitors',
  factory: createMonitors,
  type: 'module',
  dependencies: [
    'assetsAtom',
    'assetClientInterface',
    'assetsConfigAtom',
    'baseAssetNamesToMonitorAtom',
    'logger',
    'config?',
    'yieldToUI?',
  ],
  public: true,
}

export default txLogMonitorsModuleDefinition
