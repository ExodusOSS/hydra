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
    maxFraction = 2, // it's added only for formatAssetPrice util
  }: {
    useGrouping?: boolean
    currency?: string
    format?: string
    maxFraction?: number
  } = {}
) => {
  const priceNumber = parseAmount(price)
  const currencySymbol = getCurrencySymbol(currency)
  const currencyFormat = format || getCurrencyFormat(currency)

  const result = formatCurrency(priceNumber, {
    minimumFractionDigits: priceNumber === 0 ? 0 : Math.min(maxFraction, 2),
    maximumFractionDigits: priceNumber === 0 ? 0 : maxFraction,
    format: currencyFormat,
    symbol: currencySymbol,
    useGrouping,
  })
  // formatted number might be rounded to 0, we don't want to show 0.00 with 2 decimals
  if (parseFloat(result.replace(currencySymbol || '', '')) === 0) {
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

export function formatPriceUSD(price: string) {
  return formatPrice(price)
}

// For asset specific fiat
export function formatAssetPrice({
  price,
  currency,
  decimals: decimalsFromProps,
}: {
  price: string | number
  currency: string
  decimals?: number
}) {
  return formatPrice(price.toString(), {
    currency,
    maxFraction: decimalsFromProps || getFiatAdaptiveFraction(price),
    useGrouping: true,
  })
}

export const getFiatAdaptiveFraction = (price: string | number) => {
  price = Number(price)
  return price === 0 ? 2 : price >= 1 ? 2 : price >= 0.0001 ? 4 : 6
}
