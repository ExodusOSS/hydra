import { hasLeftCurrencySymbol, units } from '@exodus/fiat-currencies'
import formatCurrency from './format-currency.js'

export { default as formatCurrency } from './format-currency.js'
export const LEFT_FORMAT = '%s%v'
export const RIGHT_FORMAT = '%v %s'
export const USD_SYMBOL = units.USD.symbol

export function getCurrencySymbol(currency: string) {
  return units[currency]?.symbol
}

export function getCurrencyFormat(currency: string) {
  return hasLeftCurrencySymbol(currency) ? LEFT_FORMAT : RIGHT_FORMAT
}

export const formatNumber = (number: string | number, decimals = 0) => {
  return formatCurrency(number, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  })
}
