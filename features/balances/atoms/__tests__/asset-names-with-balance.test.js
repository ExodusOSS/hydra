import { createInMemoryAtom } from '@exodus/atoms'

import createAssetNamesWithBalanceAtom from '../asset-names-with-balance.js'

const createNumberUnit = (value) => ({ isZero: value === 0 })

describe('createAssetNamesWithBalanceAtom', () => {
  let balancesAtom
  let assetNamesWithBalanceAtom

  beforeEach(() => {
    balancesAtom = createInMemoryAtom({ defaultValue: { balances: {} } })
    assetNamesWithBalanceAtom = createAssetNamesWithBalanceAtom({ balancesAtom })
  })

  it('should return an empty set by default', async () => {
    await expect(assetNamesWithBalanceAtom.get()).resolves.toEqual(new Set())
  })

  it('should return an empty set when all balances are 0', async () => {
    await balancesAtom.set({
      balances: {
        exodus_0: {
          bitcoin: { balance: createNumberUnit(0) },
          solana: { balance: createNumberUnit(0) },
        },
        exodus_1: {
          bitcoin: { balance: createNumberUnit(0) },
          solana: { balance: createNumberUnit(0) },
        },
      },
    })

    await expect(assetNamesWithBalanceAtom.get()).resolves.toEqual(new Set())
  })

  it('should return the assetNames with non-zerobalance', async () => {
    await balancesAtom.set({
      balances: {
        exodus_0: {
          bitcoin: { balance: createNumberUnit(10) },
          solana: { balance: createNumberUnit(0) },
        },
        exodus_1: {
          bitcoin: { balance: createNumberUnit(0) },
          solana: { balance: createNumberUnit(0) },
        },
      },
    })

    await expect(assetNamesWithBalanceAtom.get()).resolves.toEqual(new Set(['bitcoin']))
  })

  it('should observe balances changes', async () => {
    const subscriber = jest.fn()

    assetNamesWithBalanceAtom.observe(subscriber)

    const initialBalances = {
      balances: {
        exodus_0: {
          bitcoin: { balance: createNumberUnit(10) },
          solana: { balance: createNumberUnit(0) },
        },
        exodus_1: {
          bitcoin: { balance: createNumberUnit(0) },
          solana: { balance: createNumberUnit(0) },
        },
      },
    }

    const createUpdatedBalances = () => ({
      balances: {
        exodus_0: {
          bitcoin: { balance: createNumberUnit(10) },
          solana: { balance: createNumberUnit(1) },
        },
        exodus_1: {
          bitcoin: { balance: createNumberUnit(0) },
          solana: { balance: createNumberUnit(0) },
        },
      },
    })

    await balancesAtom.set(initialBalances)
    await new Promise(setImmediate)
    expect(subscriber).toHaveBeenCalledTimes(1)

    await balancesAtom.set(createUpdatedBalances())
    await new Promise(setImmediate)
    expect(subscriber).toHaveBeenCalledTimes(2)

    // dedupe
    await balancesAtom.set(createUpdatedBalances())
    await new Promise(setImmediate)
    expect(subscriber).toHaveBeenCalledTimes(2)
  })
})
