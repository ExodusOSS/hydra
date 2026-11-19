import { omit } from '@exodus/basic-utils'
import assert from 'minimalistic-assert'

const supportsLegacyAddressMode = (asset) => asset?.useBip84 === true
const supportsTaprootAddressMode = (asset) => asset?.useBip86 === true

class AssetPreferences {
  #assetsModule
  #disabledPurposesAtom
  #multiAddressModeAtom
  #legacyAddressModeAtom
  #taprootAddressModeAtom

  constructor({
    assetsModule,
    disabledPurposesAtom,
    multiAddressModeAtom,
    legacyAddressModeAtom,
    taprootAddressModeAtom,
  }) {
    this.#assetsModule = assetsModule
    this.#disabledPurposesAtom = disabledPurposesAtom
    this.#multiAddressModeAtom = multiAddressModeAtom
    this.#legacyAddressModeAtom = legacyAddressModeAtom
    this.#taprootAddressModeAtom = taprootAddressModeAtom
  }

  #assertAssetsSupport = ({ assetNames, method, isSupported }) => {
    assert(assetNames.length > 0, `${method} requires at least one asset`)
    for (const assetName of assetNames) {
      assert(
        isSupported(this.#assetsModule.getAsset(assetName)),
        `${method} does not support ${assetName}`
      )
    }
  }

  enableMultiAddressMode = ({ assetNames }) =>
    this.#multiAddressModeAtom.set((value) => ({
      ...value,
      ...assetNames.reduce((acc, assetName) => {
        acc[assetName] = true
        return acc
      }, Object.create(null)),
    }))

  disableMultiAddressMode = ({ assetNames }) =>
    this.#multiAddressModeAtom.set((value) => ({
      ...value,
      ...assetNames.reduce((acc, assetName) => {
        acc[assetName] = false
        return acc
      }, Object.create(null)),
    }))

  enableLegacyAddressMode = async ({ assetNames }) => {
    this.#assertAssetsSupport({
      assetNames,
      method: 'enableLegacyAddressMode',
      isSupported: supportsLegacyAddressMode,
    })

    await this.#legacyAddressModeAtom.set((value) => ({
      ...value,
      ...assetNames.reduce((acc, assetName) => {
        acc[assetName] = true
        return acc
      }, Object.create(null)),
    }))
  }

  disableLegacyAddressMode = async ({ assetNames }) => {
    this.#assertAssetsSupport({
      assetNames,
      method: 'disableLegacyAddressMode',
      isSupported: supportsLegacyAddressMode,
    })

    await this.#legacyAddressModeAtom.set((value) => omit(value, assetNames))
  }

  enableTaprootAddressMode = async ({ assetNames }) => {
    this.#assertAssetsSupport({
      assetNames,
      method: 'enableTaprootAddressMode',
      isSupported: supportsTaprootAddressMode,
    })

    await this.#taprootAddressModeAtom.set((value) => ({
      ...value,
      ...assetNames.reduce((acc, assetName) => {
        acc[assetName] = true
        return acc
      }, Object.create(null)),
    }))
  }

  disableTaprootAddressMode = async ({ assetNames }) => {
    this.#assertAssetsSupport({
      assetNames,
      method: 'disableTaprootAddressMode',
      isSupported: supportsTaprootAddressMode,
    })

    await this.#taprootAddressModeAtom.set((value) => omit(value, assetNames))
  }

  disablePurpose = ({ assetName, purpose }) =>
    this.#disabledPurposesAtom.set((value) => {
      const assetValue = value[assetName] || []
      if (assetValue.includes(purpose)) return value

      return {
        ...value,
        [assetName]: [...assetValue, purpose],
      }
    })

  enablePurpose = ({ assetName, purpose }) =>
    this.#disabledPurposesAtom.set((value) => {
      const assetValue = value[assetName] || []
      if (assetValue.includes(purpose)) {
        return {
          ...value,
          [assetName]: assetValue.filter((disabledPurpose) => disabledPurpose !== purpose),
        }
      }

      return value
    })
}

const assetPreferencesDefinition = {
  id: 'assetPreferences',
  type: 'module',
  factory: (opts) => new AssetPreferences(opts),
  dependencies: [
    'assetsModule',
    'disabledPurposesAtom',
    'multiAddressModeAtom',
    'legacyAddressModeAtom',
    'taprootAddressModeAtom',
  ],
  public: true,
}

export default assetPreferencesDefinition
