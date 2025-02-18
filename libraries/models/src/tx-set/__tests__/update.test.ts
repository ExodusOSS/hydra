import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import { txs1 as _txs1 } from '../../tx/__tests__/fixtures/legacy/index.js'
import { normalizeTxsJSON } from '../../tx/utils.js'
import TxSet from '../index.js'

const txs1 = normalizeTxsJSON({ json: _txs1, assets })

test('update() should update one txset', (t) => {
  const txSet1 = TxSet.fromArray(txs1)
  const tx1updates = [
    {
      exchange: true,
      txId: 'AAAA58968997fadf2a8b47af1f0105067aa02153352d1df25061cf30c311aeeb',
      confirmations: 0,
      coinAmount: '-0.12 BTC',
      date: '2020-11-29T04:56:26.200Z',
      coinName: 'bitcoin',
      meta: {
        some: '123',
      },
      currencies: { bitcoin: { satoshis: 0, bits: 2, BTC: 8 } },
    },
    {
      exchange: false,
      txId: 'e7e699ce958c603b368807f4095f4f5b409e9c2b1139109ec997e1c6da5c6769',
      date: '2020-11-29T05:02:19.750Z',
      coinName: 'bitcoin',
      currencies: { bitcoin: { satoshis: 0, bits: 2, BTC: 8 } },
    },
  ]

  // @ts-expect-error -- txset.update is problematic as it calls tx.coinAmount!.toDefaultNumber() if a tx is to be updated, so a tx like the first above would throw if it had an existing tx in the set
  const txSet2 = txSet1.update(tx1updates)

  t.deepEqual(
    txSet2.toJSON(),
    [
      {
        txId: 'AAAA58968997fadf2a8b47af1f0105067aa02153352d1df25061cf30c311aeeb',
        date: '2020-11-29T04:56:26.200Z',
        confirmations: 0,
        meta: { some: '123' },
        coinAmount: '-0.12 BTC',
        coinName: 'bitcoin',
        currencies: { bitcoin: { satoshis: 0, bits: 2, BTC: 8 } },
        version: 1,
      },
      {
        txId: 'e7e699ce958c603b368807f4095f4f5b409e9c2b1139109ec997e1c6da5c6769',
        date: '2020-11-29T05:02:19.750Z',
        confirmations: 0,
        coinAmount: '0.00075027 BTC',
        coinName: 'bitcoin',
        currencies: { bitcoin: { satoshis: 0, bits: 2, BTC: 8 } },
        version: 1,
      },
    ],
    'txSet2 update is expected'
  )
  t.end()
})
