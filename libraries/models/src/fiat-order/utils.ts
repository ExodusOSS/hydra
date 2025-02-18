export const isOrderAmountLegacyNumber = (value: unknown) =>
  typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))

export const isOrderAmountLegacyDefaultUnitString = (value: unknown) =>
  typeof value === 'string' && /^\d+(\.\d+)?\s+\w+$/u.test(value)
