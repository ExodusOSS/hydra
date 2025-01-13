import { Tx } from '@exodus/models'
import { NFTS_NETWORK_TO_ASSET_NAME } from '@exodus/nfts/constants'

import { setup } from '../utils'

describe('createWithNftsActivity', () => {
  test('should return empty array of activities in wallet', () => {
    const { store, selectors } = setup()
    const createSelector = selectors.activityTxs.createWithNftsActivity({
      createActivitySelector: selectors.activityTxs.createAssetSourceBaseActivity,
      nftsNetworkNameToAssetName: NFTS_NETWORK_TO_ASSET_NAME,
    })

    const selector = createSelector({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    expect(selector(store.getState())).toEqual([])
  })

  test('should add nfts to activity props', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const txLogFixtures = {
      ethereum: [
        {
          txId: 'some-receive-tx',
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
            txId: 'some-receive-tx',
          },
          {
            nftId: 'unindexedNft',
            date: 2,
            from: 'ethereumAddress3',
            to: 'ethereumAddress4',
            txId: 'unknowntx',
          },
        ],
      },
    }

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: txLogFixtures.ethereum.map((tx) => Tx.fromJSON(tx)),
      },
    })
    handleEvent('nftsTxs', nfts)

    const createSelector = selectors.activityTxs.createWithNftsActivity({
      createActivitySelector: selectors.activityTxs.createAssetSourceBaseActivity,
      nftsNetworkNameToAssetName: NFTS_NETWORK_TO_ASSET_NAME,
    })

    const selector = createSelector({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    const result = selector(store.getState())

    expect(result.length).toEqual(2)
    expect(result[0].id).toEqual('nft.ethereum.some-receive-tx')
    expect(result[1].id).toEqual('nft.ethereum.unknowntx')
    expect(result[0].type).toEqual('nft')
    expect(result[1].type).toEqual('nft')
    expect(result[0].nft).toEqual({
      date: 1,
      from: 'ethereumAddress1',
      network: 'ethereum',
      nftId: 'someId1',
      to: 'ethereumAddress2',
      txId: 'some-receive-tx',
    })
    expect(result[1].nft).toEqual({
      date: 2,
      from: 'ethereumAddress3',
      network: 'ethereum',
      nftId: 'unindexedNft',
      to: 'ethereumAddress4',
      txId: 'unknowntx',
    })
  })

  test('should return same activity if no nfts added', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const txLogFixtures = {
      ethereum: [
        {
          txId: 'some-receive-tx',
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
        bitcoin: [
          {
            nftId: 'someId1',
            date: 1,
            from: 'from',
            to: 'to',
            txId: 'tx-id',
          },
        ],
      },
    }

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: txLogFixtures.ethereum.map((tx) => Tx.fromJSON(tx)),
      },
    })
    handleEvent('nftsTxs', nfts)

    const baseSelector = selectors.activityTxs.createAssetSourceBaseActivity

    const createSelector = selectors.activityTxs.createWithNftsActivity({
      createActivitySelector: baseSelector,
      nftsNetworkNameToAssetName: NFTS_NETWORK_TO_ASSET_NAME,
    })

    const selector = createSelector({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    const result = selector(store.getState())
    const baseSelectorResult = baseSelector({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })(store.getState())

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual('ethereum.some-receive-tx')
    expect(result[0].type).toEqual('rx')
    expect(result[0].nft).toEqual(undefined)
    expect(result).toEqual(baseSelectorResult)
  })
})
