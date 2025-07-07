/* eslint-disable unicorn/no-zero-fractions */

/* eslint-disable unicorn/numeric-separators-style */
import { formatPercentage } from './percentage.js'

describe('price', () => {
  describe('formatPercentage', () => {
    const noPlus = true

    it('should append "%"', () => {
      expect(formatPercentage(10.49, noPlus)).toBe('10.5%')
      expect(formatPercentage(10.9999, noPlus)).toBe('11%')
      expect(formatPercentage('10.9999', noPlus)).toBe('11%')
      expect(formatPercentage(0, noPlus)).toBe('0%')
      expect(formatPercentage(1000000000000000000.5, noPlus)).toBe('1,000,000,000,000,000,000%')
      expect(formatPercentage(1000, noPlus)).toBe('1,000%')

      expect(formatPercentage(-0, noPlus)).toBe('0%')
      expect(formatPercentage(-10.9999, noPlus)).toBe('-11%')
      expect(formatPercentage('-10.9999', noPlus)).toBe('-11%')
      expect(formatPercentage(-10000000000000000.49, noPlus)).toBe('-10,000,000,000,000,000%')
      expect(formatPercentage(-1000, noPlus)).toBe('-1,000%')
    })

    it('should prepend "+" for positive numbers', () => {
      expect(formatPercentage(0.0000000000000000001)).toBe('0%')
      expect(formatPercentage(0.0001)).toBe('0%')
      expect(formatPercentage(0.1)).toBe('+0.1%')
      expect(formatPercentage(100.1)).toBe('+100.1%')
      expect(formatPercentage('0.1')).toBe('+0.1%')
      expect(formatPercentage('100.1')).toBe('+100.1%')
    })

    it('should not prepend "+" negative numbers', () => {
      expect(formatPercentage(-0.00000000000000000000000000001)).toBe('0%')
      expect(formatPercentage(-10)).toBe('-10%')
      expect(formatPercentage('-0.00000000000000000000000000001')).toBe('0%')
      expect(formatPercentage('-10')).toBe('-10%')
    })

    it('should not prepend any sign for 0', () => {
      expect(formatPercentage(0)).toBe('0%')
      expect(formatPercentage(-0)).toBe('0%')
      expect(formatPercentage(0.0)).toBe('0%')
      expect(formatPercentage(-0.0)).toBe('0%')
      expect(formatPercentage('+0.0')).toBe('0%')
      expect(formatPercentage('-0.0')).toBe('0%')
    })

    it('should return empty string for undefined, null, or NaN values', () => {
      // @ts-expect-error - Permits undefined, null, and NaN values
      expect(formatPercentage()).toBe('')
      expect(formatPercentage(null)).toBe('')
      expect(formatPercentage(NaN)).toBe('')
      expect(formatPercentage('invalid')).toBe('')
    })
  })
})
