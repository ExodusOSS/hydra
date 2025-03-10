import { createSelector } from 'reselect'
import { OrderSet } from '@exodus/models'

export const resultFunc = (orderSet) => {
  if (!orderSet || orderSet.size === 0) return OrderSet.EMPTY

  return orderSet.filter(
    (order) => order.exodusStatus === 'in-progress' && !order.hasOptimisticStatus
  )
}

const createOrdersInProgressSelector = ({ orderSetSelector }) =>
  createSelector(orderSetSelector, resultFunc)

export default createOrdersInProgressSelector
