// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import findSums from './find-nu-sums.js'
import {
  ORDERS_COUNT_WITH_GUARANTEED_MATCH,
  EOS_MAX_RAM_COST,
  DEFAULT_ORDER_TO_AMOUNT_SLIPPAGE,
} from './constants.js'

const { groupBy, union } = lodash

// Pure matching core over plain order fields; callers decide whether to persist the returned assignments
export const matchOrdersAndTxs = ({ receivedTxs, orders, txLog }) => {
  let potentialToTxIds = orders.reduce((acc, order) => {
    if (order.status === 'potential-complete') {
      order.potentialToTxIds.forEach((txId) => {
        if (!acc.includes(txId)) {
          acc.push(txId)
        }
      })
    }

    return acc
  }, [])
  let ordersCopy = [...orders]
  const assignments = []
  const matchedTxIds = []

  const handleMatchedResult = (indexes, tx) => {
    indexes.forEach((index) => {
      assignments.push({
        order: ordersCopy[index],
        update: {
          status: 'optimistic-complete',
          toTxId: tx ? tx.txId : null,
          potentialToTxIds: [], // reset if there was something
        },
      })
      ordersCopy[index] = null
    })

    ordersCopy = ordersCopy.filter((o) => !!o)
    if (tx && tx.txId) {
      matchedTxIds.push(tx.txId)
    }
  }

  const handlePotentialOrders = (indexes, txs) => {
    if (indexes.length === 0) return
    // mark so that know about it on next receivedTx loop
    const matchedPotentialToTxIds = txs.map((tx) => tx.txId)
    potentialToTxIds = union(matchedPotentialToTxIds, potentialToTxIds)

    // we don't delete items from ordersCopy here, for next receivedTx loop.
    indexes.forEach((index) => {
      assignments.push({
        order: orders[index],
        update: {
          status: 'potential-complete',
          potentialToTxIds: matchedPotentialToTxIds,
        },
      })
    })
  }

  const markPotentialOrders = (txs) => {
    const targetAmount = txs.reduce(
      (acc, tx) => (acc ? acc.add(tx.coinAmount) : tx.coinAmount),
      null
    )

    let acc = {
      value: null,
      indexes: [],
    }
    // ideally provider should pay for orders using time sort,
    // but this case should be found on previous steps
    // now our goal is to minimize difference in user balance,
    // so it's better find combination which sum is closer to tx amounts
    // easier to do it if sort orders
    const sortedByValue = ordersCopy
      .map((o, index) => ({
        ...o,
        originalIndex: index,
      }))
      .sort((a, b) => a.toAmount.sub(b.toAmount))

    for (const [i, order] of sortedByValue.entries()) {
      // first order is smallest.
      // stop process cause these orders are not related to received tx
      if (i === 0 && order.toAmount.gte(targetAmount)) {
        return
      }

      const prevValue = acc.value
      const prevIndexes = acc.indexes
      const nextValue = prevValue ? prevValue.add(order.toAmount) : order.toAmount
      const nextIndexes = [...acc.indexes, order.originalIndex]

      // we finally matched all potential+pending order with all potential txs and received tx
      // now we can mark them as optimistic-complete
      if (nextValue.equals(targetAmount)) {
        potentialToTxIds = []
        return handleMatchedResult(nextIndexes)
      }

      // even if first value is already > targetAmount mark this order as potential
      if (i === 0 && nextValue.gte(targetAmount)) {
        return handlePotentialOrders([order.originalIndex], txs)
      }

      // mark order indexes which sum is smaller than target amount
      if (nextValue.gte(targetAmount)) {
        return handlePotentialOrders(prevIndexes, txs)
      }

      acc = {
        value: nextValue,
        indexes: nextIndexes,
      }
    }
  }

  // note: received txs sorted from old to new. ASC
  receivedTxs.forEach((tx) => {
    if (ordersCopy.length === 0) return
    const amount = tx.coinAmount
    const txId = tx.txId

    // from this moment we use all potential-complete orders + pending orders
    // to try to match them with current tx + txs that were matched with potential-complete orders before
    // this way we will match as as much as possible orders and decrease difference between real balance and displayed balance.
    // Until sum of all orders + all txs will be equal OR monitor updates.
    if (potentialToTxIds.length > 0) {
      const potentialTxs = potentialToTxIds.map((txId) => txLog.get(txId))
      return markPotentialOrders([tx, ...potentialTxs])
    }

    const matchByIdIndex = ordersCopy.findIndex((order) => txId === order.toTxId)
    if (matchByIdIndex !== -1) {
      return handleMatchedResult([matchByIdIndex], tx)
    }

    // Abstain when 2+ orders fall in the slippage window — picking by array
    // order has glued payouts onto unrelated orders (exodus-desktop#19477).
    // Fall through; the server-supplied toTxId resolves on a later tick.
    const simpleMatchIndexes = []
    for (const [index, order] of ordersCopy.entries()) {
      const { toAmount, slippage = DEFAULT_ORDER_TO_AMOUNT_SLIPPAGE } = order
      const lower = amount.mul(1 - slippage / 100)
      const upper = amount.mul(1 + slippage / 100)
      if (toAmount.gt(lower) && toAmount.lt(upper)) {
        simpleMatchIndexes.push(index)
        if (simpleMatchIndexes.length > 1) break
      }
    }

    if (simpleMatchIndexes.length === 1) {
      return handleMatchedResult([simpleMatchIndexes[0]], tx)
    }

    const totalSum = ordersCopy.reduce(
      (acc, order) => (acc ? acc.add(order.toAmount) : order.toAmount),
      null
    )
    // no reason to match orders if total sum less then tx amount.
    if (totalSum.lt(tx.coinAmount)) {
      return
    }

    const matchedOrderIndexes = findSums(ordersCopy, amount)
    if (matchedOrderIndexes) {
      return handleMatchedResult(matchedOrderIndexes, tx)
    }

    // last chance, since we don't calculate all sums due to performance reasons we may missed something if orders > 4
    // simply mark orders in group which sum is higher or equal to tx amount as "potentially-complete"
    if (ordersCopy.length > ORDERS_COUNT_WITH_GUARANTEED_MATCH) {
      markPotentialOrders([tx])
    }
  })

  return {
    assignments,
    matchedTxIds,
  }
}

