import type NumberUnit from '@exodus/currency'

import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'
import { fixture1 as fixture, fixture6, fixture7 } from './fixtures/index.js'

const feeEstimatorArgs = {
  feePerKB: assets.bitcoin.currency.ZERO,
  options: { outputs: ['P2PKH', 'P2PKH'] },
}

const getFeeEstimator = (feePerKB: NumberUnit, opts: any) => {
  // half-assed estimation
  return ({ inputs = opts.inputs, outputs = opts.outputs }) => {
    if (inputs instanceof UtxoCollection) {
      inputs = [...inputs].map((utxo) => utxo.script || null)
    }

    const size =
      4 +
      4 +
      1 +
      inputs.reduce((t: number) => {
        const scriptSigLength = 107 // depends from signatures, maximum is 107
        return t + 32 + 4 + 1 + scriptSigLength + 4
      }, 0) +
      1 +
      outputs.reduce((t: number, output: string) => {
        const scriptPubKeyLength = { P2PKH: 25, P2SH: 23, P2WPKH: 21, P2WSH: 33 }[output]
        return t + 8 + 1 + scriptPubKeyLength!
      }, 0)

    const feeRaw = Math.ceil((feePerKB.toBaseNumber() * size) / 1000)
    const currency = feePerKB.unitType
    return currency.baseUnit(feeRaw)
  }
}

test('should select utxos', (t) => {
  const utxos = UtxoCollection.fromJSON(fixture, { currency: assets.bitcoin.currency })

  const amount = assets.bitcoin.currency.BTC(1)
  const [selected, remaining] = utxos.select(
    amount,
    getFeeEstimator(feeEstimatorArgs.feePerKB, feeEstimatorArgs.options)
  )

  t.deepEquals(
    remaining!.union(selected!).toJSON(),
    utxos.toJSON(),
    'remaining + selected === original'
  )
  t.deepEquals(
    utxos.difference(remaining!).toJSON(),
    selected!.toJSON(),
    'original - remaining === selected'
  )
  t.deepEquals(
    utxos.difference(selected!).toJSON(),
    remaining!.toJSON(),
    'original - selected === remaining'
  )

  t.equal(selected!.size, 1, 'size === 1')
  t.true(selected!.value.gte(amount), 'selected is at least greater than or equal than total')
  t.true(
    selected!.txIds.includes('17abd6c7481efe452f92ff5d55bb638bba9c0c1edc61703c7a7b3ecdf5b1f639'),
    'include tx id'
  )

  t.end()
})

test('should select utxos', (t) => {
  const utxos = UtxoCollection.fromJSON(fixture, { currency: assets.bitcoin.currency })

  const amount = assets.bitcoin.currency.BTC(1)
  const feePerKB = assets.bitcoin.currency.bits(30_000)
  const total = amount.add(feePerKB)
  const [selected, remaining] = utxos.select(
    amount,
    getFeeEstimator(feePerKB, feeEstimatorArgs.options)
  )

  t.deepEquals(
    remaining!.union(selected!).toJSON(),
    utxos.toJSON(),
    'remaining + selected === original'
  )
  t.deepEquals(
    utxos.difference(remaining!).toJSON(),
    selected!.toJSON(),
    'original - remaining === selected'
  )
  t.deepEquals(
    utxos.difference(selected!).toJSON(),
    remaining!.toJSON(),
    'original - selected === remaining'
  )

  t.equal(selected!.size, 2, 'size === 2')
  t.true(selected!.value.gte(total), 'selected is at least greater than or equal than total')
  t.true(
    selected!.txIds.includes('17abd6c7481efe452f92ff5d55bb638bba9c0c1edc61703c7a7b3ecdf5b1f639'),
    'include tx id'
  )
  t.true(
    selected!.txIds.includes('6bd212961be413c851207e327c04ed9bd92fc5aa0194e968da3c40c8316d3f24'),
    'include tx id'
  )

  t.end()
})

