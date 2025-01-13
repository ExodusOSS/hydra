import { prepareTime } from './date-utils'

const appendPricesWithRate = ({
  historicalPrices = Object.create(null),
  rate,
  type,
  currentTime,
}) => {
  if (historicalPrices instanceof Error) return null
  if (rate && rate.price) {
    const time = prepareTime(new Date(currentTime), type)
    return {
      ...historicalPrices,
      [time]: rate.price,
    }
  }

  return historicalPrices
}

export default appendPricesWithRate
