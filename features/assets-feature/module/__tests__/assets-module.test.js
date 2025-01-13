import { createInMemoryAtom } from '@exodus/atoms'
import combinedAssetsList from '@exodus/combined-assets-meta'
import { createNoopLogger } from '@exodus/logger'
import createStorage from '@exodus/storage-memory'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import AssetsModule from '../assets-module.js'
import { CT_DATA_KEY } from '../constants.js'
import assetPlugins from './supported-assets-list.js'

const createAssetsModule = (args) => new AssetsModule({ ...args })

const someAssets = {
  bitcoin: {
    name: 'bitcoin',
    baseAssetName: 'bitcoin',
  },
  cosmos: {
    name: 'cosmos',
    baseAssetName: 'cosmos',
  },
  osmosis: {
    name: 'osmosis',
    baseAssetName: 'osmosis',
  },
}

const waynecoin = {
  name: 'waynecoin',
  baseAssetName: 'bitcoin',
  properName: 'Wayne Coin', // eslint-disable-line @exodus/hydra/no-asset-proper
  ticker: 'WC',
  units: { WC: 0 },
  assetType: 'THE_TOKEN',
  assetId: 'foobar',
  // normally the following would be taken from the base asset if not defined on the token:
  chainBadgeColors: ['#EAEAEA', '#FFF'],
  gradientColors: ['#EAEAEA', '#FFF'],
  gradientCoords: { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
  primaryColor: '#EAEAEA',
}

const ctrData = {
  waynecoin,
  wayne_bitcoin_deadbeef: {
    ...waynecoin,
    name: 'wayne_bitcoin_deadbeef',
    // same assetId as waynecoin
  },
}

describe('assetsModule', () => {
  let assetsModule
  let assetsAtom
  let storage
  let iconsStorage

  beforeEach(() => {
    assetsAtom = createInMemoryAtom()
    storage = createStorage()
    iconsStorage = { storeIcons: () => {}, getIcon: () => {} }

    assetsModule = createAssetsModule({
      assetPlugins,
      assetsAtom,
      fetch: globalThis.fetch,
      combinedAssetsList: combinedAssetsList.filter(
        (asset) => asset.assetType === 'MULTI_NETWORK_ASSET'
      ),
      storage,
      logger: console,
      iconsStorage,
    })

    assetsModule.initialize({ assetClientInterface: { createLogger: createNoopLogger } })
  })

  test('getAssets()', () => {
    expect(assetsModule.getAssets()).toMatchObject(someAssets)
  })

  test('getAsset(assetName)', () => {
    Object.keys(someAssets).forEach((assetName) =>
      expect(assetsModule.getAsset(assetName)).toMatchObject(someAssets[assetName])
    )
  })

  test('getBaseAssetNames()', () => {
    const allBaseAssetNames = new Set(
      assetsModule
        .getBaseAssetNames()
        .filter((assetName) => !assetsModule.getAsset(assetName).isCombined)
    )

    const baseAssetNames = Object.values(someAssets)
      .filter((asset) => asset.name === asset.baseAssetName)
      .map(({ name }) => name)
    const tokenNames = Object.values(someAssets)
      .filter((asset) => asset.name !== asset.baseAssetName)
      .map(({ name }) => name)

    baseAssetNames.forEach((assetName) => expect(allBaseAssetNames.has(assetName)).toBeTruthy())
    tokenNames.forEach((assetName) => expect(allBaseAssetNames.has(assetName)).toBeFalsy())
  })

  test('getTokenNames()', () => {
    expect(assetsModule.getTokenNames('bitcoin')).toEqual([])
    expect(assetsModule.getTokenNames('cosmos')).toEqual([])
    expect(assetsModule.getTokenNames('osmosis')).toEqual([])
  })

  test('initialize(): every asset plugin is initialized', () => {
    Object.keys(assetPlugins).forEach((assetName) => {
      const asset = assetsModule.getAsset(assetName)
      expect(asset && asset.name === asset.baseAsset.name).toBeTruthy()
    })
  })

  describe('assetsAtom', () => {
    const mswServer = setupServer(
      http.post('https://ctr.a.exodus.io/registry/tokens', async ({ request }) => {
        const { tokenNames } = await request.json()
        return HttpResponse.json({
          status: 'OK',
          tokens: tokenNames.map((tokenName) => ctrData[tokenName]),
        })
      })
    )

    beforeAll(() => mswServer.listen({ onUnhandledRequest: 'error' }))

    beforeEach(() => {
      const bitcoin = assetsModule.getAsset('bitcoin')
      jest.spyOn(bitcoin.api, 'hasFeature').mockReturnValue(true)

      bitcoin.api.createToken = (token) => token
    })

    afterAll(() => mswServer.close())

    test('updates on initialize', async () => {
      await expect(assetsAtom.get()).resolves.toMatchObject({ value: someAssets })
    })

    test('updates after loading custom token', async () => {
      await storage.set(CT_DATA_KEY, { waynecoin })
      await assetsModule.load()

      const assets = assetsModule.getAssets()

      await expect(assetsAtom.get()).resolves.toEqual({
        value: assets,
        updated: [],
        disabled: [],
        added: [expect.objectContaining(waynecoin)],
      })
    })

    test('updates after adding remote tokens', async () => {
      await assetsModule.addRemoteTokens({ tokenNames: ['waynecoin'] })
      const { value, added } = await assetsAtom.get()

      expect(value.waynecoin).toMatchObject(waynecoin)
      expect(added).toEqual([expect.objectContaining(waynecoin)])
    })

    test('attempt adding new CT, where a legacy token already exists', async () => {
      await assetsModule.addRemoteTokens({ tokenNames: ['waynecoin'] }) // simulate legacy token
      await assetsModule.addRemoteTokens({ tokenNames: ['wayne_bitcoin_deadbeef'] }) // add CT with same assetId as legacy token
      const { value, updated } = await assetsAtom.get()

      expect(value.wayne_bitcoin_deadbeef).not.toBeDefined()
      expect(value.waynecoin).toMatchObject(waynecoin)
      expect(updated).toEqual([expect.objectContaining(waynecoin)])
    })
  })
})
