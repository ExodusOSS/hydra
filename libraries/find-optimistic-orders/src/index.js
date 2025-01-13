// eslint-disable-next-line @exodus/restricted-imports/prefer-basic-utils
import lodash from 'lodash'
import findSums from './find-nu-sums.js'
import { ORDERS_COUNT_WITH_GUARANTEED_MATCH, EOS_MAX_RAM_COST } from './constants.js'

const { groupBy, union } = lodash

const matchOrdersAndTxs = ({ receivedTxs, orders, txLog }) => {
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
  const updatedOrders = []
  const matchedTxIds = []

  const handleMatchedResult = (indexes, tx) => {
    indexes.forEach((index) => {
      const updatedOrder = ordersCopy[index].update({
        status: 'optimistic-complete',
        toTxId: tx ? tx.txId : null,
        potentialToTxIds: [], // reset if there was something
      })
      updatedOrders.push(updatedOrder)
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
      const updatedOrder = orders[index].update({
        status: 'potential-complete',
        potentialToTxIds: matchedPotentialToTxIds,
      })
      updatedOrders.push(updatedOrder)
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
        return handlePotentialOrders([i], txs)
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

    const simpleMatchIndex = ordersCopy.findIndex((order) => amount.equals(order.toAmount))
    if (simpleMatchIndex !== -1) {
      return handleMatchedResult([simpleMatchIndex], tx)
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
    updatedOrders,
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
    const { updatedOrders, matchedTxIds } = matchOrdersAndTxs({
      receivedTxs,
      orders,
      txLog: postTxs,
    })
    receivedTxs = receivedTxs.filter((tx) => !matchedTxIds.includes(tx.txId))

    acc.push(...updatedOrders)

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
      // eslint-disable-next-line @exodus/hydra/no-unsafe-number-unit-methods
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