test('should select utxos', (t) => {
  const utxos = UtxoCollection.fromJSON(fixture, { currency: assets.bitcoin.currency })

  const amount = assets.bitcoin.currency.BTC(9)
  const [selected, remaining] = utxos.select(
    amount,
    getFeeEstimator(feeEstimatorArgs.feePerKB, feeEstimatorArgs.options)
  )

  t.deepEquals(
    remaining!.union(selected!).toJSON(),
    utxos.toJSON(),
    'remaining + selected === original'
  )
  t.deepEquals(
    utxos.difference(remaining!).toJSON(),
    selected!.toJSON(),
    'original - remaining === selected'
  )
  t.deepEquals(
    utxos.difference(selected!).toJSON(),
    remaining!.toJSON(),
    'original - selected === remaining'
  )

  t.equal(selected!.size, 4, 'size === 4')
  t.true(selected!.value.gte(amount), 'selected is at least greater than or equal than total')
  // commented out because I changed the selection algorithm... now it doesn't sort by addresses anymore, simply smallest to greatest
  // this was the largest in the fixture, hence the reason it's not selected anymore
  // t.true(selected.txIds.includes('7bd212961be413c851207e327c04ed9bd92fc5aa0194e968da3c40c8316d3f24'), 'include tx id')
  t.true(
    selected!.txIds.includes('6bd212961be413c851207e327c04ed9bd92fc5aa0194e968da3c40c8316d3f24'),
    'include tx id'
  )

  t.end()
})

test('should select confirmed utxos first', (t) => {
  const utxos = UtxoCollection.fromJSON(fixture7, { currency: assets.bitcoin.currency })

  const amount = assets.bitcoin.currency.BTC(2)
  const [selected, remaining] = utxos.select(
    amount,
    getFeeEstimator(feeEstimatorArgs.feePerKB, feeEstimatorArgs.options)
  )

  t.deepEquals(
    remaining!.union(selected!).toJSON(),
    utxos.toJSON(),
    'remaining + selected === original'
  )
  t.deepEquals(
    utxos.difference(remaining!).toJSON(),
    selected!.toJSON(),
    'original - remaining === selected'
  )
  t.deepEquals(
    utxos.difference(selected!).toJSON(),
    remaining!.toJSON(),
    'original - selected === remaining'
  )

  t.true(selected!.value.gte(amount), 'selected is at least greater than or equal than total')
  t.false(
    selected!.txIds.includes('6bd212961be413c851207e327c04ed9bd92fc5aa0194e968da3c40c8316d3f24'),
    'does not include unconfirmed tx'
  )

  t.end()
})

test('should select unconfirmed utxos when needed', (t) => {
  const utxos = UtxoCollection.fromJSON(fixture7, { currency: assets.bitcoin.currency })

  const amount = assets.bitcoin.currency.BTC(10)
  const [selected, remaining] = utxos.select(
    amount,
    getFeeEstimator(feeEstimatorArgs.feePerKB, feeEstimatorArgs.options)
  )

  t.deepEquals(
    remaining!.union(selected!).toJSON(),
    utxos.toJSON(),
    'remaining + selected === original'
  )
  t.deepEquals(
    utxos.difference(remaining!).toJSON(),
    selected!.toJSON(),
    'original - remaining === selected'
  )
  t.deepEquals(
    utxos.difference(selected!).toJSON(),
    remaining!.toJSON(),
    'original - selected === remaining'
  )

  t.true(selected!.value.gte(amount), 'selected is at least greater than or equal than total')
  t.true(
    selected!.txIds.includes('6bd212961be413c851207e327c04ed9bd92fc5aa0194e968da3c40c8316d3f24'),
    'includes unconfirmed tx'
  )

  t.end()
})

