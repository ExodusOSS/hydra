import { asset as bitcoin } from '@exodus/bitcoin-meta'
import { TxSet, WalletAccount } from '@exodus/models'

import reduxModule from '../tx-logs/index.js'
import { setup } from './utils.js'

const walletAccount1 = new WalletAccount({ source: 'exodus', index: 1 })

const txJSON = {
  coinName: 'bitcoin',
  txId: '1',
  date: new Date('2023-01-01'),
  confirmations: 0,
  coinAmount: '0.1 BTC',
  addresses: [
    {
      address: 'abc',
      meta: { path: 'm/0/0' },
    },
  ],
  currencies: { bitcoin: bitcoin.currency },
}
const btcTxLog = TxSet.fromArray([txJSON])

describe(`create-active-asset-has-incoming-tx`, () => {
  it(`return true when has incoming tx`, () => {
    const { store, selectors, emitActiveWalletAccount, emitTxLogs } = setup({ reduxModule })

    expect(
      selectors.txLog.createActiveAssetHasIncomingTxSelector('bitcoin')(store.getState())
    ).toEqual(false)

    emitActiveWalletAccount(walletAccount1.toString())

    emitTxLogs({
      value: {
        [walletAccount1.toString()]: {
          bitcoin: btcTxLog,
        },
      },
    })

    expect(
      selectors.txLog.createActiveAssetHasIncomingTxSelector('bitcoin')(store.getState())
    ).toEqual(true)

    emitTxLogs({
      changes: {
        [walletAccount1.toString()]: {
          bitcoin: TxSet.fromArray([
            {
              ...txJSON,
              confirmations: 10,
            },
          ]),
        },
      },
    })

    expect(
      selectors.txLog.createActiveAssetHasIncomingTxSelector('bitcoin')(store.getState())
    ).toEqual(false)
  })
})
