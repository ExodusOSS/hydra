import { asset as bitcoin } from '@exodus/bitcoin-meta'

import { BTC_TX_AMOUNT_NUMBER } from '../fixtures.js'
import { setup } from '../utils.js'

describe('selectors.createUnconfirmedBalance', () => {
  it('should return unconfirmed balance', () => {
    const unconfirmedAmount = BTC_TX_AMOUNT_NUMBER
    const expected = bitcoin.currency.defaultUnit(unconfirmedAmount)
    const { store, selectors } = setup()

    const result = selectors.balances.createUnconfirmedBalance({
      assetName: 'bitcoin',
      walletAccount: 'account',
    })(store.getState())

    expect(result.toDefaultNumber()).toBe(expected.toDefaultNumber())
  })
})
