import restrictConcurrency from 'make-concurrent'
import ms from 'ms'

const TOKEN_NAME_RE = /^[^_]+_([^_]+)_([^_]+)$/u
const INITIAL_LOAD_RETRY_DELAY = ms('5s')
const MAX_LOAD_RETRY_DELAY = ms('5m')

class AvailableAssets {
  #logger
  #assetsModule
  #availableAssetsAtom
  #enabledAndDisabledAssetsAtom
  #assetsAtom
  #defaultAvailableAssetNames
  #subscriptions = []
  #loadPromise
  #failedLoadTokenNames
  #loadRetryDelay = INITIAL_LOAD_RETRY_DELAY
  #loadRetryTimeout
  #stopped = false

  constructor({
    assetsModule,
    assetsAtom,
    availableAssetsAtom,
    enabledAndDisabledAssetsAtom,
    // these are the hardcoded default available asset names
    // we will filter this list by defined assets at assetsModule at start function
    config: { defaultAvailableAssetNames = ['bitcoin', 'ethereum', 'solana'] } = Object.create(
      null
    ),
    logger,
  }) {
    this.#logger = logger
    this.#defaultAvailableAssetNames = defaultAvailableAssetNames
    this.#assetsModule = assetsModule
    this.#assetsAtom = assetsAtom
    this.#availableAssetsAtom = availableAssetsAtom
    this.#enabledAndDisabledAssetsAtom = enabledAndDisabledAssetsAtom
  }

  start = async () => {
    this.#stopped = false

    // we will filter the hardcoded default available asset names list by defined assets
    // not every wallet will have the same assets set up
    await this.#availableAssetsAtom.set(
      this.#defaultAvailableAssetNames
        .filter((name) => this.#assetsModule.getAsset(name))
        .map((assetName) => ({ assetName, reason: 'default' }))
    )

    const { added, updated } = await this.#assetsAtom.get()

    const toMakeAvailable = [...added, ...updated]
    if (toMakeAvailable.length > 0) {
      void this.#makeAssetsAvailable(toMakeAvailable, 'assets-load')
    }

    this.#subscriptions.push(
      this.#assetsAtom.observe(({ added, updated }) => {
        if (added.length > 0) {
          void this.#makeAssetsAvailable(added, 'assets-add')
        }

        if (updated.length > 0) {
          void this.#makeAssetsAvailable(updated, 'assets-update')
        }
      }),
      // built-in custom tokens that the user added/enabled/disabled explicitly needs to be available forever
      this.#enabledAndDisabledAssetsAtom.observe(async (value) => {
        if (value?.disabled) {
          const availableAssetsNamesSet = await this.#getAvailableAssetsSet()
          const unavailableTokenNames = Object.keys(value.disabled).filter((assetName) => {
            const { baseAssetName, token } = this.#resolveBaseAssetName(assetName)
            return (
              baseAssetName &&
              assetName !== baseAssetName &&
              availableAssetsNamesSet.has(baseAssetName) &&
              !availableAssetsNamesSet.has(assetName) &&
              !token
            )
          })
          if (unavailableTokenNames.length > 0) {
            this.#assetsModule
              .addRemoteTokens({ tokenNames: unavailableTokenNames, allowedStatusList: ['c', 'v'] })
              .catch((err) => this.#logger.error(err))
          }
        }
      })
    )
  }

  // Runs once it succeeds. A failed run is logged and retried with a growing delay,
  // so default remote tokens still load after a network error at startup.
  load = () => {
    this.#loadPromise ??= this.#addMissingDefaultTokens()
    return this.#loadPromise
  }

  stop = () => {
    this.#stopped = true
    clearTimeout(this.#loadRetryTimeout)
    this.#subscriptions.forEach((unsubscribe) => unsubscribe())
    this.#subscriptions = []
  }

  #addMissingDefaultTokens = async () => {
    clearTimeout(this.#loadRetryTimeout)

    // A failed run can register tokens before it throws (a storage write failure) without
    // announcing them, so a retry asks for the same names. addRemoteTokens returns a registered
    // token as an update, which makes it available.
    const tokenNames =
      this.#failedLoadTokenNames ??
      this.#defaultAvailableAssetNames.filter(
        (name) => TOKEN_NAME_RE.test(name) && !this.#assetsModule.getAsset(name)
      )

    if (tokenNames.length === 0) return

    try {
      await this.#assetsModule.addRemoteTokens({ tokenNames, allowedStatusList: ['c'] })
      this.#failedLoadTokenNames = undefined
    } catch (error) {
      this.#loadPromise = undefined
      this.#failedLoadTokenNames = tokenNames
      this.#scheduleLoadRetry(error)
      throw error
    }
  }

  #scheduleLoadRetry = (error) => {
    if (this.#stopped) {
      this.#logger.error('failed to load default remote tokens', error)
      return
    }

    const delay = this.#loadRetryDelay
    this.#loadRetryDelay = Math.min(delay * 2, MAX_LOAD_RETRY_DELAY)
    this.#logger.error(`failed to load default remote tokens, retrying in ${ms(delay)}`, error)
    // The failed run logs its own error and schedules the next retry.
    this.#loadRetryTimeout = setTimeout(() => this.load().catch(() => {}), delay)
  }

  #resolveBaseAssetName = (assetName) => {
    if (!assetName) return {}

    const token = this.#assetsModule.getAsset(assetName)
    if (token) return { baseAssetName: token.baseAsset.name, token }

    const result = TOKEN_NAME_RE.exec(assetName)
    return { baseAssetName: result?.[1] }
  }

  #getAvailableAssetsSet = async () => {
    const availableAssets = await this.#availableAssetsAtom.get()
    return new Set(availableAssets.map((a) => a.assetName))
  }

  #makeAssetsAvailable = restrictConcurrency(async (assets, reason) => {
    const availableAssets = await this.#availableAssetsAtom.get()
    const availableAssetsNamesSet = await this.#getAvailableAssetsSet()
    const toMakeAvailable = assets
      .filter((asset) => !availableAssetsNamesSet.has(asset.name))
      .filter((asset) => !asset.api?.features?.delisted)
      .map((asset) => ({ assetName: asset.name, reason }))

    if (toMakeAvailable.length === 0) return

    this.#logger.log('making assets available:', toMakeAvailable)
    const update = [...availableAssets, ...toMakeAvailable]
    await this.#availableAssetsAtom.set(update)
  })
}

const createAvailableAssetsModule = (opts) => new AvailableAssets(opts)

const availableAssetsDefinition = {
  id: 'availableAssets',
  type: 'module',
  factory: createAvailableAssetsModule,
  dependencies: [
    'assetsModule',
    'enabledAndDisabledAssetsAtom',
    'logger',
    'config?',
    'availableAssetsAtom',
    'assetsAtom',
  ],
  public: true,
}

export default availableAssetsDefinition
