import { roundDecimalSignificantsUp } from './numbers.js'

function parseNum(value: null | number | string | undefined) {
  if (value == null) return NaN
  if (typeof value === 'number') return value // Return the value as-is if it's already a number
  // explicitly convert to string before parsing
  // strip out everything except digits, decimal point and minus sign:
  return parseFloat(value.toString().replace(/[^\d.-]/gu, ''))
}

interface FormatCurrencyOptions extends Intl.NumberFormatOptions {
  format?: string
  code?: string
  symbol?: string
  locale?: string
  nanZero?: boolean
  // deprecated
  minInteger?: number
  maxInteger?: number
  minFraction?: number
  maxFraction?: number
  minSignificant?: number
  maxSignificant?: number
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
const defaultOptions = {
  locale: 'en-US',
  localeMatcher: 'best fit',
  useGrouping: true, // grouping separator determined by locale
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  // OTHER
  // minimumIntegerDigits
  // maximumIntegerDigits
  // minimumSignificantDigits
  // maximumSignificantDigits
}

const exludeOptionsForIntlConstructor = {
  format: undefined,
  code: undefined,
  symbol: undefined,
}

const formatters = new Map()

const formatNumber = (
  number: string | number | null | undefined,
  opts: FormatCurrencyOptions | undefined
): string => {
  const options: Record<string, any> = Object.assign(
    Object.create(null),
    defaultOptions,
    opts,
    exludeOptionsForIntlConstructor
  )
  number = parseNum(number)
  if (isNaN(number)) {
    if (opts?.nanZero === false) return 'NaN' // default is true, so we can do this without expanding the options
    number = 0
  }

  const key = JSON.stringify(options)
  if (!formatters.has(key)) {
    // expand 'min' to 'minimum', 'max' to 'maximum'
    Object.keys(options).forEach(function (key) {
      if (!key.includes('minimum') && key.startsWith('min')) {
        options[key.replace('min', 'minimum')] = options[key]
        delete options[key]
      }

      if (!key.includes('maximum') && key.startsWith('max')) {
        options[key.replace('max', 'maximum')] = options[key]
        delete options[key]
      }
    })

    Object.keys(options).forEach(function (key) {
      if (key.startsWith('minimum') && !key.endsWith('Digits')) {
        options[key + 'Digits'] = options[key]
        delete options[key]
      }

      if (key.startsWith('maximum') && !key.endsWith('Digits')) {
        options[key + 'Digits'] = options[key]
        delete options[key]
      }
    })

    if (options.maximumSignificantDigits) {
      // don't allow to use > 21 https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
      options.maximumSignificantDigits = Math.min(options.maximumSignificantDigits, 21)
    }

    const locale = options.locale ?? 'en-US'
    formatters.set(key, new Intl.NumberFormat([locale], { ...options, style: 'decimal' }))
  }

  if ((globalThis as any).Intl === (globalThis as any).IntlPolyfill) {
    // There is a bug in IntlPolyfill that can lose one decimal place during rounding - round it manually
    // See https://github.com/ExodusMovement/exodus-hydra/blob/764847030e13a290668ff9df80750813a9e0fcdd/libraries/react-native-base/shims/intl.android.js#L1
    const maxSignificant = Math.min(options.maximumSignificantDigits ?? 21, 21)
    number = roundDecimalSignificantsUp(number, maxSignificant)
  }

  return formatters.get(key).format(number)
}

export default function formatCurrency(
  amount?: string | number,
  opts?: FormatCurrencyOptions
): string {
  amount = formatNumber(amount, opts)
  if (!opts?.format || opts.format === '%v') return amount // fast path

  // %s => symbol, %v => value, %c => code
  const { format = '%v', symbol, code } = opts
  if (!format.includes('%v')) throw new Error('Must have "%v" in `format` options.')
  return format
    .replace('%v', amount)
    .replace('%s', symbol || '')
    .replace('%c', code || '')
}
