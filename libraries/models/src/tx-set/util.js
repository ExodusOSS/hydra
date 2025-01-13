export function sortByAsc(txs) {
  return [...txs].sort((a, b) => {
    if (!checkTypeDate(a.date, b.date))
      throw new TypeError('TxSet.util.sortByAsc() objects must be Dates or numbers')
    return a.date - b.date
  })
}

export function sortByDesc(txs) {
  return [...txs].sort((a, b) => {
    if (!checkTypeDate(a.date, b.date))
      throw new TypeError('TxSet.util.sortByAsc() objects must be Dates or numbers')
    return b.date - a.date
  })
}

function checkTypeDate(a, b) {
  return (
    (a instanceof Date && b instanceof Date) || (typeof a === 'number' && typeof b === 'number')
  )
}
