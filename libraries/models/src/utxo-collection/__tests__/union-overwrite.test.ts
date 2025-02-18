import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import Address from '../../address/index.js'
import UtxoCollection from '../index.js'

test('should overwrite existing data with unionOverwrite', function (t) {
  const utxos1 = createUtxos({ confirmations: 0 })
  const utxos2 = createUtxos({ confirmations: 1 })
  const result = utxos1.unionOverwrite(utxos2).toArray()
  t.same(result[0]!.confirmations, 1)
  t.same(result.length, 1)
  t.end()
})

test('not overwrite existing data with union', function (t) {
  const utxos1 = createUtxos({ confirmations: 0 })
  const utxos2 = createUtxos({ confirmations: 1 })
  const result = utxos1.union(utxos2).toArray()
  t.same(result[0]!.confirmations, 0)
  t.same(result.length, 1)
  t.end()
})

function createUtxos({ confirmations }: { confirmations: number }) {
  return UtxoCollection.fromArray([
    {
      txId: 'a',
      vout: 0,
      value: assets.bitcoin.currency.defaultUnit(1),
      address: Address.create('a'),
      confirmations,
    },
  ])
}
