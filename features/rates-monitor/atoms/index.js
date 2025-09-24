import { createInMemoryAtom, createStorageAtomFactory, filter } from '@exodus/atoms'

function createRatesAtom({ storage, config: { persistRates } }) {
  if (persistRates) {
    return createStorageAtomFactory({ storage })({
      key: 'ratesAtom',
      defaultValue: Object.create(null),
    })
  }

  return createInMemoryAtom() // eslint-disable-line @exodus/hydra/in-memory-atom-default-value
}

function createRatesAssetNamesToMonitorAtom({ availableAssetNamesAtom }) {
  return filter(
    availableAssetNamesAtom,
    (assetNames) => Array.isArray(assetNames) && assetNames.length > 0
  )
}

export const ratesAtomDefinition = {
  id: 'ratesAtom',
  type: 'atom',
  factory: createRatesAtom,
  dependencies: ['storage', 'config'],
  public: true,
}

export const ratesAssetNamesToMonitorAtomDefinition = {
  id: 'ratesAssetNamesToMonitorAtom',
  type: 'atom',
  factory: createRatesAssetNamesToMonitorAtom,
  dependencies: ['availableAssetNamesAtom'],
}
