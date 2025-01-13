import { BUY_ORDER } from '@exodus/fiat-ramp/redux/__tests__/fixture'
import { FiatOrderSet, Tx } from '@exodus/models'
import { NFTS_NETWORK_TO_ASSET_NAME } from '@exodus/nfts/constants'

import { setup } from '../utils'

describe('createFullActivity', () => {
  test('should return empty array of activities in wallet', () => {
    const { store, selectors } = setup()
    const createSelector = selectors.activityTxs.createFullActivity({
      nftsNetworkNameToAssetName: NFTS_NETWORK_TO_ASSET_NAME,
    })

    const selector = createSelector({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    expect(selector(store.getState())).toEqual([])
  })

  test('should add nfts, fiat, connections to props', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const txLogFixtures = {
      ethereum: [
        {
          txId: 'received-tx',
          error: null,
          date: '2019-07-22T13:54:28.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '1 ETH',
          coinName: 'ethereum',
          feeCoinName: 'ethereum',
          feeAmount: '0.000189 ETH',
          currencies: { ethereum: assets.ethereum.currency },
        },
        {
          txId: 'buy-order-tx',
          error: null,
          date: '2019-07-22T13:54:28.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '1 ETH',
          coinName: 'ethereum',
          feeCoinName: 'ethereum',
          feeAmount: '0.000189 ETH',
          currencies: { ethereum: assets.ethereum.currency },
        },
      ],
    }

    const nfts = {
      exodus_0: {
        ethereum: [
          {
            nftId: 'someId1',
            date: 1,
            from: 'ethereumAddress1',
            to: 'ethereumAddress2',
            txId: 'received-tx',
          },
        ],
      },
    }

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: txLogFixtures.ethereum.map((tx) => Tx.fromJSON(tx)),
      },
    })
    handleEvent('personalNotes', [
      { txId: 'received-tx', message: 'message', providerData: { origin: 'someOrigin' } },
    ])
    handleEvent('connectedOrigins', [{ origin: 'someOrigin', foo: 'bar' }])
    handleEvent('nftsTxs', nfts)
    handleEvent('fiatOrders', FiatOrderSet.fromArray([{ ...BUY_ORDER, toAsset: 'ethereum' }]))

    const createSelector = selectors.activityTxs.createFullActivity({
      nftsNetworkNameToAssetName: NFTS_NETWORK_TO_ASSET_NAME,
    })

    const selector = createSelector({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    const result = selector(store.getState())

    expect(result.length).toEqual(2)
    expect(result[0].id).toEqual('nft.ethereum.received-tx')
    expect(result[0].type).toEqual('nft')
    expect(result[0].personalNote).toEqual({
      txId: 'received-tx',
      message: 'message',
      providerData: { origin: 'someOrigin' },
    })
    expect(result[0].connection).toEqual({ origin: 'someOrigin', foo: 'bar' })
    expect(result[0].nft).toEqual({
      date: 1,
      from: 'ethereumAddress1',
      network: 'ethereum',
      nftId: 'someId1',
      to: 'ethereumAddress2',
      txId: 'received-tx',
    })

    expect(result[1].id).toEqual('ethereum.buy-order-tx')
    expect(result[1].fiatOrder.toJSON()).toEqual({
      date: '2023-07-11T15:10:42.226Z',
      exodusRate: 35,
      fiatValue: 22,
      fromAddress: null,
      fromAmount: 42,
      fromAsset: 'USD',
      fromWalletAccount: null,
      orderId: 'buy-order',
      orderType: 'buy',
      provider: 'ramp',
      providerRate: 32,
      status: '',
      toAddress: 'toAddress',
      toAmount: 42,
      toAsset: 'ethereum',
      toWalletAccount: 'exodus_0',
      txId: 'buy-order-tx',
    })

    expect(result).toMatchSnapshot()
  })

  test('should support limit prop', () => {
    const { store, selectors, handleEvent, assets } = setup()
    const fixtures = {
      ethereum: [
        {
          txId: 'tx-id-1',
          error: null,
          date: '2019-07-22T13:54:28.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '-0.23637286 ETH',
          coinName: 'ethereum',
          feeCoinName: 'ethereum',
          feeAmount: '0.000189 ETH',
          to: '0xa96b536eef496e21f5432fd258b6f78cf3673f74',
          currencies: { ethereum: assets.ethereum.currency },
        },
        {
          txId: 'tx-id-2',
          error: null,
          date: '2019-07-22T14:18:09.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '0.24511145 ETH',
          coinName: 'ethereum',
          currencies: { ethereum: assets.ethereum.currency },
        },
        {
          txId: 'tx-id-3',
          error: null,
          date: '2019-07-23T11:23:39.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '0.31622234 ETH',
          coinName: 'ethereum',
          currencies: { ethereum: assets.ethereum.currency },
        },
      ],
    }

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: fixtures.ethereum.map((tx) => Tx.fromJSON(tx)),
      },
    })
    handleEvent('personalNotes', [])
    handleEvent('connectedOrigins', [])
    handleEvent('nftsTxs', {})
    handleEvent('fiatOrders', FiatOrderSet.fromArray([]))

    const createSelector = selectors.activityTxs.createFullActivity({
      nftsNetworkNameToAssetName: NFTS_NETWORK_TO_ASSET_NAME,
    })

    const selector = createSelector({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    const result = selector(store.getState())

    expect(result.length).toEqual(3)

    const limitedSelector = createSelector({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
      limit: 1,
    })

    const result2 = limitedSelector(store.getState())

    expect(result2.length).toEqual(1)
  })

  test('should work without personalNotes module', () => {
    const { store, selectors, handleEvent, assets } = setup({ withPersonalNotes: false })
    const fixtures = {
      ethereum: [
        {
          txId: 'tx-id-1',
          error: null,
          date: '2019-07-22T13:54:28.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '-0.23637286 ETH',
          coinName: 'ethereum',
          feeCoinName: 'ethereum',
          feeAmount: '0.000189 ETH',
          to: '0xa96b536eef496e21f5432fd258b6f78cf3673f74',
          currencies: { ethereum: assets.ethereum.currency },
        },
        {
          txId: 'tx-id-2',
          error: null,
          date: '2019-07-22T14:18:09.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '0.24511145 ETH',
          coinName: 'ethereum',
          currencies: { ethereum: assets.ethereum.currency },
        },
        {
          txId: 'tx-id-3',
          error: null,
          date: '2019-07-23T11:23:39.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '0.31622234 ETH',
          coinName: 'ethereum',
          currencies: { ethereum: assets.ethereum.currency },
        },
      ],
    }

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: fixtures.ethereum.map((tx) => Tx.fromJSON(tx)),
      },
    })
    handleEvent('connectedOrigins', [])
    handleEvent('nftsTxs', {})
    handleEvent('fiatOrders', FiatOrderSet.fromArray([]))

    const createSelector = selectors.activityTxs.createFullActivity({
      nftsNetworkNameToAssetName: NFTS_NETWORK_TO_ASSET_NAME,
    })

    const selector = createSelector({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    const result = selector(store.getState())

    expect(result.length).toEqual(3)
  })
})
