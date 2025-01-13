export const isOrderAmountLegacyNumber = (value) =>
  typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))

export const isOrderAmountLegacyDefaultUnitString = (value) =>
  typeof value === 'string' && /^\d+(\.\d+)?\s+\w+$/.test(value)
