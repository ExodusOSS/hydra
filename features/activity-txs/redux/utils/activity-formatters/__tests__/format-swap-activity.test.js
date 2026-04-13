import assets from '@exodus/assets-base'

import { formatSwapActivity, formatUnindexedOrder } from '../format-swap-activity.js'

describe('format-swap-activity', () => {
  test('should use fromAmount when formatting the funded tx side of a swap', () => {
    const absAmount = assets.algorand.currency.defaultUnit(100)
    const result = formatSwapActivity({
      tx: {
        txId: 'from-tx',
        date: new Date('2023-09-13T11:59:24.204Z'),
        coinName: 'algorand',
        coinAmount: assets.algorand.currency.defaultUnit(999),
      },
      order: {
        orderId: 'order-1',
        fromAsset: 'algorand',
        fromAmount: assets.algorand.currency.defaultUnit(-100),
        toAsset: 'flare',
        exodusStatus: 'failed',
        error: new Error('failed'),
      },
    })

    expect(result.assetName).toBe('algorand')
    expect(result.txId).toBe('from-tx')
    expect(result.displayAmount).toEqual(absAmount)
  })

  test('should fallback to tx coin amount when the matching order amount is missing', () => {
    const absAmount = assets.flare.currency.defaultUnit(321)
    const result = formatSwapActivity({
      tx: {
        txId: 'to-tx',
        date: new Date('2023-09-13T11:59:24.204Z'),
        coinName: 'flare',
        coinAmount: assets.flare.currency.defaultUnit(-321),
      },
      order: {
        orderId: 'order-1',
        fromAsset: 'algorand',
        fromAmount: assets.algorand.currency.defaultUnit(100),
        toAsset: 'flare',
        exodusStatus: 'failed',
        error: new Error('failed'),
      },
    })

    expect(result.assetName).toBe('flare')
    expect(result.txId).toBe('to-tx')
    expect(result.displayAmount).toEqual(absAmount)
  })

  test('should format the funded side of an unindexed order', () => {
    const absAmount = assets.algorand.currency.defaultUnit(100)
    const result = formatUnindexedOrder({
      assetName: 'algorand',
      order: {
        orderId: 'order-1',
        date: new Date('2023-09-13T11:59:24.204Z'),
        fromAsset: 'algorand',
        fromAmount: assets.algorand.currency.defaultUnit(-100),
        fromTxId: 'from-tx',
        toAsset: 'flare',
        toAmount: assets.flare.currency.defaultUnit(10_000),
        toTxId: 'to-tx',
        exodusStatus: 'failed',
        error: new Error('failed'),
      },
    })

    expect(result.assetName).toBe('algorand')
    expect(result.txId).toBe('from-tx')
    expect(result.displayAmount).toEqual(absAmount)
  })

  test('should return null when the requested side is missing an amount', () => {
    const result = formatUnindexedOrder({
      assetName: 'flare',
      order: {
        orderId: 'order-1',
        date: new Date('2023-09-13T11:59:24.204Z'),
        fromAsset: 'algorand',
        fromAmount: assets.algorand.currency.defaultUnit(100),
        fromTxId: 'from-tx',
        toAsset: 'flare',
        toTxId: null,
        exodusStatus: 'failed',
        error: new Error('failed'),
      },
    })

    expect(result).toBeNull()
  })
})
