import { mapValues } from '@exodus/basic-utils'
import makeConcurrent from 'make-concurrent'

const assetNamesToBoolDict = (assetNames, bool) =>
  Object.fromEntries(assetNames.map((assetName) => [assetName, bool]))

class EnabledAssets {
  #logger
  #config
  #enabledAndDisabledAssetsAtom
  #defaultEnabledAssetNamesAtom
  #defaultEnabledAssetsList
  #assetsModule
  #availableAssetNamesAtom

  constructor({
    logger,
    config,
    enabledAndDisabledAssetsAtom,
    defaultEnabledAssetNamesAtom,
    availableAssetNamesAtom,
    assetsModule,
  }) {
    this.#logger = logger
    this.#config = config
    this.#enabledAndDisabledAssetsAtom = enabledAndDisabledAssetsAtom
    this.#defaultEnabledAssetNamesAtom = defaultEnabledAssetNamesAtom
    this.#availableAssetNamesAtom = availableAssetNamesAtom
    this.#assetsModule = assetsModule
  }

  async load() {
    const storageData = await this.#enabledAndDisabledAssetsAtom.get()
    const isFreshWallet = Object.keys(storageData.disabled).length === 0

    const availableAssetNames = await this.#availableAssetNamesAtom.get()
    const availableBaseAssetNames = availableAssetNames.filter((assetName) => {
      const asset = this.#assetsModule.getAsset(assetName)
      return asset.name === asset.baseAsset.name
    })

    this.#defaultEnabledAssetsList =
      this.#config.defaultEnabledAssetsList || availableBaseAssetNames

    if (isFreshWallet) {
      const { defaultEnabledAssetsListForFreshWallets } = this.#config
      this.#defaultEnabledAssetsList = [
        ...this.#defaultEnabledAssetsList,
        ...(defaultEnabledAssetsListForFreshWallets || []),
      ]
    }

    await this.#defaultEnabledAssetNamesAtom.set(this.#defaultEnabledAssetsList)
    await this.#initDefaultAssets()
  }

  wasChangedByUser = async (assetName) => {
    const storageData = await this.#enabledAndDisabledAssetsAtom.get()
    return storageData.disabled[assetName] !== undefined
  }

  #initDefaultAssets = async () => {
    const assetNamesToEnable = await this.#filterChangedByUser(this.#defaultEnabledAssetsList)

    return this.enable(assetNamesToEnable)
  }

  #filterChangedByUser = async (assetNames) => {
    const storageData = await this.#enabledAndDisabledAssetsAtom.get()
    const getWasChanged = (assetName) => storageData.disabled[assetName] !== undefined
    return assetNames.filter((assetName) => !getWasChanged(assetName))
  }

  enable = async (assetNames, { unlessDisabled } = Object.create(null)) => {
    let assetNamesToUse = assetNames
    if (unlessDisabled) {
      assetNamesToUse = await this.#filterChangedByUser(assetNames)
    }

    // ensure base asset is also enabled
    const storageData = await this.#enabledAndDisabledAssetsAtom.get()
    const baseAssetsToEnable = assetNamesToUse.reduce((r, assetName) => {
      const baseAssetName = this.#assetsModule.getAsset(assetName)?.baseAsset.name
      baseAssetName && storageData.disabled[baseAssetName] !== false && r.push(baseAssetName)
      return r
    }, [])
    assetNamesToUse.unshift(...baseAssetsToEnable)

    const boolDict = assetNamesToBoolDict(assetNamesToUse, true)
    return this.#setAssetsEnabled(boolDict)
  }

  disable = async (assetNames) => this.#setAssetsEnabled(assetNamesToBoolDict(assetNames, false))

  #setAssetsEnabled = makeConcurrent(async (enabledByAssetName) => {
    if (Object.keys(enabledByAssetName).length === 0) return

    const storageData = await this.#enabledAndDisabledAssetsAtom.get()
    const disabledByAssetName = mapValues(enabledByAssetName, (enabled) => !enabled)
    if (
      Object.keys(disabledByAssetName).every(
        (assetName) => storageData.disabled[assetName] === disabledByAssetName[assetName]
      )
    ) {
      this.#logger.debug('prevent enabling already enabled assets', enabledByAssetName)
      return
    }

    const newStorageData = {
      ...storageData,
      disabled: {
        ...storageData.disabled,
        ...disabledByAssetName,
      },
    }
    await this.#enabledAndDisabledAssetsAtom.set(newStorageData)
  })

  addAndEnableToken = async (...args) => {
    const asset = await this.#assetsModule.addToken(...args)
    await this.enable([asset.name])
    return asset.name
  }

  clear = async () => {
    await this.#enabledAndDisabledAssetsAtom.set(undefined)
  }
}

const createEnabledAssets = (args) => new EnabledAssets({ ...args })

const enabledAssetsDefinition = {
  id: 'enabledAssets',
  type: 'module',
  factory: createEnabledAssets,
  dependencies: [
    'enabledAndDisabledAssetsAtom',
    'defaultEnabledAssetNamesAtom',
    'config',
    'logger',
    'assetsModule',
    'availableAssetNamesAtom',
  ],
  public: true,
}

export default enabledAssetsDefinition
