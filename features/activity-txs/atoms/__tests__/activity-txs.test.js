import { createInMemoryAtom } from '@exodus/atoms'
import { createAsset as createBitcoin } from '@exodus/bitcoin-plugin'
import { createNoopLogger } from '@exodus/logger'
import { TxSet } from '@exodus/models'

import fixtures from '../../test/tx-log-fixtures.json'
import activityTxsAtomDefinition from '../activity-txs'

const bitcoin = createBitcoin({ assetClientInterface: { createLogger: createNoopLogger } })
const assets = {
  bitcoin: {
    ...bitcoin,
    baseAsset: bitcoin,
    feeAsset: bitcoin,
  },
  shitCoin: {
    name: 'lolkek',
    ticker: 'LOL',
    get baseAsset() {
      return assets.shitCoin
    },
    api: {
      features: {
        noHistory: true,
      },
    },
  },
  eosio: {
    name: 'eosio',
    ticker: 'EOS',
    get baseAsset() {
      return assets.eosio
    },
    api: {
      getActivityOptions: ({ accountState }) =>
        accountState?.filterSmallTxs ? { filterSmallTxs: true } : null,
      getActivityTxs: ({ txs, options }) =>
        options?.filterSmallTxs ? txs.filter((tx) => tx.coinAmount.toDefaultNumber() > 1) : txs,
    },
  },
}

