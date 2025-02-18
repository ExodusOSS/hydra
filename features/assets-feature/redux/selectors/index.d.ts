type Asset = any
type Data = { [assetName: string]: Asset }
type State = any

declare const allAssetsSelectorDefinition: {
  id: 'all'
  resultFunction: (data: Data) => Data
  dependencies: [{ selector: 'data' }]
}

declare const allByTickerSelectorDefinition: {
  id: 'allByTicker'
  resultFunction: (data: Data) => { [ticker: string]: Asset }
  dependencies: [{ selector: 'all' }]
}

type DataSelector = (state: State) => Data
declare const createAssetSelectorDefinition: {
  id: 'createAssetSelector'
  selectorFactory: (dataSelector: DataSelector) => (assetName: string) => Asset
  dependencies: [{ selector: 'data' }]
}

declare const createBaseAssetSelectorDefinition: {
  id: 'createBaseAssetSelector'
  selectorFactory: (dataSelector: DataSelector) => (assetName: string) => Asset
  dependencies: [{ selector: 'data' }]
}

declare const createFeeAssetSelectorDefinition: {
  id: 'createFeeAssetSelector'
  selectorFactory: (dataSelector: DataSelector) => (assetName: string) => Asset
  dependencies: [{ selector: 'data' }]
}

declare const getAssetSelectorDefinition: {
  id: 'getAsset'
  resultFunction: (assets: Data) => (assetName: string) => Asset
  dependencies: [{ selector: 'all' }]
}

declare const getAssetFromTickerSelectorDefinition: {
  id: 'getAssetFromTicker'
  resultFunction: (assets: { [ticker: string]: Asset }) => (ticker: string) => Asset
  dependencies: [{ selector: 'allByTicker' }]
}

type MultiAddressModeDataSelector = (state: State) => { [assetName: string]: boolean }
declare const createMultiAddressModeSelectorDefinition: {
  id: 'createMultiAddressMode'
  selectorFactory: (
    multiAddressModeDataSelector: MultiAddressModeDataSelector
  ) => (assetName: string) => (multiAddressModeData: { [assetName: string]: boolean }) => boolean
  dependencies: [{ selector: 'multiAddressMode' }]
}

type LegacyAddressModeDataSelector = (state: State) => { [assetName: string]: boolean }
declare const createLegacyAddressModeSelectorDefinition: {
  id: 'createLegacyAddressMode'
  selectorFactory: (
    legacyAddressModeDataSelector: LegacyAddressModeDataSelector
  ) => (assetName: string) => (legacyAddressModeData: { [assetName: string]: boolean }) => boolean
  dependencies: [{ selector: 'legacyAddressMode' }]
}

type TaprootAddressModeDataSelector = (state: State) => { [assetName: string]: boolean }
declare const createTaprootAddressModeSelectorDefinition: {
  id: 'createTaprootAddressMode'
  selectorFactory: (
    taprootAddressModeDataSelector: TaprootAddressModeDataSelector
  ) => (assetName: string) => (taprootAddressModeData: { [assetName: string]: boolean }) => boolean
  dependencies: [{ selector: 'taprootAddressMode' }]
}

type DisabledPurposesDataSelector = (state: State) => { [assetName: string]: number[] }
declare const createDisabledPurposesSelectorDefinition: {
  id: 'createDisabledPurposes'
  selectorFactory: (
    disabledPurposesDataSelector: DisabledPurposesDataSelector
  ) => (assetName: string) => (disabledPurposesData: { [assetName: string]: number[] }) => number[]
  dependencies: [{ selector: 'disabledPurposes' }]
}

declare const selectorDefinitions: [
  typeof allAssetsSelectorDefinition,
  typeof allByTickerSelectorDefinition,
  typeof createAssetSelectorDefinition,
  typeof createBaseAssetSelectorDefinition,
  typeof createFeeAssetSelectorDefinition,
  typeof getAssetSelectorDefinition,
  typeof getAssetFromTickerSelectorDefinition,
  typeof createMultiAddressModeSelectorDefinition,
  typeof createLegacyAddressModeSelectorDefinition,
  typeof createTaprootAddressModeSelectorDefinition,
  typeof createDisabledPurposesSelectorDefinition,
]

export default selectorDefinitions