const findOptimisticOrders = ({ incomingOrders, postTxs, preTxs }) => {
  if (incomingOrders.length === 0) return []

  let receivedTxs = [...postTxs].filter((tx) => {
    const isNew = !preTxs.get(tx.txId)
    return isNew && !tx.failed
  })
  if (receivedTxs.length === 0) return []

  const groupedOrders = groupBy(incomingOrders, (order) => order.svc)

  const result = Object.values(groupedOrders).reduce((acc, orders) => {
    if (receivedTxs.length === 0) return acc
    const { assignments, matchedTxIds } = matchOrdersAndTxs({
      receivedTxs,
      orders,
      txLog: postTxs,
    })
    receivedTxs = receivedTxs.filter((tx) => !matchedTxIds.includes(tx.txId))

    acc.push(...assignments.map(({ order, update }) => order.update(update)))

    return acc
  }, [])

  // received account creation tx. it's amount is lower than order, cause some spent on RAM
  if (
    result.length === 0 &&
    preTxs.size === 0 &&
    postTxs.size === 1 &&
    receivedTxs.length > 0 &&
    receivedTxs[0].coinName === 'eosio'
  ) {
    const tx = receivedTxs[0]
    const matchedOrder = incomingOrders.find((o) => {
      const delta = o.toAmount.sub(tx.coinAmount)
      // TODO: figure out whether we should use toDefaultNumber instead
      // oxlint-disable-next-line @exodus/oxlint-plugin-hydra/no-unsafe-number-unit-methods
      return delta.abs().toNumber() <= EOS_MAX_RAM_COST
    })

    return [
      matchedOrder.update({
        status: 'optimistic-complete',
        toTxId: tx ? tx.txId : null,
        potentialToTxIds: [],
      }),
    ]
  }

  return result
}

export default findOptimisticOrders
