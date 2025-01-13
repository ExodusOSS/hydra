import assert from 'assert'
import { bitcoin, dollar } from '../_fixtures'
import conversion from '../../conversion'
import conversionByRate from '../../conversion-by-rate'

const baseDecimal = bitcoin.satoshis('1.2345')
const defaultDecimal = bitcoin.BTC('1.2345678901234')
const one = bitcoin.BTC(1)

test('extra decimals supported', function() {
  assert.strictEqual(baseDecimal.toString(), '1.2345 satoshis', 'base unit has decimals')
  assert.strictEqual(
    defaultDecimal.toString(),
    '1.2345678901234 BTC',
    'default unit has more decimals than the asset supports'
  )
})

test('extra decimals after add', function() {
  assert.strictEqual(
    baseDecimal.add(one).toString(),
    '100000001.2345 satoshis',
    'base unit has decimals'
  )
  assert.strictEqual(
    defaultDecimal.add(one).toString(),
    '2.2345678901234 BTC',
    'default unit has more decimals than the asset supports'
  )
})

test('extra decimals after sub', function() {
  assert.strictEqual(
    baseDecimal.sub(one).toString(),
    '-99999998.7655 satoshis',
    'base unit has decimals'
  )
  assert.strictEqual(
    defaultDecimal.sub(one).toString(),
    '0.2345678901234 BTC',
    'default unit has more decimals than the asset supports'
  )
})

test('extra decimals NOT rounded after mul', function() {
  assert.strictEqual(
    baseDecimal.mul(3).toString(),
    '3.7035 satoshis',
    'base unit decimals NOT rounded'
  )
  assert.strictEqual(
    defaultDecimal.mul(2).toString(),
    '2.4691357802468 BTC',
    'default unit decimals NOT rounded at where the asset supports'
  )
})

test('20 decimals maximum displayed precision', function() {
  const long = bitcoin.BTC('1.00000000010000000002555')

  assert.strictEqual(
    long.toString(),
    '1.00000000010000000002 BTC',
    'Never outputs more than 20 decimals'
  )
  assert.ok(
    long.add(one).equals(bitcoin.BTC('2.00000000010000000002555')),
    '2.00000000010000000002555 BTC',
    'Supports more than 20 decimal for operations'
  )
})

test('conversion DOES NOT round extra decimals', function() {
  const convert = conversion(bitcoin.BTC(2), dollar.USD(3000))

  const usd1 = dollar.USD(1000)
  const btc1 = convert(usd1) // 2/3 BTC

  assert.strictEqual(
    btc1.toString(),
    '0.66666666666666666666 BTC',
    'conversion rounds extra decimals'
  )
})

test('conversionByRate does NOT round extra decimals', function() {
  const convert = conversionByRate(bitcoin, dollar, 1500)

  const usd1 = dollar.USD(1000)
  const btc1 = convert(usd1) // 2/3 BTC

  assert.strictEqual(
    btc1.toString(),
    '0.66666666666666666666 BTC',
    'conversionByRate rounds extra decimals'
  )
})

test('toString and parsing DO NOT maintain the same decimal length', function() {
  const long = bitcoin.BTC('1.00000000010000000002555')
  const long2 = bitcoin.parse(long.toString())

  assert.ok(
    long.toFixed(20, 'floor').equals(long2),
    'clips to 20 decimals after stringify and parsing'
  )
})
