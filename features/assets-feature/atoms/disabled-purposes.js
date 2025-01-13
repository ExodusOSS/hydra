import { createStorageAtomFactory } from '@exodus/atoms'

const createDisabledPurposesAtom = ({ storage, logger, config }) => {
  return createStorageAtomFactory({ storage, logger })({
    key: 'disabledPurposes',
    defaultValue: config.defaults,
    isSoleWriter: true,
  })
}

const disabledPurposesAtomDefinition = {
  id: 'disabledPurposesAtom',
  type: 'atom',
  factory: createDisabledPurposesAtom,
  dependencies: ['storage', 'logger', 'config'],
  public: true,
}

export default disabledPurposesAtomDefinition
