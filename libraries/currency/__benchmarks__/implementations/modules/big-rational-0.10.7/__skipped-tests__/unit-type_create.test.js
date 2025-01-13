import { UnitType } from '..'
import { strict as assert } from 'assert'

const unitDefs = {
  satoshis: 0,
  bits: 2,
  BTC: 8,
}

test('create() child unit', function() {
  const bitcoin = UnitType.create(unitDefs)

  const unitNames = Object.keys(bitcoin.units)
  assert.deepEqual(unitNames, ['satoshis', 'bits', 'BTC'])

  assert(
    unitNames.every((unitName) => typeof bitcoin.units[unitName] === 'function'),
    'verify every unit is a factory function'
  )

  let distDef = {}
  Object.keys(bitcoin.units).forEach((unitName) => {
    distDef[unitName] = bitcoin.units[unitName].power
  })
  assert.deepEqual(unitDefs, distDef)

  assert.equal(bitcoin.baseUnit.unitName, 'satoshis')
  assert.equal(bitcoin.baseUnit.multiplier, 1)
  assert.equal(typeof bitcoin.baseUnit, 'function', 'baseUnit is a function')

  assert.equal(bitcoin.defaultUnit.unitName, 'BTC')
  assert.equal(bitcoin.defaultUnit.multiplier, 1e8)
  assert.equal(typeof bitcoin.defaultUnit, 'function', 'defaultUnit is a function')
})

test('create() throws on negative power', function() {
  assert.throws(() => {
    UnitType.create({
      USD: 0,
      cents: -2,
    })
  })
})
