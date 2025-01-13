import { asset as bitcoin } from '@exodus/bitcoin-meta'

import defaultConfig from '../../../default-config.js'
import { setup } from '../utils.js'

describe('getBalanceSelectors', () => {
  let emitBalances, selectors, store

  beforeEach(() => {
    ;({ emitBalances, selectors, store } = setup({}))
  })

  test.skip('generate selectors', () => {
    const list = defaultConfig.balanceFields.map((field) => {
      const id = `get${field[0].toUpperCase() + field.slice(1)}`
      return { id, field }
    })
    console.log(JSON.stringify(list))
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
      selectors.balances.getSpendable(store.getState())({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
      })
    ).toEqual(bitcoin.currency.defaultUnit(5))

    expect(
      selectors.balances.getUnconfirmedSent(store.getState())({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
      })
    ).toEqual(undefined)
  })
})
