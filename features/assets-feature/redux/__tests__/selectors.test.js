import { connectAssets } from '@exodus/assets'
import { asset as bitcoin } from '@exodus/bitcoin-meta'
import { asset as ethereum, tokens as ethereumTokens } from '@exodus/ethereum-meta'

import { setup } from './utils.js'

const usdcoin = ethereumTokens.find((a) => a.name === 'usdcoin')
const assetsByName = connectAssets({
  bitcoin,
  ethereum,
  usdcoin,
})

describe('selectors', () => {
  let store, selectors, emitAssets, handleEvent
  beforeEach(() => {
    ;({ store, selectors, emitAssets, handleEvent } = setup())
  })

  test('loaded', () => {
    expect(selectors.assets.loaded(store.getState())).toEqual(false)

    emitAssets(assetsByName)

    expect(selectors.assets.loaded(store.getState())).toEqual(true)
  })

  test('all', () => {
    expect(selectors.assets.all(store.getState())).toEqual({})

    emitAssets(assetsByName)
    const data = selectors.assets.all(store.getState())

    expect(data).toEqual(assetsByName)

    for (const asset of Object.values(data)) {
      expect(asset).toMatchObject({
        assetType: expect.any(String),
        currency: expect.any(Object),
        baseAsset: expect.any(Object),
        displayTicker: expect.any(String),
        feeAsset: expect.any(Object),
        name: expect.any(String),
        ticker: expect.any(String),
      })
    }
  })

  test('allByTicker', () => {
    emitAssets(assetsByName)
    expect(selectors.assets.allByTicker(store.getState())).toEqual({
      BTC: assetsByName.bitcoin,
      ETH: assetsByName.ethereum,
      USDC: assetsByName.usdcoin,
    })
  })

  test('createAssetSelector', () => {
    emitAssets(assetsByName)

    expect(selectors.assets.createAssetSelector('bitcoin')(store.getState())).toEqual(
      assetsByName.bitcoin
    )
  })

  test('createBaseAssetSelector', () => {
    emitAssets(assetsByName)

    expect(selectors.assets.createBaseAssetSelector('bitcoin')(store.getState())).toEqual(
      assetsByName.bitcoin
    )
    expect(selectors.assets.createBaseAssetSelector('usdcoin')(store.getState())).toEqual(
      assetsByName.ethereum
    )
  })

  test('createFeeAssetSelector', () => {
    emitAssets(assetsByName)

    expect(selectors.assets.createFeeAssetSelector('bitcoin')(store.getState())).toEqual(
      assetsByName.bitcoin
    )
    expect(selectors.assets.createFeeAssetSelector('usdcoin')(store.getState())).toEqual(
      assetsByName.ethereum
    )
  })

  test('createMultiAddressMode', () => {
    emitAssets(assetsByName)
    const bitcoinMultiAddressModeSelector = selectors.assets.createMultiAddressMode('bitcoin')

    expect(bitcoinMultiAddressModeSelector(store.getState())).toEqual(false)
    handleEvent('multiAddressMode', { bitcoin: true })
    expect(bitcoinMultiAddressModeSelector(store.getState())).toEqual(true)
  })

  test('createMultiAddressMode using bitcoin default', () => {
    emitAssets(assetsByName)
    const litecoinMultiAddressModeSelector = selectors.assets.createMultiAddressMode('litecoin')

    expect(litecoinMultiAddressModeSelector(store.getState())).toEqual(false)

    handleEvent('multiAddressMode', { bitcoin: true })
    expect(litecoinMultiAddressModeSelector(store.getState())).toEqual(true)

    handleEvent('multiAddressMode', { bitcoin: false })
    expect(litecoinMultiAddressModeSelector(store.getState())).toEqual(false)

    handleEvent('multiAddressMode', { litecoin: true })
    expect(litecoinMultiAddressModeSelector(store.getState())).toEqual(true)
  })

  test('createDisabledPurposes', () => {
    emitAssets(assetsByName)
    const bitcoinDisabledPurposesSelector = selectors.assets.createDisabledPurposes('bitcoin')

    expect(bitcoinDisabledPurposesSelector(store.getState())).toEqual([])
    handleEvent('disabledPurposes', { bitcoin: [86] })
    expect(bitcoinDisabledPurposesSelector(store.getState())).toEqual([86])
  })
})
