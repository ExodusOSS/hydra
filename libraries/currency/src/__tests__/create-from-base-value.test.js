import { createFromBaseValue } from '../create-from-base-value.js'

test('createFromBaseValue', () => {
  expect(
    createFromBaseValue({ value: 100, symbol: 'USD', power: 2 }).toDefaultString({ unit: true })
  ).toEqual('1 USD')
})
