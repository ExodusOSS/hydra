import { compute } from '@exodus/atoms'

const setsAreEqual = (setA, setB) => {
  if (setA.size !== setB.size) {
    return false
  }

  for (const item of setA) {
    if (!setB.has(item)) {
      return false
    }
  }

  return true
}

const createAssetNamesWithBalanceAtom = ({ balancesAtom }) => {
  let previousValue = new Set()
  const selector = ({ balances }) => {
    const assetsWithBalances = new Set()

    Object.values(balances).forEach((accountBalances) => {
      Object.keys(accountBalances).forEach((assetName) => {
        if (!accountBalances[assetName]?.balance.isZero) {
          assetsWithBalances.add(assetName)
        }
      })
    })

    if (!setsAreEqual(assetsWithBalances, previousValue)) {
      previousValue = assetsWithBalances
    }

    return previousValue
  }

  return compute({ atom: balancesAtom, selector })
}

export default createAssetNamesWithBalanceAtom
