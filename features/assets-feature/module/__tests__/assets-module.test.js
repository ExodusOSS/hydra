/* oxlint-disable @exodus/oxlint-plugin-hydra/no-asset-proper */

import { createInMemoryAtom } from '@exodus/atoms'
import { createNoopLogger } from '@exodus/logger'
import createStorage from '@exodus/storage-memory'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import AssetsModule from '../assets-module.js'
import { CT_DATA_KEY } from '../constants.js'
import assetPlugins from './supported-assets-list.js'

const combinedAssetsList = [
  {
    name: '_usdcoin',
    ticker: '_USDCOIN',
    baseAssetName: '_usdcoin',
    displayName: 'USD Coin',
    displayTicker: 'USDC',
    assetType: 'MULTI_NETWORK_ASSET',
    isCombined: true,
    units: { _usdcoin_base: 0, _USDCOIN: 6 },
    combinedAssetNames: ['usdcoin'],
    info: { description: '' },
    primaryColor: '#2775CA',
    gradientColors: ['#2775CA', '#2775CA'],
    chainBadgeColors: ['#2775CA', '#2775CA'],
    toString: () => '_usdcoin',
  },
]

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
  properName: 'Wayne Coin',
  ticker: 'WC',
  units: { WC: 0 },
  assetType: 'THE_TOKEN',
  assetId: 'foobar',
  icon: 'abcd',
  // normally the following would be taken from the base asset if not defined on the token:
  chainBadgeColors: ['#EAEAEA', '#FFF'],
  gradientColors: ['#EAEAEA', '#FFF'],
  primaryColor: '#EAEAEA',
}

