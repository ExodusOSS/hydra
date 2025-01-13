import AccountState from '../index.js'
import { bitcoin, cardano, ethereum } from '../../__tests__/_fixtures-currencies.js'

export class HelloAccountState extends AccountState {
  static defaults = {
    balance: cardano.ZERO,
    tokenBalances: {},
  }
}

test('create with empty data', () => {
  const result = HelloAccountState.create()
  expect(result.balance).toEqual(cardano.ZERO)
  expect(result.tokenBalances).toEqual({})
})

test('merge balance, tokenBalances 3 times', () => {
  const result = HelloAccountState.create({})
  expect(result.balance).toEqual(cardano.ZERO)
  expect(result.tokenBalances).toEqual({})

  const firstMerge = result.merge({
    balance: cardano.baseUnit(1),
    tokenBalances: { bitcoin: bitcoin.baseUnit(1) },
  })

  expect(firstMerge.balance).toEqual(cardano.baseUnit(1))
  expect(firstMerge.tokenBalances).toEqual({ bitcoin: bitcoin.baseUnit(1) })

  const secondMerge = firstMerge.merge({
    tokenBalances: { ethereum: ethereum.baseUnit(2) },
  })

  expect(secondMerge.balance).toEqual(cardano.baseUnit(1))
  expect(secondMerge.tokenBalances).toEqual({
    // bitcoin: bitcoin.baseUnit(1), tokenBalances overrides, not deep merge
    ethereum: ethereum.baseUnit(2),
  })

  const thirdMerge = secondMerge.merge({
    balance: cardano.baseUnit(3),
    tokenBalances: { bitcoin: bitcoin.baseUnit(3), ethereum: ethereum.baseUnit(3) },
  })

  expect(thirdMerge.balance).toEqual(cardano.baseUnit(3))
  expect(thirdMerge.tokenBalances).toEqual({
    bitcoin: bitcoin.baseUnit(3),
    ethereum: ethereum.baseUnit(3),
  })
})
