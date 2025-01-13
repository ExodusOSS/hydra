import { isOrderAmountLegacyDefaultUnitString } from '../utils.js'

test('deserializes legacy order amount string', () => {
  expect(isOrderAmountLegacyDefaultUnitString('0 BTC')).toBe(true)
  expect(isOrderAmountLegacyDefaultUnitString('0.0015 BTC')).toBe(true)
  expect(isOrderAmountLegacyDefaultUnitString('BUY BTC')).toBe(false)
  expect(isOrderAmountLegacyDefaultUnitString('0. BTC')).toBe(false)
  expect(isOrderAmountLegacyDefaultUnitString('0 BTC 1')).toBe(false)
})
