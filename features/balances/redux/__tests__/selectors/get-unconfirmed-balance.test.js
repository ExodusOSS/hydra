import { asset as bitcoin } from '@exodus/bitcoin-meta'

import { BTC_TX_AMOUNT_NUMBER } from '../fixtures.js'
import { setup } from '../utils.js'

describe('selectors.getUnconfirmedBalance', () => {
  it('should return unconfirmed balance', () => {
    const unconfirmedAmount = BTC_TX_AMOUNT_NUMBER
    const expected = bitcoin.currency.defaultUnit(unconfirmedAmount)
    const { store, selectors } = setup()

    const result = selectors.balances.getUnconfirmedBalance(store.getState())({
      assetName: 'bitcoin',
      walletAccount: 'account',
    })

    expect(result.toDefaultNumber()).toBe(expected.toDefaultNumber())
  })
})
