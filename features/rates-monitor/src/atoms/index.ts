import { createInMemoryAtom, createStorageAtomFactory, filter } from '@exodus/atoms'
import type { Atom } from '@exodus/atoms'
import type { Storage } from '@exodus/storage-interface'
import type { Definition } from '@exodus/dependency-types'

import type { RatesByCurrency } from '../redux/types.js'

function createRatesAtom({
  storage,
  config: { persistRates },
}: {
  storage: Storage<RatesByCurrency>
  config: { persistRates: boolean }
}): Atom<RatesByCurrency> {
  if (persistRates) {
    return createStorageAtomFactory({ storage })({
      key: 'ratesAtom',
      defaultValue: Object.create(null) as RatesByCurrency,
    })
  }

  return createInMemoryAtom() as Atom<RatesByCurrency> // oxlint-disable-line @exodus/oxlint-plugin-hydra/in-memory-atom-default-value
}

function createRatesAssetNamesToMonitorAtom({
  availableAssetNamesAtom,
}: {
  availableAssetNamesAtom: Atom<string[]>
}): Atom<string[]> {
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
} as const satisfies Definition

export const ratesAssetNamesToMonitorAtomDefinition = {
  id: 'ratesAssetNamesToMonitorAtom',
  type: 'atom',
  factory: createRatesAssetNamesToMonitorAtom,
  dependencies: ['availableAssetNamesAtom'],
} as const satisfies Definition
