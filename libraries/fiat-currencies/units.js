import fiat from '@exodus/fiat'

// Symbol doesn't look right, so we use AED and SAR code directly
const WITH_CODE_INSTEAD_OF_SYMBOL = new Set(['AED', 'SAR'])

// Currencies with these symbols should be displayed on right side
const WITH_RIGHT_SIDE_SYMBOLS = new Set([
  'AED',
  'CHF',
  'CNY',
  'CZK',
  'DKK',
  'GHS',
  'NOK',
  'PLN',
  'SAR',
  'SEK',
  'RUB',
])

// Currencies with symbols that are > 2 in length yet still shown to the left of the balance
const withLeftSymbols = new Set(['RSD'])

const units = Object.fromEntries(
  Object.keys(fiat).map((currency) => {
    const { symbol, label } = fiat[currency]
    const baseProps = {
      symbol: WITH_CODE_INSTEAD_OF_SYMBOL.has(currency) ? currency : symbol,
      label,
      name: currency,
    }
    return [
      currency,
      {
        ...baseProps,
        rightSideSymbol:
          WITH_RIGHT_SIDE_SYMBOLS.has(currency) ||
          (baseProps.symbol.length > 2 && !withLeftSymbols.has(currency)),
      },
    ]
  })
)

export function hasLeftCurrencySymbol(currency) {
  if (!units[currency]) return null
  return !units[currency].rightSideSymbol
}

export default units
