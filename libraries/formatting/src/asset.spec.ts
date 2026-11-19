import NumberUnit, { UnitType } from '@exodus/currency'

import { canShowPlusSign, formatAssetAmount } from './asset.js'

export const bitcoin = UnitType.create({
  satoshis: 0,
  bits: 2,
  BTC: 8,
}) as UnitType & Record<'satoshis' | 'bits' | 'BTC', Parameters<typeof NumberUnit.create>[1]>

describe('asset', () => {
  describe('formatAssetAmount', () => {
    it('should format dust', () => {
      expect(formatAssetAmount(0.000_000_009)).toBe('0')
      expect(formatAssetAmount(0.000_000_000_000_09)).toBe('0')
    })

    it('should not format dust with grouping disabled', () => {
      expect(formatAssetAmount(0.000_000_009, { useGrouping: false, maxSignificant: 10 })).not.toBe(
        '0'
      )
      expect(formatAssetAmount(0.000_000_009, { useGrouping: false, maxSignificant: 10 })).toBe(
        '0.000000009'
      )
      expect(formatAssetAmount(0.000_000_009, { useGrouping: false, maxSignificant: 6 })).toBe('0')
      expect(
        formatAssetAmount(0.000_000_000_000_000_000_009, { useGrouping: false, maxSignificant: 21 })
      ).toBe('0.000000000000000000009')
      expect(
        formatAssetAmount(0.000_000_000_000_000_000_000_9, {
          useGrouping: false,
          maxSignificant: 22,
        })
      ).toBe('0.0000000000000000000009')
      expect(
        formatAssetAmount(0.000_000_000_000_000_000_000_09, {
          useGrouping: false,
          maxSignificant: 23,
        })
      ).toBe('0.00000000000000000000009')
      expect(
        formatAssetAmount(0.000_000_000_000_000_000_000_009, {
          useGrouping: false,
          maxSignificant: 24,
        })
      ).toBe('0.000000000000000000000009')
    })

    it('should use max 6 significant digits', () => {
      expect(formatAssetAmount(0.050_000_9)).toBe('0.05')
      expect(formatAssetAmount(0.050_000_9, { useGrouping: true, maxSignificant: 5 })).toBe('0.05')
      expect(formatAssetAmount(0.000_000_1)).toBe('0')
      expect(formatAssetAmount(0.000_001)).toBe('0.000001')
      expect(formatAssetAmount(1.000_009)).toBe('1')
      expect(formatAssetAmount('0.050000000')).toBe('0.05')
      expect(formatAssetAmount(1.0002)).toBe('1.0002')
      expect(formatAssetAmount(1.002)).toBe('1.002')
      expect(formatAssetAmount(1.000_230_9)).toBe('1.00023')
      expect(formatAssetAmount(10_000_000_001)).toBe('10,000,000,001')
      expect(formatAssetAmount(132_598_689_230_001, { useGrouping: false })).toBe('132598689230001')
      expect(formatAssetAmount(13_259_868_923_001.01, { useGrouping: false })).toBe(
        '13259868923001'
      )
      expect(formatAssetAmount(132_598_689_230_001, { useGrouping: false })).toBe('132598689230001')
      expect(formatAssetAmount(19_228.880_017_96)).toBe('19,228.8')
      expect(formatAssetAmount(29.231_969_03)).toBe('29.2319')
      expect(formatAssetAmount(29.231_869_03)).toBe('29.2318')
    })

    it('should group when enabled', () => {
      expect(formatAssetAmount(5100)).toBe('5,100')
      expect(formatAssetAmount(5100.000_000_009)).toBe('5,100')
    })

    it('should not group when disabled', () => {
      expect(formatAssetAmount(5100, { useGrouping: false })).toBe('5100')
      expect(formatAssetAmount(5100.000_000_009, { useGrouping: false })).toBe('5100')
    })
    it('should remove leading zeros', () => {
      expect(formatAssetAmount('10.00', { useGrouping: false })).toBe('10')
      expect(formatAssetAmount('10.12300', { useGrouping: false })).toBe('10.123')
      expect(formatAssetAmount('123456789.12300', { useGrouping: false })).toBe('123456789')
    })
    it('works with string amounts', () => {
      expect(formatAssetAmount(-9999.99)).toBe('-9,999.99')
      expect(formatAssetAmount('+9999.99')).toBe('9,999.99')
      expect(formatAssetAmount('-9,999.99')).toBe('-9,999.99')
      expect(formatAssetAmount('+9,999.99')).toBe('9,999.99')
      expect(formatAssetAmount('random string doesnt crash the app')).toBe('0')
      expect(formatAssetAmount('9,999.999')).toBe('9,999.99')
      expect(formatAssetAmount('-9,999.999')).toBe('-10,000')
    })
    it('works with empty string', () => {
      expect(formatAssetAmount('')).toBe('0')
    })
    it('works with scientific notation', () => {
      expect(formatAssetAmount(5.691_648_022e-9)).toBe('0')
      expect(formatAssetAmount('5.691_648_022e-9')).toBe('0')
      expect(formatAssetAmount('5.691648022e-9')).toBe('0')
      expect(formatAssetAmount(5.691_648_022e-8)).toBe('0')
      expect(formatAssetAmount('5.691_648_022e-8')).toBe('0')
      expect(formatAssetAmount('5.691648022e-8')).toBe('0')
      expect(formatAssetAmount(5.691_648_022e-6)).toBe('0.000005')
      expect(formatAssetAmount('5.691_648_022e-6')).toBe('0.000005')
      expect(formatAssetAmount('5.691648022e-6')).toBe('0.000005')
      expect(formatAssetAmount(5.691_648_022e-5)).toBe('0.000056')
      expect(formatAssetAmount('5.691_648_022e-5')).toBe('0.000056')
      expect(formatAssetAmount('5.691648022e-5')).toBe('0.000056')
      expect(formatAssetAmount(5.6e-6)).toBe('0.000005')
      expect(formatAssetAmount(5.6e-9)).toBe('0')
      expect(formatAssetAmount(5.6e-9, { useGrouping: false })).toBe('0')
      expect(formatAssetAmount('5.6e-9', { useGrouping: false })).toBe('0')
      expect(formatAssetAmount(5.6e-9, { useGrouping: false, maxSignificant: 9 })).toBe(
        '0.000000005'
      )
      expect(formatAssetAmount('5.6e-9', { useGrouping: false, maxSignificant: 9 })).toBe(
        '0.000000005'
      )
    })
    it('shows plus sign for positive non dust amounts', () => {
      expect(formatAssetAmount(-100, { withPlusSign: true })).toBe('-100')
      expect(formatAssetAmount('-100', { withPlusSign: true })).toBe('-100')
      expect(formatAssetAmount(NumberUnit.create(100, bitcoin.BTC), { withPlusSign: true })).toBe(
        '+100'
      )
      expect(formatAssetAmount('', { withPlusSign: true })).toBe('0')
      expect(formatAssetAmount('0', { withPlusSign: true })).toBe('0')
      expect(formatAssetAmount(0, { withPlusSign: true })).toBe('0')
      expect(formatAssetAmount(100, { withPlusSign: true })).toBe('+100')
      expect(formatAssetAmount('100', { withPlusSign: true })).toBe('+100')
      expect(formatAssetAmount(0.000_000_001, { withPlusSign: true })).toBe('0')
      expect(formatAssetAmount('NAN', { withPlusSign: true })).toBe('0')
    })

    it('doesnt round whole numbers if maxSignificant lower than integer part', () => {
      expect(formatAssetAmount(99_999, { useGrouping: false, maxSignificant: 2 })).toBe('99999')
      expect(formatAssetAmount(99_999.99, { useGrouping: false, maxSignificant: 2 })).toBe('99999')
    })

    it('does not crash on maxSignificant lower than 2', () => {
      expect(formatAssetAmount(0.004_020_243_717_732, { maxSignificant: 1 })).toBe('0')
      expect(formatAssetAmount(123.1234, { maxSignificant: 1 })).toBe('123')
    })

    it('should always produce values <= original (truncation)', () => {
      const values = [53.170_961, 29.231_969, 19_228.880_017_96, 0.123_456_789, 9.999_999]
      for (const val of values) {
        const formatted = formatAssetAmount(val, { useGrouping: false })
        expect(parseFloat(formatted)).toBeLessThanOrEqual(val)
      }
    })

    it('should truncate small decimal values', () => {
      expect(formatAssetAmount(0.000_012_567_8)).toBe('0.000012')
      expect(formatAssetAmount(0.001_234_567_89)).toBe('0.001234')
    })

    it('should preserve large exponent-form numbers', () => {
      expect(formatAssetAmount(1.23e21)).toBe('1,230,000,000,000,000,000,000')
      expect(formatAssetAmount(9.999_99e21)).toBe('9,999,990,000,000,000,000,000')
    })

    it('leaves negatives to Intl default rounding', () => {
      expect(formatAssetAmount(-9999.999)).toBe('-10,000')
      expect(formatAssetAmount(-53.170_961, { useGrouping: false })).toBe('-53.171')
    })
  })

  describe('canShowPlusSign', () => {
    test('canShowPlusSign return boolean', () => {
      expect(canShowPlusSign(-100)).toBe(false)
      expect(canShowPlusSign('-100')).toBe(false)
      expect(canShowPlusSign(NumberUnit.create(100, bitcoin.BTC))).toBe(true)
      expect(canShowPlusSign('')).toBe(false)
      expect(canShowPlusSign('0')).toBe(false)
      expect(canShowPlusSign(0)).toBe(false)
      expect(canShowPlusSign(100)).toBe(true)
      expect(canShowPlusSign('100')).toBe(true)
      expect(canShowPlusSign(0.000_000_001)).toBe(false)
      expect(canShowPlusSign('NAN')).toBe(false)
    })
  })
})