test('should select utxos (SELECT ALL)', (t) => {
  const utxos = UtxoCollection.fromJSON(fixture, { currency: assets.bitcoin.currency })

  const amount = assets.bitcoin.currency.BTC(15)
  const [selected, remaining] = utxos.select(
    amount,
    getFeeEstimator(feeEstimatorArgs.feePerKB, feeEstimatorArgs.options)
  )

  t.deepEquals(
    remaining!.union(selected!).toJSON(),
    utxos.toJSON(),
    'remaining + selected === original'
  )
  t.deepEquals(
    utxos.difference(remaining!).toJSON(),
    selected!.toJSON(),
    'original - remaining === selected'
  )
  t.deepEquals(
    utxos.difference(selected!).toJSON(),
    remaining!.toJSON(),
    'original - selected === remaining'
  )

  t.equal(selected!.size, 5, 'size === 5')
  t.true(selected!.value.gte(amount), 'selected is at least greater than or equal than total')

  t.true(remaining!.empty, 'remaining is empty')

  t.end()
})

test('should select utxos (SELECT NONE)', (t) => {
  const utxos = UtxoCollection.fromJSON(fixture, { currency: assets.bitcoin.currency })

  const amount = assets.bitcoin.currency.BTC(100)
  const [selected, remaining] = utxos.select(
    amount,
    getFeeEstimator(feeEstimatorArgs.feePerKB, feeEstimatorArgs.options)
  )

  t.deepEquals(
    remaining!.union(selected!).toJSON(),
    utxos.toJSON(),
    'remaining + selected === original'
  )
  t.deepEquals(
    utxos.difference(remaining!).toJSON(),
    selected!.toJSON(),
    'original - remaining === selected'
  )
  t.deepEquals(
    utxos.difference(selected!).toJSON(),
    remaining!.toJSON(),
    'original - selected === remaining'
  )

  t.equal(selected!.size, 0, 'size === 0')
  t.true(selected!.value.equals(assets.bitcoin.currency.ZERO), 'zero')
  t.true(selected!.empty, 'selected is empty')

  t.end()
})

test('should select utxos (SELECT ALL)', (t) => {
  const utxos = UtxoCollection.fromJSON(fixture6, { currency: assets.bitcoin.currency })
  const feePerKB = assets.bitcoin.currency.satoshis(223_946)

  // yes, this has more than the 8 decimal places
  const amount = assets.bitcoin.currency.BTC('0.070613050000000002')
  const [selected, remaining] = utxos.select(
    amount,
    getFeeEstimator(feePerKB, feeEstimatorArgs.options)
  )
  t.equal(remaining!.size, 0, 'no remaining')
  t.equal(utxos.size, selected!.size, 'selected all')
  t.deepEquals(utxos.toPriorityOrderedArray(), selected!.toPriorityOrderedArray(), 'selected all')

  expect(utxos.toPriorityOrderedArray(false)).toEqual(selected!.toPriorityOrderedArray())
  expect(utxos.toPriorityOrderedArray(true)).not.toEqual(selected!.toPriorityOrderedArray())
})

test('should select utxos (SELECT NONE)', (t) => {
  const utxos = UtxoCollection.fromJSON(fixture6, { currency: assets.bitcoin.currency })
  const feePerKB = assets.bitcoin.currency.satoshis(230_524)

  // yes, this has more than the 8 decimal places
  const amount = assets.bitcoin.currency.BTC('0.085308990000000002')
  const [selected] = utxos.select(amount, getFeeEstimator(feePerKB, feeEstimatorArgs.options))
  t.equal(selected!.size, 0, 'no selected')

  t.end()
})

test('select from EMPTY', (t) => {
  const utxos = UtxoCollection.createEmpty({ currency: assets.bitcoin.currency })
  const amount1 = assets.bitcoin.currency.BTC(0)
  const [selected1, remaining1] = utxos.select(amount1, () => assets.bitcoin.currency.ZERO)
  t.true(selected1!.isEmpty(), 'selected is empty')
  t.true(remaining1!.isEmpty(), 'remaining is empty')

  const amount2 = assets.bitcoin.currency.BTC(1)
  const [selected2, remaining2] = utxos.select(amount2, () => assets.bitcoin.currency.ZERO)
  t.true(selected2!.isEmpty(), 'selected is empty')
  t.true(remaining2!.isEmpty(), 'remaining is empty')

  t.end()
})