describe('activityTxsAtom', () => {
  const advance = async (ms) => {
    await new Promise(setImmediate)
  }

  test('returns transactions array per asset.api', async () => {
    const handler = jest.fn()
    const txLogsAtom = createInMemoryAtom({})
    const accountStatesAtom = createInMemoryAtom({})
    const atom = activityTxsAtomDefinition.factory({
      txLogsAtom,
      accountStatesAtom,
      assetsModule: {
        getAsset: (assetName) => assets[assetName],
      },
    })

    atom.observe(handler)
    await txLogsAtom.set({
      value: {
        exodus_0: {
          bitcoin: TxSet.fromArray(fixtures.bitcoin),
        },
      },
    })
    await accountStatesAtom.set({
      value: {
        exodus_0: {},
      },
    })
    await advance()
    expect(handler.mock.calls.length).toEqual(1)
    expect(handler.mock.calls[0][0].exodus_0.bitcoin.map((tx) => tx.toJSON())).toEqual([
      {
        addresses: [
          {
            address: 'bc1qndnv4znc0dnnju2gcwddf4x42yunc4t9s2hna0',
            meta: {
              path: 'm/0/0',
            },
          },
        ],
        coinAmount: '0.00184082 BTC',
        coinName: 'bitcoin',
        confirmations: 1,
        currencies: {
          bitcoin: {
            BTC: 8,
            bits: 2,
            satoshis: 0,
          },
        },
        date: '2019-07-18T12:25:52.000Z',
        dropped: false,
        feeAmount: '0.00014238 BTC',
        feeCoinName: 'bitcoin',
        txId: 'tx-1',
        version: 1,
      },
      {
        coinAmount: '-0.04 BTC',
        coinName: 'bitcoin',
        confirmations: 0,
        currencies: {
          bitcoin: {
            BTC: 8,
            bits: 2,
            satoshis: 0,
          },
        },
        data: {
          sent: [
            {
              address: 'btc-address-1',
              amount: {
                type: 'NumberUnit',
                unit: 'BTC',
                unitType: 'BTC',
                value: '0.06',
              },
            },
            {
              address: 'btc-address-2',
              amount: {
                type: 'NumberUnit',
                unit: 'BTC',
                unitType: 'BTC',
                value: '0.04',
              },
            },
          ],
          sentIndex: 1,
        },
        date: '2023-07-18T12:48:15.000Z',
        dropped: false,
        feeAmount: '0.25 BTC',
        feeCoinName: 'bitcoin',
        to: 'btc-address-2',
        txId: 'tx-3-to-expand',
        version: 1,
      },
      {
        coinAmount: '-0.06 BTC',
        coinName: 'bitcoin',
        confirmations: 0,
        currencies: {
          bitcoin: {
            BTC: 8,
            bits: 2,
            satoshis: 0,
          },
        },
        data: {
          sent: [
            {
              address: 'btc-address-1',
              amount: {
                type: 'NumberUnit',
                unit: 'BTC',
                unitType: 'BTC',
                value: '0.06',
              },
            },
            {
              address: 'btc-address-2',
              amount: {
                type: 'NumberUnit',
                unit: 'BTC',
                unitType: 'BTC',
                value: '0.04',
              },
            },
          ],
          sentIndex: 0,
        },
        date: '2023-07-18T12:48:15.000Z',
        dropped: false,
        feeAmount: '0.25 BTC',
        feeCoinName: 'bitcoin',
        to: 'btc-address-1',
        txId: 'tx-3-to-expand',
        version: 1,
      },
    ])

    await accountStatesAtom.set({
      value: {
        exodus_0: {
          bitcoin: {
            removeDropped: true,
            unrelatedData: {},
          },
        },
      },
    })
    await advance()
    expect(handler.mock.calls.length).toEqual(1)
  })

  test('returns txs for asset with noHistory feature', async () => {
    const handler = jest.fn()
    const txLogsAtom = createInMemoryAtom({})
    const accountStatesAtom = createInMemoryAtom({})
    const atom = activityTxsAtomDefinition.factory({
      txLogsAtom,
      accountStatesAtom,
      assetsModule: {
        getAsset: (assetName) => assets[assetName],
      },
    })

    atom.observe(handler)
    await txLogsAtom.set({
      value: {
        exodus_0: {
          shitCoin: TxSet.fromArray(fixtures.shitCoin),
        },
      },
    })
    await accountStatesAtom.set({
      value: {
        exodus_0: {},
      },
    })
    await advance()
    expect(handler.mock.calls.length).toEqual(1)
    expect(handler.mock.calls[0][0].exodus_0.shitCoin.map((tx) => tx.toJSON())).toEqual([
      {
        addresses: [
          {
            address: 'bc1qndnv4znc0dnnju2gcwddf4x42yunc4t9s2hna0',
            meta: {
              path: 'm/0/0',
            },
          },
        ],
        coinAmount: '0.00184082 LOL',
        coinName: 'shitCoin',
        confirmations: 1,
        currencies: {
          shitCoin: {
            KEK: 2,
            LOL: 8,
            OMG: 0,
          },
        },
        date: '2019-07-18T12:25:52.000Z',
        dropped: false,
        feeAmount: '0.00014238 LOL',
        feeCoinName: 'shitCoin',
        txId: 'tx-1',
        version: 1,
      },
    ])
  })

  test('returns different txs depending on activity options', async () => {
    const handler = jest.fn()
    const txLogsAtom = createInMemoryAtom({})
    const accountStatesAtom = createInMemoryAtom({ defaultValue: {} })
    const atom = activityTxsAtomDefinition.factory({
      txLogsAtom,
      accountStatesAtom,
      assetsModule: {
        getAsset: (assetName) => assets[assetName],
      },
    })

    atom.observe(handler)
    await txLogsAtom.set({
      value: {
        exodus_0: {
          eosio: TxSet.fromArray([
            {
              txId: 'tx-1',
              error: null,
              date: '2019-07-18T12:25:52.000Z',
              confirmations: 1,
              meta: {},
              token: null,
              dropped: false,
              coinAmount: '2 EOS',
              coinName: 'eosio',
              feeAmount: '0.1 EOS',
              feeCoinName: 'eosio',
              currencies: {
                eosio: {
                  larimer: 0,
                  EOS: 4,
                },
              },
            },
            {
              txId: 'tx-2',
              error: null,
              date: '2019-07-18T12:25:52.000Z',
              confirmations: 1,
              meta: {},
              token: null,
              dropped: false,
              coinAmount: '0.5 EOS',
              coinName: 'eosio',
              feeAmount: '0.1 EOS',
              feeCoinName: 'eosio',
              currencies: {
                eosio: {
                  larimer: 0,
                  EOS: 4,
                },
              },
            },
          ]),
        },
      },
    })
    await advance()
    expect(handler.mock.calls.length).toEqual(1)
    expect(handler.mock.calls[0][0].exodus_0.eosio.map((tx) => tx.toJSON())).toEqual([
      {
        coinAmount: '2 EOS',
        coinName: 'eosio',
        confirmations: 1,
        currencies: {
          eosio: {
            EOS: 4,
            larimer: 0,
          },
        },
        date: '2019-07-18T12:25:52.000Z',
        dropped: false,
        feeAmount: '0.1 EOS',
        feeCoinName: 'eosio',
        txId: 'tx-1',
        version: 1,
      },
      {
        coinAmount: '0.5 EOS',
        coinName: 'eosio',
        confirmations: 1,
        currencies: {
          eosio: {
            EOS: 4,
            larimer: 0,
          },
        },
        date: '2019-07-18T12:25:52.000Z',
        dropped: false,
        feeAmount: '0.1 EOS',
        feeCoinName: 'eosio',
        txId: 'tx-2',
        version: 1,
      },
    ])

    await accountStatesAtom.set({
      value: {
        exodus_0: {
          eosio: {
            filterSmallTxs: true,
          },
        },
      },
    })
    await advance()
    expect(handler.mock.calls.length).toEqual(2)
    expect(handler.mock.calls[1][0].exodus_0.eosio.map((tx) => tx.toJSON())).toEqual([
      {
        coinAmount: '2 EOS',
        coinName: 'eosio',
        confirmations: 1,
        currencies: {
          eosio: {
            EOS: 4,
            larimer: 0,
          },
        },
        date: '2019-07-18T12:25:52.000Z',
        dropped: false,
        feeAmount: '0.1 EOS',
        feeCoinName: 'eosio',
        txId: 'tx-1',
        version: 1,
      },
    ])
  })
})
