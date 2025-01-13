import { createInMemoryAtom } from '@exodus/atoms'
import createStorage from '@exodus/storage-memory'

import createHasBalanceAtom from '../has-balance.js'

const createNumberUnit = (value) => ({ isZero: value === 0 })

describe('createHasBalanceAtom', () => {
  let balancesAtom
  let hasBalanceAtom
  let storage

  beforeEach(() => {
    storage = createStorage()
    balancesAtom = createInMemoryAtom({ defaultValue: { balances: {} } })
    hasBalanceAtom = createHasBalanceAtom({ balancesAtom, storage })
  })

  it('should be false if balances are empty', async () => {
    await expect(hasBalanceAtom.get()).resolves.toBe(false)
  })

  it('should be false if all balances are zero', async () => {
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

    await expect(hasBalanceAtom.get()).resolves.toBe(false)
  })

  it('should be false if some balances are not zero', async () => {
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

    await new Promise(setImmediate)
    await expect(hasBalanceAtom.get()).resolves.toBe(true)
  })

  it('should observe balances changes', async () => {
    const subscriber = jest.fn()

    hasBalanceAtom.observe(subscriber)

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

    await new Promise(setImmediate)
    expect(subscriber).toHaveBeenCalledWith(true)
  })
})
