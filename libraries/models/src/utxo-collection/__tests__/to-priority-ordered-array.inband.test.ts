import assets from '../../__tests__/assets.js'
import type { Utxo } from '../index.js'
import UtxoCollection from '../index.js'
import { fixture6 } from './fixtures/index.js'

const toSimpleValues = (utxo: Utxo) => ({
  confirmations: utxo.confirmations,
  rbfEnabled: utxo.rbfEnabled,
  value: utxo.value.toBaseString({ unit: true }),
})

const utxos = UtxoCollection.fromJSON(fixture6, { currency: assets.bitcoin.currency }).filter(
  (utxo) => utxo.value.toBaseNumber() > 91_000
)
const expected = [
  {
    confirmations: 12_564,
    value: '91822 satoshis',
  },
  {
    confirmations: 19_203,
    value: '307941 satoshis',
  },
  {
    confirmations: 856,
    value: '317656 satoshis',
  },
  {
    confirmations: 11_615,
    value: '630819 satoshis',
  },
  {
    confirmations: 9239,
    value: '640940 satoshis',
  },
  {
    confirmations: 14_364,
    value: '648384 satoshis',
  },
  {
    confirmations: 2963,
    value: '959334 satoshis',
  },
  {
    confirmations: 16_907,
    value: '1669643 satoshis',
  },
  {
    confirmations: 842,
    value: '2759003 satoshis',
  },
]
test('should utxos be ascending', () => {
  expect(utxos.toPriorityOrderedArray(false).map(toSimpleValues)).toEqual(expected)
  expect(utxos.toPriorityOrderedArray().map(toSimpleValues)).toEqual(expected)
})

test('should utxos be descending', () => {
  expect(utxos.toPriorityOrderedArray(true).map(toSimpleValues)).toEqual([...expected].reverse())
})
