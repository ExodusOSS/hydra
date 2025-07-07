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
  ethereum: {
    name: 'ethereum',
    baseAssetName: 'ethereum',
  },
  usdcoin: {
    name: 'usdcoin',
    baseAssetName: 'ethereum',
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
  icon: 'abcd',
  // normally the following would be taken from the base asset if not defined on the token:
  chainBadgeColors: ['#EAEAEA', '#FFF'],
  gradientColors: ['#EAEAEA', '#FFF'],
  gradientCoords: { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
  primaryColor: '#EAEAEA',
}

const combinedcoin = {
  name: 'combinedcoin',
  assetName: 'combinedcoin',
  baseAssetName: 'ethereum',
  properName: 'Combined Coin', // eslint-disable-line @exodus/hydra/no-asset-proper
  properTicker: 'CC', // eslint-disable-line @exodus/hydra/no-asset-proper
  ticker: 'CC',
  units: { CC: 0 },
  assetType: 'ETHEREUM_ERC20',
  assetId: 'combinedcoin',
  icon: 'My Pretty Icon',
  // normally the following would be taken from the base asset if not defined on the token:
  chainBadgeColors: ['#EAEAEA', '#FFF'],
  gradientColors: ['#EAEAEA', '#FFF'],
  gradientCoords: { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
  primaryColor: '#EAEAEA',
  parents: ['_invalid', '_usdcoin'],
}

const ctrData = {
  combinedcoin,
  waynecoin,
  abcd_bitcoin_a2345678: {
    ...waynecoin,
    assetName: 'abcd_bitcoin_a2345678',
    name: 'abcd_bitcoin_a2345678',
    // same assetId as waynecoin
    lifecycleStatus: 'c',
    pricingAvailable: true,
    displayTicker: 'WC',
    // eslint-disable-next-line
    properTicker: 'WC',
    ticker: 'ED6Bbitcoin3D49BF90',
    version: 1,
    parameters: {
      decimals: 6,
      units: {
        base: 0,
        WC: 6,
      },
    },
  },
}

function createAssetModuleForTest({ assetsAtom, fetch, storage, iconsStorage, config }) {
  const assetsModule = createAssetsModule({
    assetPlugins,
    assetsAtom,
    fetch,
    combinedAssetsList: combinedAssetsList.filter(
      (asset) => asset.assetType === 'MULTI_NETWORK_ASSET'
    ),
    storage,
    logger: console,
    iconsStorage,
    config,
  })

  assetsModule.initialize({ assetClientInterface: { createLogger: createNoopLogger } })

  const bitcoin = assetsModule.getAsset('bitcoin')
  jest.spyOn(bitcoin.api, 'hasFeature').mockReturnValue(true)

  bitcoin.api.createToken = (token) => token
  return assetsModule
}

describe('assetsModule', () => {
  let assetsModule
  let assetsAtom
  let storage
  let iconsStorage
  let fetch
  let icons

  beforeEach(() => {
    icons = new Map()
    assetsAtom = createInMemoryAtom()
    storage = createStorage()
    iconsStorage = {
      storeIcons: (tokens) => {
        for (const token of tokens) {
          if (token.icon) icons.set(token.name, token.icon)
        }
      },
      getIcon: (assetName) => {
        return icons.get(assetName)
      },
      unzipIcon: (icon) => {
        return `UNZIP ${icon}`
      },
    }

    fetch = jest.spyOn(globalThis, 'fetch')
    assetsModule = createAssetModuleForTest({
      assetsAtom,
      fetch,
      storage,
      iconsStorage,
      config: { shouldValidateCustomToken: false },
    })
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

  describe('with mock CTR', () => {
    const mswServer = setupServer(
      http.post('https://ctr.a.exodus.io/registry/tokens', async ({ request }) => {
        const { tokenNames } = await request.json()

        return HttpResponse.json({
          status: 'OK',
          tokens: tokenNames.map((tokenName) => ctrData[tokenName]),
        })
      }),
      http.post('https://ctr.a.exodus.io/registry/updates', async ({ request }) => {
        return HttpResponse.json({
          status: 'OK',
          tokens: [{ ...ctrData.combinedcoin, parents: [] }],
        })
      })
    )

    beforeAll(() => mswServer.listen({ onUnhandledRequest: 'error' }))

    afterAll(() => mswServer.close())

    describe('assetsAtom', () => {
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
      test('should reject invalid schema token', async () => {
        assetsModule = createAssetModuleForTest({
          assetsAtom,
          fetch,
          storage,
          iconsStorage,
          config: { shouldValidateCustomToken: true },
        })
        await assetsModule.addRemoteTokens({ tokenNames: ['waynecoin'] })
        const { value, added } = await assetsAtom.get()

        expect(value.waynecoin).toBeUndefined()
        expect(added).toEqual([])
      })

      test('should accept valid schema token', async () => {
        assetsModule = createAssetModuleForTest({
          assetsAtom,
          fetch,
          storage,
          iconsStorage,
          config: { shouldValidateCustomToken: true },
        })

        await assetsModule.addRemoteTokens({ tokenNames: ['abcd_bitcoin_a2345678'] })
        const { value, added } = await assetsAtom.get()

        expect(value.abcd_bitcoin_a2345678).toBeDefined()
        expect(added).toEqual([expect.objectContaining({ name: 'abcd_bitcoin_a2345678' })])
      })

      test('attempt adding new CT, where a legacy token already exists', async () => {
        await assetsModule.addRemoteTokens({ tokenNames: ['waynecoin'] }) // simulate legacy token
        await assetsModule.addRemoteTokens({ tokenNames: ['abcd_bitcoin_a2345678'] }) // add CT with same assetId as legacy token
        const { value, updated } = await assetsAtom.get()

        expect(value.abcd_bitcoin_a2345678).not.toBeDefined()
        expect(value.waynecoin).toMatchObject(waynecoin)
        expect(updated).toEqual([expect.objectContaining(waynecoin)])
      })
    })

    describe('combined assets', () => {
      test('update combined asset', async () => {
        await assetsModule.addRemoteTokens({ tokenNames: ['combinedcoin'] })

        const usdcoinCombined1 = assetsModule.getAsset('_usdcoin')
        expect(usdcoinCombined1.combinedAssetNames).toEqual(['usdcoin', 'combinedcoin'])
        expect(usdcoinCombined1.combinedAssets.map((asset) => asset.name)).toEqual([
          'usdcoin',
          'combinedcoin',
        ])
        const { added, updated: updated1 } = await assetsAtom.get()
        expect(updated1).toEqual([expect.objectContaining(usdcoinCombined1)])
        expect(added).toEqual([expect.objectContaining(assetsModule.getAsset('combinedcoin'))])

        await assetsModule.updateTokens()

        const usdcoinCombined2 = assetsModule.getAsset('_usdcoin')
        expect(usdcoinCombined2.combinedAssetNames).toEqual(['usdcoin'])
        expect(usdcoinCombined2.combinedAssets.map((asset) => asset.name)).toEqual(['usdcoin'])
        const { updated: updated2 } = await assetsAtom.get()
        expect(updated2).toEqual([
          expect.objectContaining(assetsModule.getAsset('combinedcoin')),
          expect.objectContaining(usdcoinCombined2),
        ])
      })
    })

    describe('getIcon', () => {
      test('getIcon when existing icon', async () => {
        await assetsModule.addRemoteTokens({ tokenNames: ['waynecoin'] }) // simulate legacy token
        await iconsStorage.storeIcons([waynecoin])
        const icon = await assetsModule.getIcon('waynecoin')

        expect(icon).toEqual('abcd')
      })

      test('getIcon when icon does not exist', async () => {
        const icon = await assetsModule.getIcon('bitcoin')
        expect(icon).toEqual(undefined)
      })

      test('getIcon when asset is not added', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue({ status: 'OK', tokens: [{ icon: 'Token Icon' }] }),
        })
        const icon = await assetsModule.getIcon('searchedtoken')
        expect(icon).toEqual('UNZIP Token Icon')
      })

      test('getIcon when exception remote first time, ok the second time', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          status: 400,
          json: jest.fn().mockResolvedValue({}),
        })

        expect(await assetsModule.getIcon('searchedtoken')).toEqual(undefined)

        fetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue({ status: 'OK', tokens: [{ icon: 'Token Icon' }] }),
        })
        const icon = await assetsModule.getIcon('searchedtoken')
        expect(icon).toEqual('UNZIP Token Icon')
      })

      test('getIcon when asset does not have an icon', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue({ status: 'OK', tokens: [{}] }),
        })
        const icon = await assetsModule.getIcon('searchedtoken')
        expect(icon).toEqual(undefined)
      })
    })
  })
})
