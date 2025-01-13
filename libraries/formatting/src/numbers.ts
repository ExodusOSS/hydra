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
