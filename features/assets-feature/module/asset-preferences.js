import { omit } from '@exodus/basic-utils'
import assert from 'minimalistic-assert'

class AssetPreferences {
  #disabledPurposesAtom
  #multiAddressModeAtom
  #legacyAddressModeAtom
  #taprootAddressModeAtom

  constructor({
    disabledPurposesAtom,
    multiAddressModeAtom,
    legacyAddressModeAtom,
    taprootAddressModeAtom,
  }) {
    this.#disabledPurposesAtom = disabledPurposesAtom
    this.#multiAddressModeAtom = multiAddressModeAtom
    this.#legacyAddressModeAtom = legacyAddressModeAtom
    this.#taprootAddressModeAtom = taprootAddressModeAtom
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
    assert(
      assetNames.length === 1 && assetNames[0] === 'bitcoin',
      'enableLegacyAddressMode only supports bitcoin'
    )

    await this.#legacyAddressModeAtom.set((value) => ({
      ...value,
      ...assetNames.reduce((acc, assetName) => {
        acc[assetName] = true
        return acc
      }, Object.create(null)),
    }))
  }

  disableLegacyAddressMode = async ({ assetNames }) => {
    assert(
      assetNames.length === 1 && assetNames[0] === 'bitcoin',
      'disableLegacyAddressMode only supports bitcoin'
    )

    await this.#legacyAddressModeAtom.set((value) => omit(value, assetNames))
  }

  enableTaprootAddressMode = async ({ assetNames }) => {
    assert(
      assetNames.length === 1 && assetNames[0] === 'bitcoin',
      'enableTaprootAddressMode only supports bitcoin'
    )

    await this.#taprootAddressModeAtom.set((value) => ({
      ...value,
      ...assetNames.reduce((acc, assetName) => {
        acc[assetName] = true
        return acc
      }, Object.create(null)),
    }))
  }

  disableTaprootAddressMode = async ({ assetNames }) => {
    assert(
      assetNames.length === 1 && assetNames[0] === 'bitcoin',
      'disableTaprootAddressMode only supports bitcoin'
    )

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
    'disabledPurposesAtom',
    'multiAddressModeAtom',
    'legacyAddressModeAtom',
    'taprootAddressModeAtom',
  ],
  public: true,
}

export default assetPreferencesDefinition
