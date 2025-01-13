import { asset as bitcoin } from '@exodus/bitcoin-meta'
import { asset as ethereum } from '@exodus/ethereum-meta'

import initialState from '../initial-state.js'
import { setup } from './utils.js'

describe('eventReducers', () => {
  let store, emitBalances, emitHasBalance
  beforeEach(() => {
    ;({ store, emitBalances, emitHasBalance } = setup())
  })

  test('balances event', () => {
    expect(store.getState().balances).toEqual(initialState)
    emitBalances({
      changes: {},
      balances: {
        exodus_0: {
          bitcoin: { balance: bitcoin.currency.defaultUnit(10) },
        },
      },
    })
    expect(store.getState().balances).toEqual({
      hasBalance: false,
      exodus_0: {
        data: {
          bitcoin: {
            balance: bitcoin.currency.defaultUnit(10),
          },
        },
        error: null,
        loaded: true,
      },
    })
  })

  test('balances event with changes', () => {
    expect(store.getState().balances).toEqual(initialState)
    emitBalances({
      changes: {},
      balances: {
        exodus_0: {
          bitcoin: {
            balance: bitcoin.currency.defaultUnit(10),
          },
        },
      },
    })
    expect(store.getState().balances).toEqual({
      hasBalance: false,
      exodus_0: {
        data: {
          bitcoin: {
            balance: bitcoin.currency.defaultUnit(10),
          },
        },
        error: null,
        loaded: true,
      },
    })

    emitBalances({
      changes: {
        exodus_0: {
          ethereum: {
            balance: {
              from: ethereum.currency.defaultUnit(0),
              to: ethereum.currency.defaultUnit(5),
            },
          },
        },
      },
      balances: {
        exodus_0: {
          bitcoin: {
            balance: bitcoin.currency.defaultUnit(10),
          },
          ethereum: {
            balance: ethereum.currency.defaultUnit(5),
          },
        },
      },
    })
    expect(store.getState().balances).toEqual({
      hasBalance: false,
      exodus_0: {
        data: {
          bitcoin: {
            balance: bitcoin.currency.defaultUnit(10),
          },
          ethereum: {
            balance: ethereum.currency.defaultUnit(5),
          },
        },
        error: null,
        loaded: true,
      },
    })
  })

  test('ignore changes if state empty', () => {
    expect(store.getState().balances).toEqual(initialState)

    emitBalances({
      changes: {
        exodus_0: {
          ethereum: {
            balance: {
              from: ethereum.currency.defaultUnit(0),
              to: ethereum.currency.defaultUnit(5),
            },
          },
        },
      },
      balances: {
        exodus_0: {
          bitcoin: {
            balance: bitcoin.currency.defaultUnit(10),
          },
          ethereum: {
            balance: ethereum.currency.defaultUnit(5),
          },
        },
      },
    })
    expect(store.getState().balances).toEqual({
      hasBalance: false,
      exodus_0: {
        data: {
          bitcoin: {
            balance: bitcoin.currency.defaultUnit(10),
          },
          ethereum: {
            balance: ethereum.currency.defaultUnit(5),
          },
        },
        error: null,
        loaded: true,
      },
    })
  })

  test('set hasBalancesStored when receive event', () => {
    expect(store.getState().balances).toEqual(initialState)

    emitHasBalance(true)
    expect(store.getState().balances).toEqual({
      ...initialState,
      hasBalance: true,
    })
  })
})
