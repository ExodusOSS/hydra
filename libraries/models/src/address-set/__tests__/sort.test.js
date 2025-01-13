import test from '../../../_test.js'
import AddressSet from '../index.js'
import Address from '../../address/index.js'
import lodash from 'lodash'

const { shuffle } = lodash

test('sort() pathSorter', (t) => {
  const a1 = Address.create('a1', { path: 'm/0/0' })
  const a2 = Address.create('a2', { path: 'm/0/1' })
  const a3 = Address.create('a3', { path: 'm/1/0' })
  const a4 = Address.create('a4', { path: 'm/1/1' })
  const a5 = Address.create('a5', { path: 'm/2/0' })
  const a6 = Address.create('a6', { path: 'm/2/1' })
  const arrSorted = [a1, a2, a3, a4, a5, a6]
  const arrShuffled = shuffle(arrSorted)

  const acShuffled = AddressSet.fromArray(arrShuffled)

  const acSorted = acShuffled.sort(AddressSet.PATH_SORTER)
  const arrSortedActual = [...acSorted]

  t.deepEqual(arrSorted, arrSortedActual, 'sorted arrays equal')

  t.end()
})

test('sort() pathSorter', (t) => {
  const a1 = Address.create('a1', { path: 'm/0/0' })
  const a2 = Address.create('a2', { path: 'm/0/1' })
  const a3 = Address.create('a3', { path: 'm/0/2' })
  const a4 = Address.create('a4', { path: 'm/0/3' })
  const a5 = Address.create('a5', { path: 'm/0/4' })
  const a6 = Address.create('a6', { path: 'm/0/5' })
  const arrSorted = [a1, a2, a3, a4, a5, a6]
  const arrShuffled = shuffle(arrSorted)

  const acShuffled = AddressSet.fromArray(arrShuffled)

  const acSorted = acShuffled.sort(AddressSet.PATH_SORTER)
  const arrSortedActual = [...acSorted]

  t.deepEqual(arrSorted, arrSortedActual, 'sorted arrays equal')

  t.end()
})
