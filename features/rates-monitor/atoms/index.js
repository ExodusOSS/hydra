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

export const ratesAtomDefinition = {
  id: 'ratesAtom',
  type: 'atom',
  factory: createRatesAtom,
  dependencies: ['storage', 'config'],
  public: true,
}
