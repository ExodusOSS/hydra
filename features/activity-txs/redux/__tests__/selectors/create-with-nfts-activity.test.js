import { Tx } from '@exodus/models'
import { NFTS_NETWORK_TO_ASSET_NAME } from '@exodus/nfts/constants/index.js'

import { setup } from '../utils.js'

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

  test('should filter out spam nfts from activity', () => {
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
        {
          txId: 'not-nft-tx',
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
          {
            nftId: 'ethereum:unindexedSpamNft:4',
            date: 4,
            from: 'ethereumAddress7',
            to: 'ethereumAddress8',
            txId: 'unindexed-spam-tx',
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
          { id: 'ethereum:unindexedSpamNft:4', network: 'ethereum', isSpam: true },
        ],
      },
    }

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: txLogFixtures.ethereum.map((tx) => Tx.fromJSON(tx)),
      },
    })
    handleEvent('nftsTxs', nftsTxs)
    handleEvent('nfts', activeNfts)

    const createSelector = selectors.activityTxs.createWithNftsActivity({
      createActivitySelector: selectors.activityTxs.createAssetSourceBaseActivity,
      nftsNetworkNameToAssetName: NFTS_NETWORK_TO_ASSET_NAME,
    })

    const selector = createSelector({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    const result = selector(store.getState())

    // 1 normal NFT, 1 unindexed normal NFT, 1 not NFT tx
    expect(result.length).toEqual(3)

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
    expect(
      result.find((a) => a.nft && a.nft.nftId === 'ethereum:unindexedSpamNft:4')
    ).toBeUndefined()

    // The spam transaction from txLog should not be in the result
    const spamTxActivity = result.find((a) => a.txId === 'spam-tx')
    expect(spamTxActivity).toBeUndefined()
  })
})
