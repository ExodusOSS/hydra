export function formatPercentage(percentage: string | number, noPlus = false) {
  percentage = Number(percentage)
  let str = ''

  // Convert to a string and remove trailing zeros
  let percentageString = percentage.toFixed(1).replace(/\.0+$/u, '')

  if (Math.abs(percentage) >= 1000) {
    // Add commas every three digits from right to left
    percentageString = percentageString.replace(/\B(?=(\d{3})+(?!\d))/gu, ',')
  }

  const resultNumber = parseFloat(percentageString)

  if (resultNumber === 0) {
    return '0%'
  }

  if (!noPlus) str = resultNumber > 0 ? '+' : ''

  str += percentageString
  str += '%'
  return str
}
