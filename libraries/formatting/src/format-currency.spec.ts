import { formatCurrency } from './currency.js'

describe('formatCurrency()', () => {
  test('edge cases', () => {
    expect(formatCurrency(NaN)).toBe('0.00') // NaN => 0
    expect(formatCurrency(NaN, { nanZero: false })).toBe('NaN') // NaN => NaN
    expect(formatCurrency(NaN, { minFraction: 2, maxFraction: 2 })).toBe('0.00') // 0 => 0.00 (min, max)

    // @ts-expect-error testing
    expect(formatCurrency([])).toBe('0.00')
    // @ts-expect-error testing
    expect(formatCurrency([3, 4])).toBe('34.00')

    expect(formatCurrency()).toBe('0.00')
    // @ts-expect-error testing
    expect(formatCurrency(null)).toBe('0.00')
  })

  test('format numbers', () => {
    expect(formatCurrency(0)).toBe('0.00')
    expect(formatCurrency(10_000_000.15)).toBe('10,000,000.15')
    expect(formatCurrency(1.000_000_04, { maxFraction: 10 })).toBe('1.00000004')

    expect(formatCurrency(10_000_000.000_000_04)).toBe('10,000,000.00')

    expect(formatCurrency(0.000_000_000_004_453_5, { maxFraction: 15 })).toBe('0.000000000004454')
    expect(formatCurrency(0.000_000_000_004_453_5, { maximumSignificantDigits: 2 })).toBe(
      '0.0000000000045'
    )

    expect(formatCurrency(0, { minFraction: 2, maxFraction: 2 })).toBe('0.00') // 0 => 0.00 (min, max)
  })

  test('format currency', () => {
    expect(formatCurrency(10_000.01)).toBe('10,000.01') // 10000.01 => 10,000.01
    expect(formatCurrency(10_000.01, { format: '%s%v', symbol: '$' })).toBe('$10,000.01') // 10000.01 => $10,000.01
    expect(formatCurrency(10_000.01, { format: '%v %c', code: 'USD' })).toBe('10,000.01 USD') // 10,000.01 USD
    expect(formatCurrency(10_000.01, { format: '%v %c', code: 'RUB' })).toBe('10,000.01 RUB') // 10,000.01 RUB
    expect(formatCurrency(10_000.01, { format: '%s%v %c', code: 'EURO', symbol: '€' })).toBe(
      '€10,000.01 EURO'
    ) // €10,000.01 EURO

    expect(formatCurrency('$100 USD', { format: '%v %c', code: 'USD' })).toBe('100.00 USD')
  })

  test('call Intl.NumberFormat correctly', () => {
    // @ts-expect-error testing
    global.Intl.NumberFormat = jest.fn((locale, opts) => ({
      format: () => ({ locale, opts }),
    }))

    formatCurrency(0, { maxSignificant: 3 })
    expect(global.Intl.NumberFormat).toBeCalledWith(['en-US'], {
      locale: 'en-US',
      localeMatcher: 'best fit',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      maximumSignificantDigits: 3,
      nanZero: true,
      style: 'decimal',
      useGrouping: true,
    })
    formatCurrency(0, { maximumSignificantDigits: 3 })
    expect(global.Intl.NumberFormat).toBeCalledWith(['en-US'], {
      locale: 'en-US',
      localeMatcher: 'best fit',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      maximumSignificantDigits: 3,
      nanZero: true,
      style: 'decimal',
      useGrouping: true,
    })

    formatCurrency(0, { minSignificant: 3 })
    expect(global.Intl.NumberFormat).toBeCalledWith(['en-US'], {
      locale: 'en-US',
      localeMatcher: 'best fit',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      minimumSignificantDigits: 3,
      nanZero: true,
      style: 'decimal',
      useGrouping: true,
    })

    formatCurrency(0, { minimumSignificantDigits: 3 })

    expect(global.Intl.NumberFormat).toBeCalledWith(['en-US'], {
      locale: 'en-US',
      localeMatcher: 'best fit',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      minimumSignificantDigits: 3,
      nanZero: true,
      style: 'decimal',
      useGrouping: true,
    })

    formatCurrency(0, { maxInteger: 3 })

    expect(global.Intl.NumberFormat).toBeCalledWith(['en-US'], {
      locale: 'en-US',
      localeMatcher: 'best fit',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      maximumIntegerDigits: 3,
      nanZero: true,
      style: 'decimal',
      useGrouping: true,
    })

    formatCurrency(0, { locale: 'ka-GE' })

    expect(global.Intl.NumberFormat).toBeCalledWith(['ka-GE'], {
      locale: 'ka-GE',
      localeMatcher: 'best fit',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      nanZero: true,
      style: 'decimal',
      useGrouping: true,
    })
  })
})
