import { createStorageAtomFactory, createInMemoryAtom } from '@exodus/atoms'

function createRatesAtom({ storage, config: { persistRates } }) {
  if (persistRates) {
    return createStorageAtomFactory({ storage })({
      key: 'ratesAtom',
      defaultValue: Object.create(null),
    })
  }

  return createInMemoryAtom() // eslint-disable-line @exodus/hydra/in-memory-atom-default-value
}

function createSimulationEnabledAtom({ storage }) {
  return createStorageAtomFactory({ storage })({
    key: 'simulationEnabled',
    defaultValue: false,
  })
}

export const ratesAtomDefinition = {
  id: 'ratesAtom',
  type: 'atom',
  factory: createRatesAtom,
  dependencies: ['storage', 'config'],
  public: true,
}

export const simulationEnabledAtomDefinition = {
  id: 'ratesSimulationEnabledAtom',
  type: 'atom',
  factory: createSimulationEnabledAtom,
  dependencies: ['storage'],
  public: true,
}
