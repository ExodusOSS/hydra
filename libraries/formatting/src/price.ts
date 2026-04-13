import { formatCurrency, getCurrencyFormat, getCurrencySymbol } from './currency.js'

const parseAmount = (amount: string | number) => {
  if (typeof amount === 'number') return amount
  if (typeof amount === 'string') {
    return parseFloat(amount.replace(/[,_]/gu, ''))
  }

  throw new Error('unexpected price type')
}

// For any fiat
export const formatPrice = (
  price: string | number,
  {
    useGrouping = true,
    currency = 'USD',
    format,
    minimumFractionDigits,
    maxFraction = 2, // it's added only for formatAssetPrice util
    formatZeroWithoutDecimals = true,
  }: FormatPriceOptions = {}
) => {
  const priceNumber = parseAmount(price)
  const currencySymbol = getCurrencySymbol(currency)
  const currencyFormat = format || getCurrencyFormat(currency)

  if (minimumFractionDigits && minimumFractionDigits > maxFraction) {
    throw new Error('minimumFractionDigits cannot be greater than maxFraction')
  }

  const result = formatCurrency(priceNumber, {
    minimumFractionDigits:
      priceNumber === 0
        ? 0
        : minimumFractionDigits === undefined
          ? Math.min(maxFraction, 2)
          : minimumFractionDigits,
    maximumFractionDigits: priceNumber === 0 ? 0 : maxFraction,
    format: currencyFormat,
    symbol: currencySymbol,
    useGrouping,
  })

  if (formatZeroWithoutDecimals && parseFloat(result.replace(currencySymbol || '', '')) === 0) {
    return formatCurrency(0, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      format: currencyFormat,
      symbol: currencySymbol,
      useGrouping,
    })
  }

  return result
}

export function formatPriceUSD(price: string | number) {
  return formatPrice(price)
}

// For asset specific fiat
export function formatAssetPrice({
  price,
  currency,
  decimals: decimalsFromProps,
  formatZeroWithoutDecimals = true,
}: {
  price: string | number
  currency: string
  decimals?: number
  formatZeroWithoutDecimals?: boolean
}) {
  const maxFraction = decimalsFromProps || getFiatAdaptiveFraction(price)

  return formatPrice(price.toString(), {
    currency,
    maxFraction,
    useGrouping: true,
    formatZeroWithoutDecimals,
  })
}

export const getFiatAdaptiveFraction = (price: string | number) => {
  price = Number(price)
  return price === 0 ? 2 : price >= 1 ? 2 : price >= 0.0001 ? 4 : 6
}

// overrides minimumFractionDigits to 0
export const formatAmount = (
  amount: string | number,
  { minimumFractionDigits = 0, ...rest }: FormatPriceOptions = {}
) => {
  return formatPrice(amount, { minimumFractionDigits, ...rest })
}

type FormatPriceOptions = {
  useGrouping?: boolean
  currency?: string
  format?: string
  minimumFractionDigits?: number
  maxFraction?: number
  formatZeroWithoutDecimals?: boolean
}
