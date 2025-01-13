import { ORDERS_COUNT_WITH_GUARANTEED_MATCH, ORDERS_LIMIT_FOR_4_SUM } from './constants.js'

// O(n)
const findTwoSum = (arr, target) => {
  const numObject = {}
  for (const [i, element] of arr.entries()) {
    const thisNum = element.toString({ unit: false })
    numObject[thisNum] = i
  }

  for (const [i, element] of arr.entries()) {
    const diff = target.sub(element).toString({ unit: false })
    if (numObject.hasOwnProperty(diff) && numObject[diff] !== i) {
      return [i, numObject[diff]]
    }
  }
}

// O(n²). One of the best solutions based on leetCode :)
const findThreeSum = (arr, target) => {
  // we need 3 values for this to work
  // so return if we have less than 3
  if (arr.length < 3) {
    return null
  }

  // sorting is ok because the function is already O(n^2)
  // and sort is O(nlogn)
  // this also lets us stop iterating once were passed the target value
  const sortedArr = arr
    .map((value, index) => ({
      value,
      originalIndex: index,
    }))
    .sort((a, b) => a.value.sub(b.value))

  // well use i as our anchor as we move through the array
  // we stop at nums.length - 2 to prevent undefined for k
  for (let i = 0; i < sortedArr.length - 2; i++) {
    // because we sorted the array already
    // we can stop here if the current iterator is greater than the target value
    if (sortedArr[i].value.gt(target)) {
      break
    }

    // if our iterator is the same as the previous value
    // skip it to prevent duplicate results
    if (i > 0 && sortedArr[i].value.equals(sortedArr[i - 1].value)) {
      continue
    }

    // start j at i + 1
    let j = i + 1

    // start k at end of array
    let k = sortedArr.length - 1

    // walking j and k towards each other to find all possible values
    // with i as our anchor value
    while (j < k) {
      const sum = sortedArr[i].value.add(sortedArr[j].value).add(sortedArr[k].value)
      if (sum.equals(target)) {
        return [sortedArr[i].originalIndex, sortedArr[j].originalIndex, sortedArr[k].originalIndex]
      }

      if (sum.lt(target)) {
        j++
        continue
      }

      if (sum.gt(target)) {
        k--
      }
    }
  }

  return null
}

// O(n^3). based on https://baffinlee.com/leetcode-javascript/problem/4sum.html
const findFourSum = (arr, target) => {
  if (arr.length < 4) return []

  const len = arr.length
  const res = []
  let l = 0
  let r = 0
  let sum = 0

  const sortedArr = arr
    .map((value, index) => ({
      value,
      originalIndex: index,
    }))
    .sort((a, b) => a.value.sub(b.value))

  for (let i = 0; i < len - 3; i++) {
    if (i > 0 && sortedArr[i].value.equals(sortedArr[i - 1].value)) continue
    const leftSum = sortedArr[i].value
      .add(sortedArr[i + 1].value)
      .add(sortedArr[i + 2].value)
      .add(sortedArr[i + 3].value)
    if (leftSum.gt(target)) break
    const rightSum = sortedArr[i].value
      .add(sortedArr[len - 1].value)
      .add(sortedArr[len - 2].value)
      .add(sortedArr[len - 3].value)
    if (rightSum.lt(target)) continue

    for (let j = i + 1; j < len - 2; j++) {
      if (j > i + 1 && sortedArr[j].value.equals(sortedArr[j - 1].value)) continue

      const firstValuesSum = sortedArr[i].value.add(sortedArr[j].value)

      const leftSum = firstValuesSum.add(sortedArr[j + 1].value).add(sortedArr[j + 2].value)
      if (leftSum.gt(target)) break

      const rightSum = firstValuesSum.add(sortedArr[len - 1].value).add(sortedArr[len - 2].value)

      if (rightSum.lt(target)) continue

      l = j + 1
      r = len - 1

      while (l < r) {
        sum = sortedArr[i].value
          .add(sortedArr[j].value)
          .add(sortedArr[l].value)
          .add(sortedArr[r].value)

        if (sum.lt(target)) {
          l++
        } else if (sum.gt(target)) {
          r--
        } else {
          return [
            sortedArr[i].originalIndex,
            sortedArr[j].originalIndex,
            sortedArr[l].originalIndex,
            sortedArr[r].originalIndex,
          ]
        }
      }
    }
  }

  return res
}