const combinedcoin = {
  name: 'combinedcoin',
  assetName: 'combinedcoin',
  baseAssetName: 'ethereum',
  properName: 'Combined Coin',
  properTicker: 'CC',
  ticker: 'CC',
  units: { CC: 0 },
  assetType: 'ETHEREUM_ERC20',
  assetId: 'combinedcoin',
  icon: 'My Pretty Icon',
  // normally the following would be taken from the base asset if not defined on the token:
  chainBadgeColors: ['#EAEAEA', '#FFF'],
  gradientColors: ['#EAEAEA', '#FFF'],
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

function createAssetModuleForTest({
  assetsAtom,
  fetch,
  storage,
  iconsStorage,
  config,
  combinedAssets = combinedAssetsList,
}) {
  const assetsModule = createAssetsModule({
    assetPlugins,
    assetsAtom,
    fetch,
    combinedAssetsList: combinedAssets.filter((asset) => asset.assetType === 'MULTI_NETWORK_ASSET'),
    storage,
    logger: console,
    iconsStorage,
    config,
  })

  assetsModule.initialize({
    assetClientInterface: { createLogger: createNoopLogger },
    assetsConfig: {},
  })

  const bitcoin = assetsModule.getAsset('bitcoin')
  bitcoin.api.features.customTokens = true
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

  describe('initialize(): remote assets config', () => {
    const assetClientInterface = { createLogger: createNoopLogger }

    test('merges assetsConfig.[name].config into asset config', () => {
      const capturedConfigs = {}
      const mockAssetPlugins = {
        bitcoin: {
          createAsset: ({ assetClientInterface, config }) => {
            capturedConfigs.bitcoin = config
            return assetPlugins.bitcoin.createAsset({ assetClientInterface, config })
          },
        },
        ethereum: {
          createAsset: ({ assetClientInterface, config }) => {
            capturedConfigs.ethereum = config
            return assetPlugins.ethereum.createAsset({ assetClientInterface, config })
          },
        },
      }

      const module = createAssetsModule({
        assetPlugins: mockAssetPlugins,
        assetsAtom: createInMemoryAtom(),
        fetch,
        storage,
        logger: console,
        config: {
          assetsConfig: {
            bitcoin: { localSetting: 'local-value', overriddenSetting: 'local' },
          },
        },
      })

      module.initialize({
        assetClientInterface,
        assetsConfig: {
          bitcoin: { config: { remoteSetting: 'remote-value', overriddenSetting: 'remote' } },
        },
      })

      expect(capturedConfigs.bitcoin).toEqual({
        localSetting: 'local-value',
        remoteSetting: 'remote-value',
        overriddenSetting: 'remote',
      })
      expect(capturedConfigs.ethereum).toEqual({})
    })

    test('works with undefined assetsConfig', () => {
      const capturedConfigs = {}
      const mockAssetPlugins = {
        bitcoin: {
          createAsset: ({ assetClientInterface, config }) => {
            capturedConfigs.bitcoin = config
            return assetPlugins.bitcoin.createAsset({ assetClientInterface, config })
          },
        },
      }

      const module = createAssetsModule({
        assetPlugins: mockAssetPlugins,
        assetsAtom: createInMemoryAtom(),
        fetch,
        storage,
        logger: console,
        config: {
          assetsConfig: {
            bitcoin: { localSetting: 'local-value' },
          },
        },
      })

      module.initialize({
        assetClientInterface,
        assetsConfig: undefined,
      })

      expect(capturedConfigs.bitcoin).toEqual({ localSetting: 'local-value' })
    })

    test('works with empty assetsConfig', () => {
      const capturedConfigs = {}
      const mockAssetPlugins = {
        bitcoin: {
          createAsset: ({ assetClientInterface, config }) => {
            capturedConfigs.bitcoin = config
            return assetPlugins.bitcoin.createAsset({ assetClientInterface, config })
          },
        },
      }

      const module = createAssetsModule({
        assetPlugins: mockAssetPlugins,
        assetsAtom: createInMemoryAtom(),
        fetch,
        storage,
        logger: console,
        config: {},
      })

      module.initialize({
        assetClientInterface,
        assetsConfig: {},
      })

      expect(capturedConfigs.bitcoin).toEqual({})
    })

    test('falls back from invalid assetConfig', () => {
      const mockAssetPlugins = {
        ethereum: {
          createAsset: ({ assetClientInterface, config }) => {
            if (config?.monitorType === 'invalidMonitorType') throw new Error('invalidMonitorType')

            return assetPlugins.ethereum.createAsset({ assetClientInterface, config })
          },
        },
      }

      const module = createAssetsModule({
        assetPlugins: mockAssetPlugins,
        assetsAtom: createInMemoryAtom(),
        fetch,
        storage,
        logger: console,
      })

      module.initialize({
        assetClientInterface,
        assetsConfig: {
          ethereum: { config: { monitorType: 'invalidMonitorType' } },
        },
      })
    })
  })

  describe('with mock CTR', () => {
    const mswServer = setupServer(
      http.post('https://ctr.a.exodus.io/registry/tokens', async ({ request }) => {
        const { tokenNames, assetIds } = await request.json()

        if (tokenNames) {
          return HttpResponse.json({
            status: 'OK',
            tokens: tokenNames.map((tokenName) => ctrData[tokenName]),
          })
        }

        const ctrTokens = Object.values(ctrData)
        const tokens = assetIds
          .map(({ assetId }) => ctrTokens.find((token) => token.assetId === assetId))
          .filter(Boolean)

        return HttpResponse.json({ status: 'OK', tokens })
      }),
      http.post('https://ctr.a.exodus.io/registry/updates', async ({ request }) => {
        return HttpResponse.json({
          status: 'OK',
          tokens: [{ ...ctrData.combinedcoin, parents: [] }],
        })
      }),
      http.post('https://ctr.a.exodus.io/registry/search', async ({ request }) => {
        const body = await request.json()
        const { baseAssetName, query, tags } = body

        const searchTokens = [
          {
            ...ctrData.abcd_bitcoin_a2345678,
            tags: ['wayne', 'coin'],
          },
        ]

        let results = searchTokens

        if (baseAssetName && !baseAssetName.includes('bitcoin')) {
          results = []
        }

        if (query) {
          results = results.filter(
            (token) =>
              token.properName?.toLowerCase().includes(query.toLowerCase()) ||
              token.properTicker?.toLowerCase().includes(query.toLowerCase())
          )
        }

        if (tags && tags.length > 0) {
          results = results.filter((token) =>
            tags.some((tag) => token.tags?.some((t) => t.toLowerCase().includes(tag.toLowerCase())))
          )
        }

        return HttpResponse.json({
          status: 'OK',
          tokens: results,
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
        // Filter out combined assets that were added during initialization
        const addedTokens = added.filter((a) => !a.isCombined)
        expect(addedTokens).toEqual([])
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
      describe('dynamic grouping overrides without static definitions', () => {
        const token = {
          ...combinedcoin,
          displayName: 'Combined Coin',
          displayTicker: 'CC',
          lifecycleStatus: 'c',
          parents: null,
          version: 1,
        }
        const groupName = '_combined_btc_bitcoin'
        const config = {
          shouldValidateCustomToken: false,
          useDynamicCombinedAssets: true,
          dynamicCombinedAssetOverrides: { [token.name]: 'bitcoin' },
        }
        let module
        let atom
        let tokenStorage

        const createModule = (overrides) =>
          createAssetModuleForTest({
            assetsAtom: atom,
            fetch,
            storage: tokenStorage,
            combinedAssets: [],
            config: { ...config, ...overrides },
          })

        const expectMembership = () => {
          expect(module.getAsset(groupName)).toMatchObject({
            displayName: 'Bitcoin',
            displayTicker: 'BTC',
            combinedAssetNames: ['bitcoin', token.name],
          })
          expect(module.getAsset(token.name)).toMatchObject({
            displayTicker: 'CC',
            assetId: token.assetId,
            baseAsset: expect.objectContaining({ name: 'ethereum' }),
          })
          expect(
            Object.values(module.getAssets())
              .filter((asset) => asset.isCombined && asset.combinedAssetNames.includes(token.name))
              .map((asset) => asset.name)
          ).toEqual([groupName])
        }

        beforeEach(() => {
          atom = createInMemoryAtom()
          tokenStorage = createStorage()
          module = createModule()
          mswServer.use(
            http.post('https://ctr.a.exodus.io/registry/tokens', () =>
              HttpResponse.json({ status: 'OK', tokens: [token] })
            ),
            http.post('https://ctr.a.exodus.io/registry/updates', () =>
              HttpResponse.json({
                status: 'OK',
                tokens: [{ ...token, parents: ['_usdcoin'], version: 2 }],
              })
            )
          )
        })

        afterEach(() => mswServer.resetHandlers())

        test('creates and publishes the group when a remote member loads after startup', async () => {
          await module.load()
          expect(module.getAsset(groupName)).toBeUndefined()
          await module.addRemoteTokens({ tokenNames: [token.name] })
          expectMembership()
          const { added, updated } = await atom.get()
          expect(added.map((asset) => asset.name)).toEqual(
            expect.arrayContaining([token.name, groupName])
          )
          expect(updated.map((asset) => asset.name)).toContain('bitcoin')
          await module.addRemoteTokens({ tokenNames: [token.name] })
          expectMembership()
        })

        test('restores the group and preserves it through registry updates and another restart', async () => {
          await tokenStorage.set(CT_DATA_KEY, { [token.name]: token })
          await module.load()
          expectMembership()
          await module.updateTokens()
          expectMembership()
          const storedTokens = await tokenStorage.get(CT_DATA_KEY)
          expect(storedTokens[token.name].version).toBe(2)
          module = createModule()
          await module.load()
          expectMembership()
        })

        test.each([false, true])(
          'keeps other wrappers separate (reversed: %s)',
          async (reverse) => {
            const otherToken = {
              ...token,
              name: 'anothercoin',
              assetName: 'anothercoin',
              assetId: 'anothercoin',
            }
            const tokens = reverse ? [otherToken, token] : [token, otherToken]
            await tokenStorage.set(
              CT_DATA_KEY,
              Object.fromEntries(tokens.map((asset) => [asset.name, asset]))
            )
            await module.load()
            expectMembership()
            expect(module.getAsset(otherToken.name)).toBeDefined()
            expect(
              Object.values(module.getAssets()).filter((asset) => asset.isCombined)
            ).toHaveLength(1)
          }
        )

        test('does not apply overrides when dynamic grouping is disabled', async () => {
          module = createModule({ useDynamicCombinedAssets: false })
          await module.load()
          await module.addRemoteTokens({ tokenNames: [token.name] })
          expect(module.getAsset(groupName)).toBeUndefined()
          expect(module.getAsset(token.name)).toBeDefined()
        })

        test('waits for a late target without creating a wrapper-only group, including after restart', async () => {
          const otherToken = {
            ...token,
            name: 'anothercoin',
            assetName: 'anothercoin',
            assetId: 'anothercoin',
          }
          const target = {
            ...token,
            name: 'targetcoin',
            assetName: 'targetcoin',
            assetId: 'targetcoin',
            displayName: 'Target Coin',
            displayTicker: 'TARGET',
          }
          const overrides = {
            dynamicCombinedAssetOverrides: {
              [token.name]: target.name,
              [otherToken.name]: target.name,
            },
          }
          const getGroups = () =>
            Object.values(module.getAssets())
              .filter((asset) => asset.isCombined)
              .map(({ name, combinedAssetNames }) => ({ name, combinedAssetNames }))
          const expectedGroups = [
            {
              name: '_combined_target_targetcoin',
              combinedAssetNames: [target.name, otherToken.name, token.name],
            },
          ]

          await tokenStorage.set(CT_DATA_KEY, {
            [token.name]: token,
            [otherToken.name]: otherToken,
          })
          module = createModule(overrides)
          await module.load()
          expect(module.getAsset(token.name)).toBeDefined()
          expect(module.getAsset(otherToken.name)).toBeDefined()
          expect(getGroups()).toEqual([])

          mswServer.use(
            http.post('https://ctr.a.exodus.io/registry/tokens', () =>
              HttpResponse.json({ status: 'OK', tokens: [target] })
            )
          )
          await module.addRemoteTokens({ tokenNames: [target.name] })
          expect(getGroups()).toEqual(expectedGroups)

          module = createModule(overrides)
          await module.load()
          expect(getGroups()).toEqual(expectedGroups)
        })
      })

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

      test('getIcon falls back to CTR when stored icon is missing for a registered token', async () => {
        await assetsModule.addRemoteTokens({ tokenNames: ['waynecoin'] })
        icons.clear() // simulate lost icon files, e.g. wallet restored on a new device

        const icon = await assetsModule.getIcon('waynecoin')

        expect(icon).toEqual('UNZIP abcd')
        expect(icons.get('waynecoin')).toEqual('abcd') // re-persisted for next launch
      })

      test('getIcon does not fall back to CTR for built-in assets', async () => {
        fetch.mockClear()

        const icon = await assetsModule.getIcon('bitcoin')

        expect(icon).toEqual(undefined)
        expect(fetch).not.toHaveBeenCalled()
      })

      test('getIcon falls back to CTR when reading the stored icon throws', async () => {
        await assetsModule.addRemoteTokens({ tokenNames: ['waynecoin'] })
        iconsStorage.getIcon = () => {
          throw new Error('validate: invalid tag')
        }

        const icon = await assetsModule.getIcon('waynecoin')

        expect(icon).toEqual('UNZIP abcd')
      })
    })

    describe('addRemoteTokens with batching', () => {
      test('addRemoteTokens with more than 50 tokenNames should batch requests', async () => {
        // Generate 75 token names to test batching

        assetsModule = createAssetModuleForTest({
          assetsAtom,
          fetch,
          storage,
          iconsStorage,
          config: { shouldValidateCustomToken: false },
        })

        const tokenNames = Array.from({ length: 75 }, (_, i) => `token${i}`)

        // Reset fetch mock
        fetch.mockReset()

        // Mock the server to track how many requests are made
        let requestCount = 0
        fetch.mockImplementation(() => {
          requestCount++
          return Promise.resolve({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({
              status: 'OK',
              tokens: Array.from({ length: 50 }, (_, i) => ({
                name: `token${i + (requestCount - 1) * 50}`,
                assetName: `token${i + (requestCount - 1) * 50}`,
                baseAssetName: 'ethereum',
                assetId: `0x${i + (requestCount - 1) * 50}`,
                lifecycleStatus: 'v',
              })),
            }),
          })
        })

        await assetsModule.addRemoteTokens({ tokenNames })

        // Should make 2 requests: first 50 tokens, then remaining 25 tokens
        expect(requestCount).toBe(2)

        // Verify the requests were made with correct batching
        const firstCallBody = JSON.parse(fetch.mock.calls[0][1].body)
        const secondCallBody = JSON.parse(fetch.mock.calls[1][1].body)

        expect(firstCallBody.tokenNames).toHaveLength(50)
        expect(secondCallBody.tokenNames).toHaveLength(25)
        expect(firstCallBody.tokenNames).toEqual(tokenNames.slice(0, 50))
        expect(secondCallBody.tokenNames).toEqual(tokenNames.slice(50, 75))

        fetch.mockRestore()
      })
    })

    describe('searchTokens()', () => {
      test('searchTokens with query', async () => {
        const tokens = await assetsModule.searchTokens({
          baseAssetName: 'bitcoin',
          query: 'wayne',
        })

        expect(tokens).toHaveLength(1)
        expect(tokens[0]).toMatchObject({ name: 'abcd_bitcoin_a2345678' })
      })

      test('searchTokens with tags', async () => {
        const tokens = await assetsModule.searchTokens({
          baseAssetName: 'bitcoin',
          tags: ['wayne'],
        })

        expect(tokens).toHaveLength(1)
        expect(tokens[0]).toMatchObject({ name: 'abcd_bitcoin_a2345678' })
      })

      test('searchTokens with tags that do not match', async () => {
        const tokens = await assetsModule.searchTokens({
          baseAssetName: 'bitcoin',
          tags: ['nonexistent'],
        })

        expect(tokens).toHaveLength(0)
      })

      test('searchTokens passes tags to fetch', async () => {
        fetch.mockReset()
        fetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue({ status: 'OK', tokens: [] }),
        })

        await assetsModule.searchTokens({
          baseAssetName: 'bitcoin',
          tags: ['test_tag', 'keyword'],
        })

        const requestBody = JSON.parse(fetch.mock.calls[0][1].body)
        expect(requestBody.tags).toEqual(['test_tag', 'keyword'])
        expect(requestBody.baseAssetName).toEqual(['bitcoin'])

        fetch.mockRestore()
      })
    })

    describe('fetchTokens()', () => {
      test('fetchTokens', async () => {
        const tokens = await assetsModule.fetchTokens([
          { assetId: 'foobar', baseAssetName: 'bitcoin' },
          { assetId: 'other', baseAssetName: 'bitcoin' },
          { assetId: 'combinedcoin', baseAssetName: 'ethereum' },
          { assetId: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', baseAssetName: 'ethereum' }, // aave - built in token
        ])

        const waynecoinToken = {
          ...waynecoin,
          displayName: waynecoin.properName,
          displayTicker: waynecoin.properTicker,
        }

        const aave = assetsModule.getAsset('aave')
        const bitcoin = assetsModule.getAsset('bitcoin')

        expect(tokens).toHaveLength(3)
        expect(tokens[0]).toEqual(aave)
        expect(tokens[1]).toEqual(bitcoin.api.createToken(waynecoinToken))
        // Comparing tokens here makes Jest complain even though they serialize to the same string
        expect(tokens[2]).toMatchObject({ name: 'combinedcoin', assetId: 'combinedcoin' })

        // Should cache the token
        const requestCount = fetch.mock.calls.length
        const token = await assetsModule.fetchToken('foobar', 'bitcoin')

        expect(token).toEqual(waynecoinToken)
        expect(fetch.mock.calls.length).toEqual(requestCount)
      })
    })
  })
})
