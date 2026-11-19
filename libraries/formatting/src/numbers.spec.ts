import {
  asOrdinal,
  roundDecimalSignificantsUp,
  truncateDecimalSignificantsDown,
} from './numbers.js'

describe('numbers', () => {
  describe('round', () => {
    it('should round-up values exceeding significantDigits limit', () => {
      expect(roundDecimalSignificantsUp(0.999_999_999, 8)).toBe(1)
      expect(roundDecimalSignificantsUp(1.999_999_99, 8)).toBe(2)
      expect(roundDecimalSignificantsUp(9.999, 3)).toBe(10)
      expect(roundDecimalSignificantsUp(4.999_999_99, 8)).toBe(5)
      expect(roundDecimalSignificantsUp(99_999.999_99, 9)).toBe(100_000)
      expect(roundDecimalSignificantsUp(999.999_995, 8)).toBe(1000)
    })

    it('should round-down negative values exceeding significantDigits limit', () => {
      expect(roundDecimalSignificantsUp(-0.999_999_999, 8)).toBe(-1)
      expect(roundDecimalSignificantsUp(-1.999_999_99, 8)).toBe(-2)
      expect(roundDecimalSignificantsUp(-9.999, 3)).toBe(-10)
      expect(roundDecimalSignificantsUp(-4.999_999_99, 8)).toBe(-5)
      expect(roundDecimalSignificantsUp(-99_999.999_99, 9)).toBe(-100_000)
      expect(roundDecimalSignificantsUp(-999.999_995, 8)).toBe(-1000)
    })

    it('should not round values under significantDigits limit', () => {
      expect(roundDecimalSignificantsUp(0.999_999_99, 8)).toBe(0.999_999_99)
      expect(roundDecimalSignificantsUp(9.9, 8)).toBe(9.9)
      expect(roundDecimalSignificantsUp(9.994, 8)).toBe(9.994)
      expect(roundDecimalSignificantsUp(4.9, 8)).toBe(4.9)
      expect(roundDecimalSignificantsUp(4.999, 8)).toBe(4.999)
      expect(roundDecimalSignificantsUp(99_999.999_99, 10)).toBe(99_999.999_99)

      // Those values get rounded by Intl down. We only fix rounding up.
      expect(roundDecimalSignificantsUp(9.999_999_92, 8)).toBe(9.999_999_92)
      expect(roundDecimalSignificantsUp(4.999_999_92, 8)).toBe(4.999_999_92)
      expect(roundDecimalSignificantsUp(9.994, 3)).toBe(9.994)
      expect(roundDecimalSignificantsUp(9.994_999, 3)).toBe(9.994_999)
    })

    it('should not round values without decimals', () => {
      expect(roundDecimalSignificantsUp(5, 8)).toBe(5)
      expect(roundDecimalSignificantsUp(5100, 8)).toBe(5100)
    })

    it('should produce return type consistent to input type', () => {
      expect(roundDecimalSignificantsUp('99.999999999999999999999999', 10)).toBe('100')
    })
  })

  describe('truncate', () => {
    it('should truncate values exceeding significantDigits limit', () => {
      expect(truncateDecimalSignificantsDown(53.170_961, 6)).toBe(53.1709)
      expect(truncateDecimalSignificantsDown(29.231_969_03, 6)).toBe(29.2319)
      expect(truncateDecimalSignificantsDown(19_228.880_017_96, 6)).toBe(19_228.8)
      expect(truncateDecimalSignificantsDown(0.000_012_567_8, 6)).toBe(0.000_012)
      expect(truncateDecimalSignificantsDown(0.001_234_567_89, 6)).toBe(0.001_234)
    })

    it('should not truncate values under significantDigits limit', () => {
      expect(truncateDecimalSignificantsDown(1.23, 6)).toBe(1.23)
      expect(truncateDecimalSignificantsDown(100, 6)).toBe(100)
      expect(truncateDecimalSignificantsDown(0.05, 6)).toBe(0.05)
    })

    it('should preserve input type for strings', () => {
      expect(truncateDecimalSignificantsDown('53.170961', 6)).toBe('53.1709')
    })

    it('should not truncate when significantDigits is larger than digit count', () => {
      expect(truncateDecimalSignificantsDown(1.23, 10)).toBe(1.23)
      expect(truncateDecimalSignificantsDown(0.001_234, 10)).toBe(0.001_234)
      expect(truncateDecimalSignificantsDown(99.99, 8)).toBe(99.99)
    })

    it('should truncate aggressively when significantDigits is smaller', () => {
      expect(truncateDecimalSignificantsDown(53.170_961, 2)).toBe(53)
      expect(truncateDecimalSignificantsDown(53.170_961, 3)).toBe(53.1)
      expect(truncateDecimalSignificantsDown(0.001_234_567, 3)).toBe(0.001)
      expect(truncateDecimalSignificantsDown(123.456, 3)).toBe(123)
      expect(truncateDecimalSignificantsDown(9.87, 1)).toBe(9)
    })

    it('should handle scientific notation', () => {
      expect(truncateDecimalSignificantsDown(5.6e-9, 9)).toBe(5e-9)
    })

    it('should not collapse magnitude for large positive exponents', () => {
      expect(truncateDecimalSignificantsDown(1.23e21, 6)).toBe(1.23e21)
      expect(truncateDecimalSignificantsDown(1.23e22, 6)).toBe(1.23e22)
    })
  })

  describe('asOrdinal', () => {
    const cases: [number, string][] = [
      [0, '0th'],
      [1, '1st'],
      [2, '2nd'],
      [3, '3rd'],
      [5, '5th'],
      [8, '8th'],
      [11, '11th'],
      [12, '12th'],
      [13, '13th'],
      [21, '21st'],
      [22, '22nd'],
      [23, '23rd'],
      [111, '111th'],
      [112, '112th'],
      [113, '113th'],
      [123, '123rd'],
      [211, '211th'],
      [212, '212th'],
      [213, '213th'],
    ]

    cases.forEach(([number, ordinal]) => {
      it(`should format ${number} as ${ordinal}`, () => {
        expect(asOrdinal(number)).toEqual(ordinal)
      })
    })
  })
})
