import { BUY_ORDER } from '@exodus/fiat-ramp/redux/__tests__/fixture.js'
import { FiatOrderSet, Tx } from '@exodus/models'
import { NFTS_NETWORK_TO_ASSET_NAME } from '@exodus/nfts/constants/index.js'

import { setup } from '../utils.js'

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

    expect(result[1].id).toEqual('ethereum.buy-order-tx.buy-order')
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

  test('should filter out spam NFTs from activity', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const txLogFixtures = {
      ethereum: [
        {
          txId: 'normal-tx',
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
          txId: 'spam-tx',
          error: null,
          date: '2019-07-22T14:54:28.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '0.5 ETH',
          coinName: 'ethereum',
          feeCoinName: 'ethereum',
          feeAmount: '0.000189 ETH',
          currencies: { ethereum: assets.ethereum.currency },
        },
      ],
    }

    const nftsTxs = {
      exodus_0: {
        ethereum: [
          {
            nftId: 'ethereum:normalNft:1',
            date: 1,
            from: 'ethereumAddress1',
            to: 'ethereumAddress2',
            txId: 'normal-tx',
          },
          {
            nftId: 'ethereum:spamNft:2',
            date: 2,
            from: 'ethereumAddress3',
            to: 'ethereumAddress4',
            txId: 'spam-tx',
          },
          {
            nftId: 'ethereum:unindexedNormalNft:3',
            date: 3,
            from: 'ethereumAddress5',
            to: 'ethereumAddress6',
            txId: 'unindexed-normal-tx',
          },
        ],
      },
    }

    // Active NFTs with isSpam property
    const activeNfts = {
      exodus_0: {
        ethereum: [
          { id: 'ethereum:normalNft:1', network: 'ethereum', isSpam: false },
          { id: 'ethereum:spamNft:2', network: 'ethereum', isSpam: true },
          { id: 'ethereum:unindexedNormalNft:3', network: 'ethereum', isSpam: false },
        ],
      },
    }

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: txLogFixtures.ethereum.map((tx) => Tx.fromJSON(tx)),
      },
    })
    handleEvent('personalNotes', [])
    handleEvent('connectedOrigins', [])
    handleEvent('nftsTxs', nftsTxs)
    handleEvent('nfts', activeNfts)
    handleEvent('fiatOrders', FiatOrderSet.fromArray([]))

    const createSelector = selectors.activityTxs.createFullActivity({
      nftsNetworkNameToAssetName: NFTS_NETWORK_TO_ASSET_NAME,
    })

    const selector = createSelector({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    const result = selector(store.getState())

    // Should only include normal NFTs and normal tx, filter out spam
    expect(result.length).toEqual(2)

    // Should find the indexed normal NFT
    const normalNftActivity = result.find((a) => a.id === 'nft.ethereum.normal-tx')
    expect(normalNftActivity).toBeTruthy()
    expect(normalNftActivity.type).toEqual('nft')
    expect(normalNftActivity.nft.nftId).toEqual('ethereum:normalNft:1')

    // Should find the unindexed normal NFT
    const unindexedNormalNftActivity = result.find(
      (a) => a.id === 'nft.ethereum.unindexed-normal-tx'
    )
    expect(unindexedNormalNftActivity).toBeTruthy()
    expect(unindexedNormalNftActivity.type).toEqual('nft')
    expect(unindexedNormalNftActivity.nft.nftId).toEqual('ethereum:unindexedNormalNft:3')

    // Should NOT find spam NFTs in the result
    expect(result.find((a) => a.nft && a.nft.nftId === 'ethereum:spamNft:2')).toBeUndefined()
  })

  test('should pass through regular transactions when filtering spam NFTs', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const txLogFixtures = {
      ethereum: [
        {
          txId: 'regular-tx',
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

    const nftsTxs = {
      exodus_0: {
        ethereum: [
          {
            nftId: 'ethereum:spamNft:1',
            date: 1,
            from: 'ethereumAddress1',
            to: 'ethereumAddress2',
            txId: 'spam-only-tx',
          },
        ],
      },
    }

    const activeNfts = {
      exodus_0: {
        ethereum: [{ id: 'ethereum:spamNft:1', network: 'ethereum', isSpam: true }],
      },
    }

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: txLogFixtures.ethereum.map((tx) => Tx.fromJSON(tx)),
      },
    })
    handleEvent('personalNotes', [])
    handleEvent('connectedOrigins', [])
    handleEvent('nftsTxs', nftsTxs)
    handleEvent('nfts', activeNfts)
    handleEvent('fiatOrders', FiatOrderSet.fromArray([]))

    const createSelector = selectors.activityTxs.createFullActivity({
      nftsNetworkNameToAssetName: NFTS_NETWORK_TO_ASSET_NAME,
    })

    const selector = createSelector({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    const result = selector(store.getState())

    // Should only include the regular transaction, filter out spam NFT
    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual('ethereum.regular-tx')
    expect(result[0].type).toEqual('rx')
  })
})
