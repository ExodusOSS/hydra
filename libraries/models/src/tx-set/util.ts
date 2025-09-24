import type TxSet from './index.js'
import type Tx from '../tx/index.js'

export function sortByAsc(txs: TxSet | Tx[]) {
  return [...txs].sort((a, b) => {
    if (!checkTypeDate(a.date, b.date)) {
      throw new TypeError('TxSet.util.sortByAsc() objects must be Dates or numbers')
    }

    return +a.date - +b.date
  })
}

export function sortByDesc(txs: TxSet | Tx[]) {
  return [...txs].sort((a, b) => {
    if (!checkTypeDate(a.date, b.date)) {
      throw new TypeError('TxSet.util.sortByAsc() objects must be Dates or numbers')
    }

    return +b.date - +a.date
  })
}

function checkTypeDate(a: Date | number | unknown, b: Date | number | unknown) {
  return (
    (a instanceof Date && b instanceof Date) || (typeof a === 'number' && typeof b === 'number')
  )
}
