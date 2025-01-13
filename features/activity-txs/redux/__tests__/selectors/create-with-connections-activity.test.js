import { Tx } from '@exodus/models'

import { setup } from '../utils'

describe('createWithConnectionsActivity', () => {
  test('should return empty array of activities in wallet', () => {
    const { store, selectors } = setup()
    const createSelector = selectors.activityTxs.createWithConnectionsActivity({
      createActivitySelector: selectors.activityTxs.createAssetSourceBaseActivity,
    })

    const selector = createSelector({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    expect(selector(store.getState())).toEqual([])
  })

  test('should add connection to props', () => {
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
      ],
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

    const createSelector = selectors.activityTxs.createWithConnectionsActivity({
      createActivitySelector: selectors.activityTxs.createAssetSourceBaseActivity,
    })

    const selector = createSelector({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    const result = selector(store.getState())

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual('ethereum.received-tx')
    expect(result[0].type).toEqual('rx')
    expect(result[0].personalNote).toEqual({
      txId: 'received-tx',
      message: 'message',
      providerData: { origin: 'someOrigin' },
    })
    expect(result[0].connection).toEqual({ origin: 'someOrigin', foo: 'bar' })
  })

  test('should return same activity if no connection added', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const txLogFixtures = {
      ethereum: [
        {
          txId: 'some-tx',
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

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: txLogFixtures.ethereum.map((tx) => Tx.fromJSON(tx)),
      },
    })

    handleEvent('personalNotes', [
      { txId: 'some-tx', message: 'message', providerData: { origin: 'otherOrigin' } },
    ])
    handleEvent('connectedOrigins', [{ origin: 'someOrigin', foo: 'bar' }])

    const createBaseSelector = selectors.activityTxs.createAssetSourceBaseActivity

    const createSelector = selectors.activityTxs.createWithFiatActivity({
      createActivitySelector: createBaseSelector,
    })

    const assetSource = {
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    }

    const selector = createSelector(assetSource)

    const result = selector(store.getState())
    const baseSelectorResult = createBaseSelector(assetSource)(store.getState())

    expect(result.length).toEqual(1)
    expect(result).toEqual(baseSelectorResult)
    expect(result[0].id).toEqual('ethereum.some-tx')
    expect(result[0].type).toEqual('rx')
    expect(result[0].connection).toEqual(undefined)
    expect(result[0].personalNote).toEqual({
      txId: 'some-tx',
      message: 'message',
      providerData: { origin: 'otherOrigin' },
    })
  })
})
