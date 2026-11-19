import BN from 'bn.js'

/*
 Intl on Chrome and iOS will round the value up if the first non-significant digit rounds up.
 This will give us following results on iOS:
  9.99999999 -> 10
  99.99999999 -> 100
 IntlPolyfill is broken and will lose a digit after rounding:
  9.99999999 -> 1.0
  99.99999999 -> 10
 This rounds the values manually so we don't encounter this issue.
*/
export function roundDecimalSignificantsUp<T extends string | number>(
  value: T,
  significantDigits = 21
): T {
  const [int, dec] = value.toString().split('.')
  if (!dec) return value

  const flippingPoint = significantDigits - (int === '0' || int === undefined ? 0 : int.length) + 1

  const decimal = Number(`0.${dec}`)
  const shouldRound = 1 - decimal <= (5 + 1e-6) * 10 ** -flippingPoint

  if (shouldRound) {
    const bn = new BN(int ?? 0)
    const rounded = int?.startsWith('-') ? bn.subn(1) : bn.addn(1)
    return (typeof value === 'string' ? rounded.toString() : rounded.toNumber()) as T
  }

  return value
}

export function toPlainDecimalString(value: string | number): string {
  const normalized = value.toString()
  if (!/[eE]/u.test(normalized)) return normalized

  const isNegative = normalized.startsWith('-')
  const unsigned = isNegative ? normalized.slice(1) : normalized
  const [mantissa, exponentPart] = unsigned.toLowerCase().split('e')

  if (!mantissa || exponentPart === undefined) return normalized

  const exponent = Number(exponentPart)
  if (!Number.isInteger(exponent)) return normalized

  const [whole = '0', fraction = ''] = mantissa.split('.')
  const digits = `${whole}${fraction}`
  const decimalIndex = whole.length + exponent

  const plainUnsigned =
    decimalIndex <= 0
      ? `0.${'0'.repeat(-decimalIndex)}${digits}`
      : decimalIndex >= digits.length
        ? `${digits}${'0'.repeat(decimalIndex - digits.length)}`
        : `${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`

  return isNegative ? `-${plainUnsigned}` : plainUnsigned
}

/**
 * Truncates (floors) decimal digits to fit within a digit budget.
 * Note: `significantDigits` is a digit budget, not true significant-figure rounding.
 * After accounting for digits in the integer part, the remaining budget is applied as
 * a maximum number of decimal places from the decimal point, so leading zeros in the
 * fractional part do count toward the budget.
 * This mirrors the behavior of `roundDecimalSignificantsUp`.
 * @example
 * truncateDecimalSignificantsDown(0.0001234567, 6) // -> 0.000123 (3 sig figs, not 6)
 * truncateDecimalSignificantsDown(0.9999999, 6)    // -> 0.999999 (6 decimal places)
 */
export function truncateDecimalSignificantsDown<T extends string | number>(
  value: T,
  significantDigits = 21
): T {
  let normalized = toPlainDecimalString(value)
  if (!normalized.includes('.')) return value

  const isNegative = normalized.startsWith('-')
  if (isNegative) normalized = normalized.slice(1)

  const [int, dec] = normalized.split('.')
  if (!dec) return value

  const intDigits = int === '0' || int === undefined ? 0 : int.length
  const maxDecimals = intDigits >= significantDigits ? 0 : significantDigits - intDigits

  if (dec.length <= maxDecimals) return value

  const truncatedUnsigned = maxDecimals > 0 ? `${int}.${dec.slice(0, maxDecimals)}` : int
  const truncated = isNegative ? `-${truncatedUnsigned}` : truncatedUnsigned
  return (typeof value === 'string' ? truncated : Number(truncated)) as T
}

export function padDecimals(value: number | string, length: number): string {
  value = value.toString()

  const [int, dec] = value.split('.')

  if (!dec) return `${value}.${'0'.repeat(length)}`

  return dec.length < length ? `${int}.${dec}${'0'.repeat(length - dec.length)}` : value
}

const suffixes = ['st', 'nd', 'rd']
export function asOrdinal(number: number): string {
  const mod10 = number % 10
  const mod100 = number % 100

  if ([1, 2, 3].includes(mod10)) {
    const suffix = mod100 > 10 && mod100 < 20 ? 'th' : suffixes[mod10 - 1]
    return `${number}${suffix}`
  }

  return `${number}th`
}
