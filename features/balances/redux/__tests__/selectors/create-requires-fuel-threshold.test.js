import { connectAssets } from '@exodus/assets'
import _assets from '@exodus/assets-base'
import { pick } from '@exodus/basic-utils'

import { setup } from '../utils.js'

const assets = connectAssets(_assets)
const assetsToEmit = pick(assets, ['ethereum', 'tetherusd'])

const balancesToEmit = {
  balances: {
    exodus_0: {
      ethereum: {
        total: assets.ethereum.currency.defaultUnit(42),
      },
      tetherusd: {
        total: assets.tetherusd.currency.defaultUnit(10),
      },
    },
    exodus_1: {
      ethereum: {
        total: assets.ethereum.currency.defaultUnit(12),
      },
      tetherusd: {
        total: assets.tetherusd.currency.defaultUnit(0),
      },
    },
  },
}

describe('selectors.createRequiresFuelThreshold', () => {
  it('should return false if txLog is not loaded', () => {
    const { store, selectors } = setup({
      dependencies: [
        {
          id: 'txLog.selectors.createIsWalletAccountLoadedSelectorOld',
          factory: () => () => () => false,
        },
      ],
    })

    const result = selectors.balances.createRequiresFuelThreshold({
      assetName: 'bitcoin',
      walletAccount: 'exodus_0',
    })(store.getState())

    expect(result).toBe(false)
  })

  it("should return false if there's no such asset", () => {
    const { store, selectors } = setup()

    const result = selectors.balances.createRequiresFuelThreshold({
      assetName: 'noncoin',
      walletAccount: 'exodus_0',
    })(store.getState())

    expect(result).toBe(false)
  })

  it("should return true for ethereum if there's tetherusd balance, only for given account", () => {
    const { store, selectors, emitBalances, emitAssets } = setup()
    emitAssets(assetsToEmit)
    emitBalances(balancesToEmit)

    const exodus0Result = selectors.balances.createRequiresFuelThreshold({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })(store.getState())

    expect(exodus0Result).toBe(true)

    const exodus1Result = selectors.balances.createRequiresFuelThreshold({
      assetName: 'ethereum',
      walletAccount: 'exodus_1',
    })(store.getState())

    expect(exodus1Result).toBe(false)
  })

  it("should return true for tetherusd if there's ethereum balance", () => {
    const { store, selectors, emitBalances, emitAssets } = setup()
    emitAssets(assetsToEmit)
    emitBalances(balancesToEmit)

    const exodus0Result = selectors.balances.createRequiresFuelThreshold({
      assetName: 'tetherusd',
      walletAccount: 'exodus_0',
    })(store.getState())

    expect(exodus0Result).toBe(true)
  })
})
