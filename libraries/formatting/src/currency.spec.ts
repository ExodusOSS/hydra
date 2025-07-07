import { formatCurrency, formatNumber } from './currency.js'

describe('currency', () => {
  describe('formatNumber', () => {
    it('should format with decimal params', () => {
      expect(formatNumber('1234.123456789012345678')).toEqual('1,234')
    })

    it('should format with custom decimal params', () => {
      expect(formatNumber('1234.123456789012345678', 3)).toEqual('1,234.123')
    })
  })

  describe('formatCurrency', () => {
    it('should format with maximumFractionDigits option', () => {
      expect(formatCurrency('1234.123456789012345678', { maximumFractionDigits: 8 })).toEqual(
        '1,234.12345679'
      )
    })

    it('should format with deprecated maxFraction option', () => {
      expect(formatCurrency('1234.123456789012345678', { maxFraction: 8 })).toEqual(
        '1,234.12345679'
      )
    })
  })

  describe('formatCurrency to integers', () => {
    // Testing direct format to integers (and usage in eosio/utils)
    const opts = { minFraction: 0, maxFraction: 0 }

    it('should round and format positive values to integers', () => {
      expect(formatCurrency(10.9999, opts)).toBe('11')
      expect(formatCurrency('10.9999', opts)).toBe('11')
      expect(formatCurrency(10.5, opts)).toBe('11')
      expect(formatCurrency(10.499_999_99, opts)).toBe('10')
      expect(formatCurrency(10.0001, opts)).toBe('10')
      expect(formatCurrency(0.499_999_99, opts)).toBe('0')

      expect(formatCurrency(0.499_999_999_999_999_99, opts)).toBe('1')
      expect(formatCurrency(0.5, opts)).toBe('1')
      expect(formatCurrency(0.999, opts)).toBe('1')
      expect(formatCurrency(0, opts)).toBe('0')

      expect(formatCurrency(10.499_999_999_999_999_9, opts)).toBe('11')
      // expect(formatCurrency(1000000000000000.49, opts)).toBe('1,000,000,000,000,001')

      expect(formatCurrency(1_000_000_000_000_000_000.5, opts)).toBe('1,000,000,000,000,000,000')
    })

    it('should round and format negative values to integers', () => {
      expect(formatCurrency(-10.9999, opts)).toBe('-11')
      expect(formatCurrency(-10.5, opts)).toBe('-11')
      expect(formatCurrency(-10.500_01, opts)).toBe('-11')
      expect(formatCurrency(-10.499_999_99, opts)).toBe('-10')
      expect(formatCurrency(-10.0001, opts)).toBe('-10')
      expect(formatCurrency(-0.499_999_99, opts)).toBe('-0')

      expect(formatCurrency(-0.499_999_999_999_999_99, opts)).toBe('-1')
      expect(formatCurrency(-0.5, opts)).toBe('-1')
      expect(formatCurrency(-0.500_01, opts)).toBe('-1')
      expect(formatCurrency(-0.999, opts)).toBe('-1')
      expect(formatCurrency(-0, opts)).toBe('-0')
      expect(formatCurrency('-0', opts)).toBe('-0')

      expect(formatCurrency(-10.499_999_999_999_999_9, opts)).toBe('-11')
      // expect(formatCurrency(-1000000000000000.49, opts)).toBe('-1,000,000,000,000,001')

      expect(formatCurrency(-1_000_000_000_000_000_000.5, opts)).toBe('-1,000,000,000,000,000,000')
    })
  })

  describe('formatCurrency to fraction', () => {
    const opts = { minFraction: 2, maxFraction: 2 }

    it('should round and format positive values to two decimals', () => {
      expect(formatCurrency(10.9999, opts)).toBe('11.00')
      expect(formatCurrency('10.9999', opts)).toBe('11.00')
      expect(formatCurrency(10.5, opts)).toBe('10.50')
      expect(formatCurrency(10.499_999_99, opts)).toBe('10.50')
      expect(formatCurrency(10.233_525_23, opts)).toBe('10.23')
      expect(formatCurrency(0.444_999_999_9, opts)).toBe('0.44')

      expect(formatCurrency(0.444_999_999_999_999_999_9, opts)).toBe('0.45')
      expect(formatCurrency(0.5, opts)).toBe('0.50')
      expect(formatCurrency(0.895, opts)).toBe('0.90')
      expect(formatCurrency(0.894, opts)).toBe('0.89')
      expect(formatCurrency(0.999, opts)).toBe('1.00')
      expect(formatCurrency(0.99, opts)).toBe('0.99')
      expect(formatCurrency(0, opts)).toBe('0.00')

      expect(formatCurrency(10.499_999_999_999_999_9, opts)).toBe('10.50')
      // expect(formatCurrency(10.444999999999999, opts)).toBe('10.44')

      expect(formatCurrency(10.444_999_999_999_999_9, opts)).toBe('10.45')

      expect(formatCurrency(1_000_000_000_000_000.49, opts)).toBe('1,000,000,000,000,000.50')

      expect(formatCurrency(10_000_000_000_000_000.49, opts)).toBe('10,000,000,000,000,000.00')

      expect(formatCurrency(1_000_000_000_000_000_000.5, opts)).toBe('1,000,000,000,000,000,000.00')
    })

    it('should round and format negative values to two decimals', () => {
      expect(formatCurrency(-10.9999, opts)).toBe('-11.00')
      expect(formatCurrency('-10.9999', opts)).toBe('-11.00')
      expect(formatCurrency(-10.5, opts)).toBe('-10.50')
      expect(formatCurrency(-10.499_999_99, opts)).toBe('-10.50')
      expect(formatCurrency(-10.233_525_23, opts)).toBe('-10.23')
      expect(formatCurrency(-0.444_999_999_9, opts)).toBe('-0.44')

      expect(formatCurrency(-0.444_999_999_999_999_999_9, opts)).toBe('-0.45')
      expect(formatCurrency(-0.5, opts)).toBe('-0.50')
      expect(formatCurrency(-0.895, opts)).toBe('-0.90')
      expect(formatCurrency(-0.894, opts)).toBe('-0.89')
      expect(formatCurrency(-0.999, opts)).toBe('-1.00')
      expect(formatCurrency(-0.99, opts)).toBe('-0.99')
      expect(formatCurrency(-0, opts)).toBe('-0.00')

      expect(formatCurrency(-10.499_999_999_999_999_9, opts)).toBe('-10.50')
      // expect(formatCurrency(-10.44499999999999, opts)).toBe('-10.44')

      expect(formatCurrency(-10.444_999_999_999_999_9, opts)).toBe('-10.45')

      expect(formatCurrency(-1_000_000_000_000_000.49, opts)).toBe('-1,000,000,000,000,000.50')

      expect(formatCurrency(-10_000_000_000_000_000.49, opts)).toBe('-10,000,000,000,000,000.00')

      expect(formatCurrency(-1_000_000_000_000_000_000.5, opts)).toBe(
        '-1,000,000,000,000,000,000.00'
      )
    })
  })
})
