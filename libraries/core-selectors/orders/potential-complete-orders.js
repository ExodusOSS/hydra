import { createSelector } from 'reselect'
import { OrderSet } from '@exodus/models'

export const resultFunc = (orderSet) => {
  if (!orderSet || orderSet.size === 0) return OrderSet.EMPTY

  return orderSet.filter((order) => order.status === 'potential-complete')
}

const createPotentialCompleteOrdersSelector = ({ orderSetSelector }) =>
  createSelector(orderSetSelector, resultFunc)

export default createPotentialCompleteOrdersSelector
