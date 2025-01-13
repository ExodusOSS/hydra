import units, { hasLeftCurrencySymbol } from '../units.js'

describe('units', () => {
  test('object of units', () => {
    expect(units).toMatchSnapshot()
  })
  test('hasLeftCurrencySymbol CHF', () => {
    expect(hasLeftCurrencySymbol('CHF')).toEqual(false)
  })
  test('hasLeftCurrencySymbol USD', () => {
    expect(hasLeftCurrencySymbol('USD')).toEqual(true)
  })
  test('hasLeftCurrencySymbol undefined', () => {
    expect(hasLeftCurrencySymbol('ASDFASD')).toEqual(null)
  })
})
