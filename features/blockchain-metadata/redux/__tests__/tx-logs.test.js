import { WalletAccount, TxSet } from '@exodus/models'
import { asset as bitcoin } from '@exodus/bitcoin-meta'
import reduxModule from '../tx-logs/index.js'
import { setup } from './utils.js'

const { id } = reduxModule
const walletAccount0 = WalletAccount.DEFAULT
const walletAccount1 = new WalletAccount({ source: 'exodus', index: 1 })

const btcTxLog = TxSet.fromArray([
  // legacy
  {
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
  },
  {
    coinName: 'bitcoin',
    txId: '2',
    date: new Date('2023-01-01'),
    confirmations: 1,
    coinAmount: '0.1 BTC',
    addresses: [
      {
        address: 'abc',
        meta: { path: 'm/0/0' },
      },
    ],
    currencies: { bitcoin: bitcoin.currency },
  },
])

describe(`${id} selectors`, () => {
  it(`should return ${id}`, () => {
    const { store, selectors, emitActiveWalletAccount, emitTxLogs } = setup({ reduxModule })

    const isLoaded = (walletAccount) =>
      selectors.txLog.createIsWalletAccountLoadedSelector(walletAccount.toString())(
        store.getState()
      )

    const isActiveWalletAccountLoaded = () =>
      selectors.txLog.isActiveWalletAccountLoaded(store.getState())

    const get1stBitcoinTxLog = selectors.txLog.createAssetSourceSelector({
      assetName: 'bitcoin',
      walletAccount: walletAccount0.toString(),
    })

    const get2ndBitcoinTxLog = selectors.txLog.createAssetSourceSelector({
      assetName: 'bitcoin',
      walletAccount: walletAccount1.toString(),
    })

    emitActiveWalletAccount(walletAccount1.toString())

    expect(isLoaded(walletAccount0)).toEqual(false)
    expect(isLoaded(walletAccount1)).toEqual(false)
    expect(get1stBitcoinTxLog(store.getState())).toEqual(TxSet.EMPTY)
    expect(get2ndBitcoinTxLog(store.getState())).toEqual(TxSet.EMPTY)

    emitTxLogs({
      value: {
        [walletAccount1.toString()]: {
          bitcoin: btcTxLog,
        },
      },
    })

    expect(isLoaded(walletAccount0)).toEqual(false)
    expect(isLoaded(walletAccount1)).toEqual(true)
    expect(isActiveWalletAccountLoaded()).toEqual(true)
    expect(get1stBitcoinTxLog(store.getState())).toEqual(TxSet.EMPTY)
    expect(get2ndBitcoinTxLog(store.getState())).toEqual(btcTxLog)
    expect(selectors.txLog.getHasHistory(store.getState())(walletAccount0.toString())).toEqual(
      false
    )
    expect(selectors.txLog.getHasHistory(store.getState())(walletAccount1.toString())).toEqual(true)
    expect(selectors.txLog.getHasHistory(store.getState())()).toEqual(true)

    expect(
      selectors.txLog.createActiveAssetIncomingTxSelector('bitcoin')(store.getState())
    ).toHaveLength(1)
    expect(
      selectors.txLog.createActiveAssetIncomingTxSelector('bitcoin')(store.getState())[0].txId
    ).toEqual('1')

    emitTxLogs({
      changes: {
        [walletAccount1.toString()]: {
          bitcoin: TxSet.EMPTY,
        },
      },
    })

    expect(get2ndBitcoinTxLog(store.getState())).toEqual(TxSet.EMPTY)
  })
})
