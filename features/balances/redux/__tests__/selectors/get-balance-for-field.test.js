import { asset as bitcoin } from '@exodus/bitcoin-meta'

import { setup } from '../utils.js'

describe('getBalanceForField', () => {
  let emitBalances, selectors, store

  beforeEach(() => {
    ;({ emitBalances, selectors, store } = setup({}))
  })

  test('get bitcoin and exodus_0 balances', () => {
    emitBalances({
      balances: {
        exodus_0: {
          bitcoin: {
            balance: bitcoin.currency.defaultUnit(10),
            total: bitcoin.currency.defaultUnit(10),
            spendableBalance: bitcoin.currency.defaultUnit(5),
            spendable: bitcoin.currency.defaultUnit(5),
          },
          ethereum: {
            balance: bitcoin.currency.defaultUnit(42),
            total: bitcoin.currency.defaultUnit(42),
          },
        },
        exodus_1: {
          bitcoin: {
            balance: bitcoin.currency.defaultUnit(5),
            spendable: bitcoin.currency.defaultUnit(5),
          },
        },
      },
    })

    expect(
      selectors.balances
        .getBalanceForField(store.getState())({
          assetName: 'bitcoin',
          walletAccount: 'exodus_0',
          field: 'spendable',
        })
        .equals(bitcoin.currency.defaultUnit(5))
    ).toEqual(true)

    expect(
      selectors.balances
        .getBalanceForField(store.getState())({
          assetName: 'bitcoin',
          walletAccount: 'exodus_0',
          field: 'unconfirmedSent',
        })
        .equals(bitcoin.currency.ZERO)
    ).toEqual(true)

    expect(() =>
      selectors.balances.getBalanceForField(store.getState())({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
        field: 'invalid',
      })
    ).toThrow(
      "Value 'invalid' is not one of the valid fields 'total, balance, spendable, spendableBalance, unconfirmedSent, unconfirmedReceived, unspendable, walletReserve, networkReserve, staking, staked, stakeable, unstaking, unstaked, rewards, frozen'"
    )
  })
})
