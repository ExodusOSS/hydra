import { UnitType } from '../index.js'
import { strict as assert } from 'assert'

const unitDefs = {
  satoshis: 0,
  bits: 2,
  BTC: 8,
}

test('create() child unit', function () {
  const bitcoin = UnitType.create(unitDefs)

  const unitNames = Object.keys(bitcoin.units)
  assert.deepEqual(unitNames, ['satoshis', 'bits', 'BTC'])

  assert(
    unitNames.every((unitName) => typeof bitcoin.units[unitName] === 'function'),
    'verify every unit is a factory function'
  )

  const distDef = {}
  Object.keys(bitcoin.units).forEach((unitName) => {
    distDef[unitName] = bitcoin.units[unitName].power
  })
  assert.deepEqual(unitDefs, distDef)

  assert.equal(bitcoin.baseUnit.unitName, 'satoshis')
  assert.equal(bitcoin.baseUnit.multiplier.toNumber(), 1)
  assert.equal(typeof bitcoin.baseUnit, 'function', 'baseUnit is a function')

  assert.equal(bitcoin.defaultUnit.unitName, 'BTC')
  assert.equal(bitcoin.defaultUnit.multiplier.toNumber(), 1e8)
  assert.equal(typeof bitcoin.defaultUnit, 'function', 'defaultUnit is a function')

  const bitcoin2 = UnitType.create(unitDefs)
  assert.ok(bitcoin === bitcoin2, 'verify that the same unitDefs produces the same instance')
})

test('create() throws on negative power', function () {
  assert.throws(() => {
    UnitType.create({
      USD: 0,
      cents: -2,
    })
  })
})
