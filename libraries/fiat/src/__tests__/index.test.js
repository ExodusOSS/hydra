import assert from 'assert'

import units from '../index.js'

test('All fiats', () => {
  assert.strictEqual(units.EUR.label, 'Euro')
  assert.strictEqual(units.EUR.symbol, '€')
  assert.strictEqual(units.USD.label, 'United States Dollar')
  assert.strictEqual(units.USD.symbol, '$')
})

test('symbols only', () => {
  const syms = Object.keys(units)
  let idx = 0
  assert.strictEqual(syms[idx++], 'AED')
  assert.strictEqual(syms[idx++], 'ARS')
  assert.strictEqual(syms[idx++], 'AUD')
  assert.strictEqual(syms[idx++], 'BRL')
})
