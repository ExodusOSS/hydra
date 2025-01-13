import { createInMemoryAtom } from '@exodus/atoms'

import createAssetNamesWithBalanceAtom from '../asset-names-with-balance.js'
import createAssetsWithBalanceCountAtom from '../assets-with-balance-count.js'

const createNumberUnit = (value) => ({ isZero: value === 0 })

describe('createAssetsWithBalanceCountAtom', () => {
  let balancesAtom
  let assetNamesWithBalanceAtom
  let assetsWithBalanceCountAtom

  beforeEach(() => {
    balancesAtom = createInMemoryAtom({ defaultValue: { balances: {} } })
    assetNamesWithBalanceAtom = createAssetNamesWithBalanceAtom({ balancesAtom })
    assetsWithBalanceCountAtom = createAssetsWithBalanceCountAtom({ assetNamesWithBalanceAtom })
  })

  it('should return zero if balances are empty', async () => {
    await expect(assetsWithBalanceCountAtom.get()).resolves.toBe(0)
  })

  it('should return zero if all balances are zero', async () => {
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

    await expect(assetsWithBalanceCountAtom.get()).resolves.toBe(0)
  })

  it('should return a non zero count if some balances are not zero', async () => {
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

    await expect(assetsWithBalanceCountAtom.get()).resolves.toBe(1)
  })

  it('should count asset only once', async () => {
    await balancesAtom.set({
      balances: {
        exodus_0: {
          bitcoin: { balance: createNumberUnit(10) },
          solana: { balance: createNumberUnit(0) },
        },
        exodus_1: {
          bitcoin: { balance: createNumberUnit(10) },
          solana: { balance: createNumberUnit(0) },
        },
      },
    })

    await expect(assetsWithBalanceCountAtom.get()).resolves.toBe(1)
  })

  it('should observe balances changes', async () => {
    const subscriber = jest.fn()

    assetsWithBalanceCountAtom.observe(subscriber)

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

    expect(subscriber).toHaveBeenCalledWith(1)
  })
})
