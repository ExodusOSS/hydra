import { formatCurrency } from './currency.js'
import { toPlainDecimalString, truncateDecimalSignificantsDown } from './numbers.js'
import type NumberUnit from '@exodus/currency'
import { isNumberUnit } from '@exodus/currency'

type Amount = string | number | NumberUnit

export const DUST_THRESHOLD = 1e-6

export function isDustAmount(amount: number) {
  return amount > 0 && amount < DUST_THRESHOLD
}

// Type guard to check if an object is a NumberUnit
function isNumberUnitType(obj: Amount): obj is NumberUnit {
  return isNumberUnit(obj)
}

const parseAmount = (amount: Amount) => {
  if (isNumberUnitType(amount)) {
    return amount.toDefaultNumber()
  }

  if (typeof amount !== 'string') {
    amount = (amount as number).toString()
  }

  amount = amount.replace(/[,_]/gu, '')

  return parseFloat(amount)
}

export const canShowPlusSign = (amount: Amount) => {
  amount = parseAmount(amount)
  if (isNaN(amount)) return false
  return amount > 0 && !isDustAmount(amount)
}

// For any amount / balance
export function formatAssetAmount(
  amount: Amount,
  { useGrouping = true, maxSignificant = 6, withPlusSign = false } = {}
) {
  amount = parseAmount(amount)
  const convertDust = useGrouping
  if (isNaN(amount)) return '0'

  if (amount === 0) return '0'

  if (convertDust && isDustAmount(amount as number)) return '0'

  // Only positives are truncated to prevent NOT_ENOUGH_BALANCE; negatives retain Intl rounding.
  const absAmount =
    amount >= 0 ? truncateDecimalSignificantsDown(amount, maxSignificant) : Math.abs(amount)

  const absStr = toPlainDecimalString(absAmount)
  const integerPart = absStr.split('.')[0] as string
  const intLength = integerPart.length

  // round decimal part first. We don't want to allow more decimals than maxDecimals, but Intl doesn't support it:
  // new Intl.NumberFormat('en-us', { maximumFractionDigits: 2, maximumSignificantDigits: 2 }).format(0.001) // 0.001
  // but we want to see 0
  // We want to crop number to N digits with rounding
  const roundedToDecimal = formatCurrency(absAmount, {
    useGrouping: false,
    minimumFractionDigits: 0,
    maximumFractionDigits: maxSignificant,
  })
  const withMaxSignificant = formatCurrency(roundedToDecimal, {
    useGrouping,
    maximumSignificantDigits: Math.max(maxSignificant, intLength), // don't round whole numbers
  })
  if (convertDust && parseFloat(withMaxSignificant) === 0 && amount !== 0) {
    return '0'
  }

  if (amount < 0) return `-${withMaxSignificant}`

  if (withPlusSign && amount > 0) return `+${withMaxSignificant}`

  return withMaxSignificant
}

export const formatBalance = (balance: Amount, asset: { displayTicker: string }) =>
  `${formatAssetAmount(balance)} ${asset.displayTicker}`
