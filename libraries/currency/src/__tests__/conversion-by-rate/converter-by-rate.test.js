import assert from 'assert'
import * as currencies from '../_fixtures.js'
import rates from '../_rate_fixtures.cjs'
import conversionByRate from '../../conversion-by-rate.js'
import conversion from '../../conversion.js'

const { bitcoin, ethereum, neo } = currencies

test('conversionByRate should valid params', function () {
  assert.throws(() => conversionByRate('test', ethereum, 10), 'ut1 has to be a UnitType')
  assert.throws(() => conversionByRate(bitcoin, {}, 10), 'ut2 has to be a UnitType')
  assert.throws(
    () => conversionByRate(bitcoin, {}, 10, { unit1: 'wei' }),
    'unit1 has to be from ut1'
  )
  assert.throws(
    () => conversionByRate(bitcoin, {}, 10, { unit: 'satoshis', unit2: 'satoshis' }),
    'unit2 has to be from ut2'
  )
})

test('conversionByRate should convert amounts', function () {
  const convert = conversionByRate(bitcoin, ethereum, 10)

  const btc1 = bitcoin.BTC(2)
  const expected1 = ethereum.ETH(20)
  const actual1 = convert(btc1)
  assert.strictEqual(actual1.toString(), expected1.toString())

  const eth2 = ethereum.ETH(40)
  const expected2 = bitcoin.BTC(4)
  const actual2 = convert(eth2)
  assert.strictEqual(actual2.toString(), expected2.toString())

  const btc3 = bitcoin.satoshis(3 * 1e8)
  const expected3 = ethereum.ETH(30)
  const actual3 = convert(btc3)
  assert.strictEqual(actual3.toString(), expected3.toString())

  const eth4 = ethereum.finney(50 * 1e3)
  const expected4 = bitcoin.BTC(5)
  const actual4 = convert(eth4)
  assert.strictEqual(actual4.toString(), expected4.toString())
})

test('conversionByRate should accept different unit rates', function () {
  const convert = conversionByRate(bitcoin, ethereum, 10, { unit1: 'satoshis', unit2: 'wei' })

  const btc1 = bitcoin.satoshis(2)
  const expected1 = ethereum.wei(20)
  const actual1 = convert(btc1)
  assert.strictEqual(actual1.toString(), expected1.toString())

  const eth2 = ethereum.wei(40)
  const expected2 = bitcoin.satoshis(4)
  const actual2 = convert(eth2)
  assert.strictEqual(actual2.toString(), expected2.toString())

  const btc3 = bitcoin.BTC(3 / 1e8)
  const expected3 = ethereum.wei(30)
  const actual3 = convert(btc3)
  assert.strictEqual(actual3.toString(), expected3.toString())

  const eth4 = ethereum.finney(50 / 1e7)
  const expected4 = bitcoin.BTC(5).to('satoshis')
  const actual4 = convert(eth4)
  assert.strictEqual(actual4.toString(), expected4.toString())
})

test('conversionByRate matches rate fixtures', function () {
  rates.forEach(({ id, from, to, rate, conversionByRate: expected }) => {
    const currency1 = currencies[from]
    const currency2 = currencies[to]

    const amount1 = currency1.defaultUnit(1)
    const amount2 = currency2.defaultUnit(1)

    const convert = conversionByRate(currency1, currency2, rate)

    const actualFromSide = convert(amount1).toString()
    const actualToSide = convert(amount2).toString()

    // we don't want them all print out as tests, too many, so we let assert throw and stop
    if (actualFromSide !== expected.fromSide) {
      assert.strictEqual(
        actualFromSide,
        expected.fromSide,
        `id ${id}: ${from}_${to} ${rate} - from side`
      )
    }

    if (actualToSide !== expected.toSide) {
      assert.strictEqual(actualToSide, expected.toSide, `id ${id}: ${from}_${to} ${rate} - to side`)
    }
  })

  // no assert throws, all matches
  assert.ok(true, 'matches')
})

test('conversionByRate fixes the precision issue conversion faces', function () {
  const neoRate = 0.123_515_1

  const neoRateAmount = neo.defaultUnit(neoRate)

  const convert1 = conversion(bitcoin.BTC(1), neoRateAmount)
  const convert2 = conversionByRate(bitcoin, neo, neoRate)

  const amountToConvert = bitcoin.BTC(10)
  const expectedAmount = neo.NEO(10 * neoRate)

  assert.notStrictEqual(
    convert1(amountToConvert).toString(),
    expectedAmount.toString(),
    'conversion rounded rate down to 0'
  )
  assert.strictEqual(
    convert2(amountToConvert).toString(),
    expectedAmount.toString(),
    'conversionByRate used the correct rate'
  )
})

test('conversionByRate div by 0, thrown error as expected', function () {
  try {
    ethereum.wei(100).div('0.00')
  } catch (err) {
    assert.strictEqual(
      String(err.message),
      'Invalid division by 0',
      'error message matches usage in conversion-by-rate'
    )
  }
})
