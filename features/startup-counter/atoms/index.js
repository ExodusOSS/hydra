import { createStorageAtomFactory } from '@exodus/atoms'

const createWalletStartupCountAtom = ({ storage }) => {
  const atomFactory = createStorageAtomFactory({ storage })

  return atomFactory({
    key: 'startupCount',
    defaultValue: 0,
    isSoleWriter: true,
  })
}

const walletStartupCountAtomDefinition = {
  id: 'walletStartupCountAtom',
  type: 'atom',
  factory: createWalletStartupCountAtom,
  dependencies: ['storage'],
  public: true,
}

export default walletStartupCountAtomDefinition
