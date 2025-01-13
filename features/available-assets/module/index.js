import restrictConcurrency from 'make-concurrent'

class AvailableAssets {
  #logger
  #assetsModule
  #availableAssetsAtom
  #enabledAndDisabledAssetsAtom
  #assetsAtom
  #defaultAvailableAssetNames
  #subscriptions = []

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
      this.#makeAssetsAvailable(toMakeAvailable, 'assets-load')
    }

    this.#subscriptions.push(
      this.#assetsAtom.observe(({ added, updated }) => {
        if (added.length > 0) {
          this.#makeAssetsAvailable(added, 'assets-add')
        }

        if (updated.length > 0) {
          this.#makeAssetsAvailable(updated, 'assets-update')
        }
      }),
      // built-in custom tokens that the user added/enabled/disabled explicitly needs to be available forever
      this.#enabledAndDisabledAssetsAtom.observe(async (value) => {
        if (value?.disabled) {
          const availableAssetsNamesSet = await this.#getAvailableAssetsSet()
          const unavailableTokenNames = Object.keys(value.disabled).filter((assetName) => {
            const token = this.#assetsModule.getAsset(assetName)
            return (
              !availableAssetsNamesSet.has(assetName) &&
              (!token ||
                (token.name !== token.baseAsset.name &&
                  availableAssetsNamesSet.has(token.baseAsset.name)))
            )
          })
          if (unavailableTokenNames.length > 0) {
            this.#assetsModule
              .addRemoteTokens({ tokenNames: unavailableTokenNames })
              .catch((err) => this.#logger.error(err))
          }
        }
      })
    )
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
      .map((asset) => ({ assetName: asset.name, reason }))

    if (toMakeAvailable.length === 0) return

    this.#logger.log('making assets available:', toMakeAvailable)
    const update = [...availableAssets, ...toMakeAvailable]
    await this.#availableAssetsAtom.set(update)
  })

  stop = () => {
    this.#subscriptions.forEach((unsubscribe) => unsubscribe())
    this.#subscriptions = []
  }
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
