import { compute, createStorageAtomFactory } from '@exodus/atoms'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

const { flatMap, map } = lodash

// balancesAtom schema: { balances: { [walletAccount]: { [assetName]: { balance: NumberUnit } } } } }

const createComputedAtom = ({ balancesAtom }) => {
  const selector = ({ balances } = {}) => {
    const numberUnits = flatMap(balances, (value) => map(value, 'balance'))
    return numberUnits.some((numberUnit) => (numberUnit ? !numberUnit.isZero : false))
  }

  return compute({ atom: balancesAtom, selector })
}

const createHasBalanceAtom = ({ balancesAtom, storage }) => {
  const storageAtom = createStorageAtomFactory({ storage })({
    key: 'hasBalance',
    defaultValue: false,
    isSoleWriter: true,
  })
  const computedAtom = createComputedAtom({ balancesAtom })
  // eslint-disable-next-line @exodus/hydra/no-eternal-subscription
  computedAtom.observe((value) => storageAtom.set(value))

  return storageAtom
}

export default createHasBalanceAtom
