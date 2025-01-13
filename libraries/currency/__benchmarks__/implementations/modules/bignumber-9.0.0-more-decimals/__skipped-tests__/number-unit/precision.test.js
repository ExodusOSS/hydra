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

test('extra decimals rounded after mul', function() {
  assert.strictEqual(baseDecimal.mul(3).toString(), '4 satoshis', 'base unit decimals rounded')
  assert.strictEqual(
    defaultDecimal.mul(2).toString(),
    '2.46913578 BTC',
    'default unit decimals rounded at where the asset supports'
  )
})

test('40 decimals maximum precision', function() {
  const long = bitcoin.BTC('1.0000000001000000000200000000010000000002555')

  assert.strictEqual(
    long.toString(),
    '1.0000000001000000000200000000010000000002555 BTC',
    'accepts more than 40 decimals'
  )
  assert.strictEqual(
    long.add(one).toString(),
    '2.0000000001000000000200000000010000000003 BTC',
    'rounds at 40 decimals after operations'
  )
})

test('conversion rounds extra decimals', function() {
  const convert = conversion(bitcoin.BTC(2), dollar.USD(3000))

  const usd1 = dollar.USD(1000)
  const btc1 = convert(usd1) // 2/3 BTC

  assert.strictEqual(btc1.toString(), '0.66666667 BTC', 'conversion rounds extra decimals')
})

test('conversionByRate rounds extra decimals', function() {
  const convert = conversionByRate(bitcoin, dollar, 1500)

  const usd1 = dollar.USD(1000)
  const btc1 = convert(usd1) // 2/3 BTC

  assert.strictEqual(btc1.toString(), '0.66666667 BTC', 'conversionByRate rounds extra decimals')
})

test('toString and parsing maintain the same decimal length', function() {
  const long = bitcoin.BTC('1.00000000010000000002555')
  const long2 = bitcoin.parse(long.toString())

  assert.ok(long.equals(long2), 'maintained value after stringify and parsing')
})
