import { asset as bitcoin } from '@exodus/bitcoin-meta'
import { asset as ethereum } from '@exodus/ethereum-meta'

import config from '../../default-config.js'
import { processAssetBalances, validateBalances } from '../balances-utils.js'

const { balanceFieldsConfig } = config
const zero = 0

describe('processAssetBalances', () => {
  it('should return an empty object if balances is empty', () => {
    const expected = {
      balance: 0,
      spendable: 0,
      spendableBalance: 0,
      total: 0,
    }
    expect(processAssetBalances({ balances: {}, zero, balanceFieldsConfig })).toEqual(expected)
  })

  it('should retain legacy field names if new ones are not present', () => {
    const balances = { balance: 200, spendableBalance: 100 }
    const expected = {
      balance: 200,
      spendable: 100,
      spendableBalance: 100,
      total: 200,
    }
    expect(processAssetBalances({ balances, zero, balanceFieldsConfig })).toEqual(expected)
  })

  it('should map new field names to their legacy counterparts', () => {
    const balances = { total: 100, spendable: 50 }
    const expected = {
      balance: 100,
      spendable: 50,
      spendableBalance: 50,
      total: 100,
    }
    expect(processAssetBalances({ balances, zero, balanceFieldsConfig })).toEqual(expected)
  })

  it('should prioritize new field names over legacy ones', () => {
    const balances = { total: 100, balance: 200, spendable: 50, spendableBalance: 100 }
    const expected = { total: 100, balance: 100, spendable: 50, spendableBalance: 50 }
    expect(processAssetBalances({ balances, zero, balanceFieldsConfig })).toEqual(expected)
  })

  it('should map new field names to their legacy counterparts when partial', () => {
    const balances = { total: 100 }
    const expected = {
      balance: 100,
      spendable: 100,
      spendableBalance: 100,
      total: 100,
    }
    expect(processAssetBalances({ balances, zero, balanceFieldsConfig })).toEqual(expected)
  })

  it('should break if the configuration order is incorrect', () => {
    const balances = { total: 100 }
    expect(() =>
      processAssetBalances({
        balances,
        zero,
        balanceFieldsConfig: [...balanceFieldsConfig.reverse()],
      })
    ).toThrow('Field config "total" must be defined before "spendable"')
  })
})

describe('validateBalances', () => {
  test('when balances are correct', () => {
    const balances = {
      total: bitcoin.currency.defaultUnit(10),
      spendable: bitcoin.currency.defaultUnit(10),
      stakable: null,
    }

    const logger = { warn: jest.fn() }

    const curatedBalances = validateBalances({ balances, asset: bitcoin, logger })

    expect(curatedBalances).toEqual({
      total: bitcoin.currency.defaultUnit(10),
      spendable: bitcoin.currency.defaultUnit(10),
      stakable: null,
    })

    expect(logger.warn).not.toHaveBeenCalled()
  })

  test('when negative', () => {
    const balances = {
      total: bitcoin.currency.defaultUnit(-2),
      spendable: bitcoin.currency.defaultUnit(10),
      stakable: null,
    }

    const logger = { warn: jest.fn() }

    const curatedBalances = validateBalances({ balances, asset: bitcoin, logger })

    expect(curatedBalances).toEqual({
      total: bitcoin.currency.defaultUnit(0),
      spendable: bitcoin.currency.defaultUnit(10),
      stakable: null,
    })

    expect(logger.warn).toHaveBeenCalledWith(
      'getAssetBalances',
      'asset.api.getBalances bitcoin returns negative total',
      { amount: '-2 BTC' }
    )
  })

  test('when different currency', () => {
    const balances = {
      total: bitcoin.currency.defaultUnit(2),
      spendable: ethereum.currency.defaultUnit(10),
      stakable: null,
    }

    const logger = { warn: jest.fn() }

    const curatedBalances = validateBalances({ balances, asset: bitcoin, logger })

    expect(curatedBalances).toEqual({
      total: bitcoin.currency.defaultUnit(2),
      spendable: bitcoin.currency.defaultUnit(0),
      stakable: null,
    })

    expect(logger.warn).toHaveBeenCalledWith(
      'getAssetBalances',
      'asset.api.getBalances bitcoin returns different spendable currency',
      { assetUnit: 'BTC', balanceUnit: 'ETH' }
    )
  })
})
