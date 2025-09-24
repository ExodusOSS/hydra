/* eslint-disable unicorn/numeric-separators-style */
import { formatAssetPrice, formatPrice } from './price.js'

describe('price', () => {
  describe('formatPrice', () => {
    it('should format price', () => {
      expect(formatPrice(5)).toBe('$5.00')
      expect(formatPrice('5')).toBe('$5.00')
      expect(formatPrice(5100.4499)).toBe('$5,100.45')
      expect(formatPrice(0)).toBe('$0')
      expect(formatPrice('0')).toBe('$0')
      expect(formatPrice(0.001)).toBe('$0')
      expect(formatPrice(0.01)).toBe('$0.01')
    })

    it('should group when enabled', () => {
      expect(formatPrice(5100)).toBe('$5,100.00')
      expect(formatPrice(5100, { useGrouping: true, maxFraction: 0 })).toBe('$5,100')
    })

    it('should not group when disabled', () => {
      expect(formatPrice(5100, { useGrouping: false })).toBe('$5100.00')
      expect(formatPrice(5100, { useGrouping: false, maxFraction: 0 })).toBe('$5100')
      expect(formatPrice(0.001, { useGrouping: false })).toBe('$0')
    })

    it('should display 0 when value less than decimals', () => {
      expect(formatPrice(0.001)).toBe('$0')
      expect(formatPrice(0.001, { maxFraction: 2 })).toBe('$0')
      expect(formatPrice(0.001, { maxFraction: 3 })).toBe('$0.001')
    })

    it('should support custom currency', () => {
      expect(formatPrice(5, { currency: 'EUR' })).toBe('€5.00')
      expect(formatPrice('5', { currency: 'EUR' })).toBe('€5.00')
      expect(formatPrice(5100.4499, { currency: 'EUR' })).toBe('€5,100.45')
      expect(formatPrice(0, { currency: 'EUR' })).toBe('€0')
      expect(formatPrice('0', { currency: 'EUR' })).toBe('€0')
      expect(formatPrice('0.001', { currency: 'EUR' })).toBe('€0')
    })

    it('support string with comma separators value', () => {
      expect(formatPrice('5,100.00')).toBe('$5,100.00')
    })
    it('support scientific notation', () => {
      expect(formatPrice(5.6e-9)).toBe('$0')
      expect(formatPrice(5.6e-8)).toBe('$0')
      expect(formatPrice(5.6e-7)).toBe('$0')
      expect(formatPrice(5.6e-6)).toBe('$0')
      expect(formatPrice('5.6e-5')).toBe('$0')
    })

    it('should format strings with currency', () => {
      expect(formatPrice('0 AED', { currency: 'AED' })).toBe('0 AED')
      expect(formatPrice('0 AED', { currency: 'AED', useGrouping: false })).toBe('0 AED')
      expect(formatPrice('1 AED', { currency: 'AED' })).toBe('1.00 AED')
      expect(formatPrice('1 AED', { currency: 'AED', useGrouping: false })).toBe('1.00 AED')
    })

    describe('formatZeroWithoutDecimals', () => {
      it('should prevent rounding to zero for very small numbers when disabled', () => {
        expect(formatPrice(0.00000123, { formatZeroWithoutDecimals: false, maxFraction: 12 })).toBe(
          '$0.00000123'
        )
        expect(
          formatPrice(0.000000001, { formatZeroWithoutDecimals: false, maxFraction: 12 })
        ).toBe('$0.000000001')
        expect(
          formatPrice('0.00000000123', { formatZeroWithoutDecimals: false, maxFraction: 12 })
        ).toBe('$0.00000000123')
        expect(formatPrice(5.6e-9, { formatZeroWithoutDecimals: false, maxFraction: 12 })).toBe(
          '$0.0000000056'
        )
        expect(formatPrice(1.23e-10, { formatZeroWithoutDecimals: false, maxFraction: 12 })).toBe(
          '$0.000000000123'
        )
      })

      it('should still round to 0 for very small numbers when enabled', () => {
        expect(formatPrice(0.00000123, { formatZeroWithoutDecimals: true })).toBe('$0')
        expect(formatPrice(0.000000001, { formatZeroWithoutDecimals: true })).toBe('$0')
        expect(formatPrice(5.6e-9)).toBe('$0') // default behavior
      })

      it('should handle zero correctly with formatZeroWithoutDecimals', () => {
        expect(formatPrice(0, { formatZeroWithoutDecimals: false })).toBe('$0')
        expect(formatPrice('0', { formatZeroWithoutDecimals: false })).toBe('$0')
      })

      it('should work with different currencies when formatZeroWithoutDecimals is disabled', () => {
        expect(
          formatPrice(0.00000123, {
            currency: 'EUR',
            formatZeroWithoutDecimals: false,
            maxFraction: 12,
          })
        ).toBe('€0.00000123')
        expect(
          formatPrice(0.00000123, {
            currency: 'JPY',
            formatZeroWithoutDecimals: false,
            maxFraction: 12,
          })
        ).toBe('¥0.00000123')
      })

      it('should respect maxFraction when formatZeroWithoutDecimals is enabled', () => {
        expect(formatPrice(0.00123, { maxFraction: 3, formatZeroWithoutDecimals: true })).toBe(
          '$0.001'
        )
        expect(formatPrice(0.00123, { maxFraction: 4, formatZeroWithoutDecimals: true })).toBe(
          '$0.0012'
        )
      })

      it('should use extended precision when maxFraction is increased', () => {
        expect(
          formatPrice(0.00123456789, { maxFraction: 12, formatZeroWithoutDecimals: false })
        ).toBe('$0.00123456789')
        expect(
          formatPrice(0.00123456789, { maxFraction: 2, formatZeroWithoutDecimals: true })
        ).toBe('$0')
      })
    })
  })

  describe('formatAssetPrice', () => {
    it('should format asset price 0', () => {
      expect(formatAssetPrice({ currency: 'USD', price: 0 })).toBe('$0')
      expect(formatAssetPrice({ currency: 'USD', price: '0' })).toBe('$0')
    })

    it('should format asset price >= 1', () => {
      expect(formatAssetPrice({ currency: 'USD', price: 1 })).toBe('$1.00')
      expect(formatAssetPrice({ currency: 'USD', price: '1' })).toBe('$1.00')
      expect(formatAssetPrice({ currency: 'USD', price: 1.2 })).toBe('$1.20')
      expect(formatAssetPrice({ currency: 'USD', price: '1.2' })).toBe('$1.20')
      expect(formatAssetPrice({ currency: 'USD', price: '100000' })).toBe('$100,000.00')
      expect(formatAssetPrice({ currency: 'USD', price: 100000 })).toBe('$100,000.00')
      expect(formatAssetPrice({ currency: 'USD', price: 0.99999999999999999999 })).toBe('$1.00')
    })

    it('should format asset price >= 0.0001 && < 1', () => {
      expect(formatAssetPrice({ currency: 'USD', price: 0.0001 })).toBe('$0.0001')
      expect(formatAssetPrice({ currency: 'USD', price: '0.001' })).toBe('$0.001')
      expect(formatAssetPrice({ currency: 'USD', price: '0.01' })).toBe('$0.01')
      expect(formatAssetPrice({ currency: 'USD', price: '0.0001' })).toBe('$0.0001')
      expect(formatAssetPrice({ currency: 'USD', price: '0.00001' })).toBe('$0.00001')
      expect(formatAssetPrice({ currency: 'USD', price: '0.000001' })).toBe('$0.000001')
      expect(formatAssetPrice({ currency: 'USD', price: '0.0000001' })).toBe('$0')
      expect(formatAssetPrice({ currency: 'USD', price: '0.999' })).toBe('$0.999')
      expect(formatAssetPrice({ currency: 'USD', price: 0.9999 })).toBe('$0.9999')
      expect(formatAssetPrice({ currency: 'USD', price: 0.99999 })).toBe('$1.00')
    })

    it('should format asset price < 0.0001', () => {
      expect(formatAssetPrice({ currency: 'USD', price: 0.00009999 })).toBe('$0.0001')
      expect(formatAssetPrice({ currency: 'USD', price: '0.00001' })).toBe('$0.00001')
      expect(formatAssetPrice({ currency: 'USD', price: 0.0000009999 })).toBe('$0.000001')
      expect(formatAssetPrice({ currency: 'USD', price: 0.00000009 })).toBe('$0')
      expect(formatAssetPrice({ currency: 'EUR', price: 0.00000009 })).toBe('€0')
      expect(formatAssetPrice({ currency: 'EUR', price: 0.0001, decimals: 3 })).toBe('€0')
    })

    describe('formatZeroWithoutDecimals', () => {
      it('should show full precision for very small asset prices when formatZeroWithoutDecimals is disabled', () => {
        expect(
          formatAssetPrice({
            currency: 'USD',
            price: 0.00000123,
            decimals: 8,
            formatZeroWithoutDecimals: false,
          })
        ).toBe('$0.00000123')

        expect(
          formatAssetPrice({
            currency: 'USD',
            price: '0.000000001',
            decimals: 9,
            formatZeroWithoutDecimals: false,
          })
        ).toBe('$0.000000001')

        expect(
          formatAssetPrice({
            currency: 'EUR',
            price: 0.00000009,
            decimals: 8,
            formatZeroWithoutDecimals: false,
          })
        ).toBe('€0.00000009')
      })

      it('should still use adaptive fractions for normal prices with formatZeroWithoutDecimals disabled', () => {
        expect(
          formatAssetPrice({
            currency: 'USD',
            price: 1.23,
            formatZeroWithoutDecimals: false,
          })
        ).toBe('$1.23')

        expect(
          formatAssetPrice({
            currency: 'USD',
            price: 0.001,
            formatZeroWithoutDecimals: false,
          })
        ).toBe('$0.001')
      })

      it('should respect custom decimals with formatZeroWithoutDecimals disabled', () => {
        expect(
          formatAssetPrice({
            currency: 'USD',
            price: 0.00000123,
            decimals: 8,
            formatZeroWithoutDecimals: false,
          })
        ).toBe('$0.00000123')
      })

      it('should handle zero with formatZeroWithoutDecimals disabled', () => {
        expect(
          formatAssetPrice({
            currency: 'USD',
            price: 0,
            formatZeroWithoutDecimals: false,
          })
        ).toBe('$0')
      })
    })
  })
})
