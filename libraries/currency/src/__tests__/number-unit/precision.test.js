import assert from 'assert'
import { bitcoin, dollar } from '../_fixtures.js'
import conversion from '../../conversion.js'
import conversionByRate from '../../conversion-by-rate.js'

const baseDecimal = bitcoin.satoshis('1.2345')
const defaultDecimal = bitcoin.BTC('1.2345678901234')
const one = bitcoin.BTC(1)

test('extra decimals NOT supported', function () {
  assert.strictEqual(baseDecimal.toString(), '1 satoshis', 'base unit does not have decimals')
  assert.strictEqual(
    defaultDecimal.toString(),
    '1.23456789 BTC',
    'default unit does not have more decimals than the asset supports'
  )
})

test('no extra decimals after mul', function () {
  assert.strictEqual(
    baseDecimal.mul(3.5).toString(),
    '3 satoshis',
    'base unit does not have decimals'
  )
  assert.strictEqual(
    defaultDecimal.mul(2.2).toString(),
    '2.71604935 BTC',
    'default unit does not have more decimals than the asset supports'
  )
})

test(`maximum displayed precision is the asset's`, function () {
  const long = bitcoin.BTC('1.00000000010000000002555')

  assert.strictEqual(long.toString(), '1 BTC', `Never outputs more than the asset's decimals`)
  assert.ok(
    long.add(one).equals(bitcoin.BTC('2.00000000010000000002555')),
    '2 BTC',
    'Operations only support the number of decimals the asset does'
  )
})

test('conversion clips extra decimals', function () {
  const convert = conversion(bitcoin.BTC(2), dollar.USD(3000))

  const usd1 = dollar.USD(1000)
  const btc1 = convert(usd1) // 2/3 BTC

  assert.strictEqual(btc1.toString(), '0.66666666 BTC', 'conversion clips extra decimals')
})

test('conversionByRate clips extra decimals', function () {
  const convert = conversionByRate(bitcoin, dollar, 1500)

  const usd1 = dollar.USD(1000)
  const btc1 = convert(usd1) // 2/3 BTC

  assert.strictEqual(btc1.toString(), '0.66666666 BTC', 'conversionByRate clips extra decimals')
})

test(`toString and parsing clips to the asset's decimal precision`, function () {
  const long = bitcoin.BTC('1.0000000190000000002555')
  const long2 = bitcoin.parse(long.toString())

  assert.strictEqual(long.toString(), '1.00000001 BTC', `clips to asset's precision`)
  assert.ok(long.equals(long2), `toString and parse match`)
})
