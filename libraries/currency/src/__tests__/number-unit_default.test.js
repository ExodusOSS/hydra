import { strict as assert } from 'assert'
import { bitcoin, dollar } from './_fixtures.js'

test('toDefault() should convert to default unit', function () {
  const b1 = bitcoin.BTC(1.53)
  const b2 = b1.toDefault()
  assert.equal(b2.unitName, 'BTC')
  assert.equal(b2.toString(), '1.53 BTC')

  const b3 = bitcoin.defaultUnit(1.53)
  assert.deepEqual(b3.unitName, 'BTC')
  assert.deepEqual(b3.toString(), '1.53 BTC')
})

test('defaulUnit()', function () {
  assert.equal(bitcoin.defaultUnit, bitcoin.BTC)

  assert.equal(bitcoin.defaultUnit.unitName, 'BTC', 'bitcoin default unit is BTC')
  assert.equal(dollar.defaultUnit.unitName, 'USD', 'dollar default unit is USD')
})