// usually partners pay for orders created one-after-another
// so we can check only combinations of siblings
const findSiblingsSum = (orders, targetValue) => {
  const ordersWithOriginalIndexes = orders.map((order, index) => ({
    toAmount: order.toAmount,
    originalIndex: index,
  }))

  // note: orders are DESC by date
  // src/_local_modules/app-models/order-set/index.js:54
  // there is higher chance that tx pays for older orders first
  // in loop we check only pairs >2. No reason to check match with 1,2-sums cause it was done before.
  let i = ordersWithOriginalIndexes.length - 1
  while (i >= 0) {
    const order = ordersWithOriginalIndexes[i]
    let acc = {
      amount: order.toAmount,
      indexes: [order.originalIndex],
    }

    if (acc.amount.gt(targetValue)) {
      i--
      continue
    }

    let j = i - 1

    while (j >= 0) {
      const order = ordersWithOriginalIndexes[j]

      acc = {
        amount: acc.amount.add(order.toAmount),
        indexes: [...acc.indexes, order.originalIndex],
      }

      if (acc.amount.gt(targetValue)) {
        break
      }

      if (j !== i - 1 && acc.amount.equals(targetValue)) {
        j--
        return acc.indexes
      }

      j--
    }

    i--
  }
}

// subject for optimization to increase ORDERS_COUNT_WITH_GUARANTEED_MATCH
const findNSum = function (orders, targetValue, size) {
  const sortedArr = orders
    .map((value, index) => ({
      value,
      originalIndex: index,
    }))
    .sort((a, b) => a.value.sub(b.value))

  // k represents N in N-sum,
  function recurse(arr, target, res, k) {
    if (k === 2) {
      const arrayOfValues = arr.map((o) => o.value)
      const twoSumResult = findTwoSum(arrayOfValues, target)

      if (twoSumResult && twoSumResult.length > 0) {
        return [...res, ...twoSumResult.map((index) => arr[index].originalIndex)]
      }

      return
    }

    for (let i = 0; i < arr.length; i++) {
      if (i > 0 && arr[i].value.equals(arr[i - 1].value)) {
        continue
      }

      const result = recurse(
        arr.slice(i + 1),
        target.sub(arr[i].value),
        [...res, arr[i].originalIndex],
        k - 1
      )
      if (result) {
        return result
      }
    }
  }

  return recurse(sortedArr, targetValue, [], size)
}

const findSums = (orders, targetValue, _maxSize) => {
  const maxSize = _maxSize || Math.min(ORDERS_COUNT_WITH_GUARANTEED_MATCH, orders.length)
  const arrayOfValues = orders.map((o) => o.toAmount)

  for (let i = 1; i <= maxSize; i++) {
    switch (i) {
      case 1: {
        const totalSum = arrayOfValues.reduce(
          (acc, nextValue) => (acc ? acc.add(nextValue) : nextValue),
          null
        )
        if (!totalSum) return []
        if (totalSum.equals(targetValue)) {
          return [...arrayOfValues.keys()]
        }

        break
      }

      case 2: {
        const res = findTwoSum(arrayOfValues, targetValue)
        if (res && res.length > 0) return res
        break
      }

      case 3: {
        // calculate siblings first cause it's fast and probability of this is higher
        const siblings = findSiblingsSum(orders, targetValue)
        if (siblings && siblings.length > 0) return siblings

        const res = findThreeSum(arrayOfValues, targetValue)
        if (res && res.length > 0) return res
        break
      }

      case 4: {
        if (arrayOfValues.length > ORDERS_LIMIT_FOR_4_SUM) {
          break
        }

        const res = findFourSum(arrayOfValues, targetValue)
        if (res && res.length > 0) return res
        if (arrayOfValues.length > ORDERS_COUNT_WITH_GUARANTEED_MATCH) {
          break
        }

        let nres
        for (let j = 5; j <= arrayOfValues.length; j++) {
          nres = findNSum(arrayOfValues, targetValue, j)
          if (nres && nres.length > 0) return nres
        }

        break
      }
    }
  }
}

export default findSums
