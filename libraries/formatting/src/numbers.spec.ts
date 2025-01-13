import { asOrdinal, roundDecimalSignificantsUp } from './numbers.js'

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
