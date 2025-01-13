import { createInMemoryAtom } from '@exodus/atoms'
import { UnitType } from '@exodus/currency'

import createAssetTotalWalletAmountsAtom from '../asset-total-wallet-amounts.js'

const ethereumCurrency = UnitType.create({
  wei: 0,
  Kwei: 3,
  Mwei: 6,
  Gwei: 9,
  szabo: 12,
  finney: 15,
  ETH: 18,
})

const bitcoinCurrency = UnitType.create({
  satoshis: 0,
  bits: 2,
  BTC: 8,
})

const solanaCurrency = UnitType.create({
  Lamports: 0,
  SOL: 9,
})

describe('createAssetTotalWalletAmountsAtom', () => {
  let balancesAtom
  let assetTotalWalletAmountsAtom

  beforeEach(() => {
    balancesAtom = createInMemoryAtom({ defaultValue: { balances: {} } })
    assetTotalWalletAmountsAtom = createAssetTotalWalletAmountsAtom({ balancesAtom })
  })

  it('should return an empty map by default', async () => {
    await expect(assetTotalWalletAmountsAtom.get()).resolves.toEqual(new Map())
  })

  it('should return an map of asset balances summed over all wallet accounts', async () => {
    await balancesAtom.set({
      balances: {
        exodus_0: {
          bitcoin: { balance: bitcoinCurrency.defaultUnit(0) },
          solana: { balance: solanaCurrency.defaultUnit(1) },
          ethereum: { balance: ethereumCurrency.defaultUnit(0) },
        },
        exodus_1: {
          bitcoin: { balance: bitcoinCurrency.defaultUnit(1) },
          solana: { balance: solanaCurrency.defaultUnit(0) },
          ethereum: { balance: ethereumCurrency.defaultUnit(0) },
        },
      },
    })

    await expect(assetTotalWalletAmountsAtom.get()).resolves.toEqual(
      new Map([
        ['bitcoin', bitcoinCurrency.defaultUnit(1)],
        ['solana', solanaCurrency.defaultUnit(1)],
        ['ethereum', ethereumCurrency.ZERO],
      ])
    )
  })

  it('should observe balances changes', async () => {
    const subscriber = jest.fn()
    assetTotalWalletAmountsAtom.observe(subscriber)

    const initialBalances = {
      balances: {
        exodus_0: {
          bitcoin: { balance: bitcoinCurrency.baseUnit(1) },
          solana: { balance: solanaCurrency.baseUnit(1) },
        },
        exodus_1: {
          bitcoin: { balance: bitcoinCurrency.ZERO },
          solana: { balance: solanaCurrency.ZERO },
        },
      },
    }

    const createUpdatedBalances = () => ({
      balances: {
        exodus_0: {
          bitcoin: { balance: bitcoinCurrency.defaultUnit(10) },
          solana: { balance: solanaCurrency.defaultUnit(5) },
        },
        exodus_1: {
          bitcoin: { balance: bitcoinCurrency.defaultUnit(10) },
          solana: { balance: solanaCurrency.defaultUnit(5) },
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
