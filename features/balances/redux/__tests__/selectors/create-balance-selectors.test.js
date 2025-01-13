import { asset as bitcoin } from '@exodus/bitcoin-meta'

import defaultConfig from '../../../default-config.js'
import { setup } from '../utils.js'

describe('createBalanceSelectors', () => {
  let emitBalances, selectors, store

  beforeEach(() => {
    ;({ emitBalances, selectors, store } = setup({}))
  })

  test.skip('generate selectors', () => {
    const list = defaultConfig.balanceFields.map((field) => {
      const id = `create${field[0].toUpperCase() + field.slice(1)}`
      return { id, field }
    })
    console.log(JSON.stringify(list))
  })

  test('create bitcoin and exodus_0 balances', () => {
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
      selectors.balances.createSpendable({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
      })(store.getState())
    ).toEqual(bitcoin.currency.defaultUnit(5))

    expect(
      selectors.balances.createUnconfirmedSent({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
      })(store.getState())
    ).toEqual(undefined)
  })
})
