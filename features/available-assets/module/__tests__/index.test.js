import { createInMemoryAtom, createStorageAtomFactory, waitUntil } from '@exodus/atoms'
import createInMemoryStorage from '@exodus/storage-memory'
import ms from 'ms'

import { availableAssetsAtomDefinition } from '../../atoms/index.js'
import availableAssetsDefinition from '../index.js'

const { factory: createAvailableAssets } = availableAssetsDefinition

// Same shape as @exodus/enabled-assets' enabledAndDisabledAssetsAtom, minus the workspace dependency.
// A storage atom (not createInMemoryAtom) because `set` must await the module's async observer.
const createEnabledAndDisabledAssetsAtom = () =>
  createStorageAtomFactory({ storage: createInMemoryStorage() })({
    key: 'data',
    defaultValue: { disabled: Object.create(null) },
  })

describe('available-assets module', () => {
  let assetsModule
  let availableAssetsAtom
  let enabledAndDisabledAssetsAtom
  let assetsAtom
  let expectedAssets

  beforeEach(() => {
    availableAssetsAtom = availableAssetsAtomDefinition.factory()
    enabledAndDisabledAssetsAtom = createEnabledAndDisabledAssetsAtom()

    assetsModule = {
      getAsset: (assetName) => {
        const assets = {
          bitcoin: { name: 'bitcoin', baseAsset: { name: 'bitcoin' } },
          exit: { name: 'exit', baseAsset: { name: 'exit' } },
          wayne: { name: 'wayne', baseAsset: { name: 'wayne' } },
          rootstock: { name: 'rootstock', baseAsset: { name: 'rootstock' } },
        }
        return assets[assetName]
      },
      addRemoteTokens: jest.fn(async () => {}),
    }

    assetsAtom = createInMemoryAtom()

    const availableAssets = createAvailableAssets({
      assetsModule,
      assetsAtom,
      availableAssetsAtom,
      enabledAndDisabledAssetsAtom,
      logger: { log: jest.fn(), error: jest.fn() },
      config: {
        defaultAvailableAssetNames: ['bitcoin', 'wrong-asset', 'rootstock'],
      },
    })

    expectedAssets = [
      { assetName: 'bitcoin', reason: 'default' },
      { assetName: 'rootstock', reason: 'default' },
    ]

    void availableAssets.start()
  })

  it('should filter default available assets when they are not defined on assetModule', async () => {
    const availableAssets = await waitUntil({
      atom: availableAssetsAtom,
      predicate: (array) => array.length > 0,
    })

    expect(availableAssets).toEqual(expectedAssets)
  })

  test('make updated assets available on load', async () => {
    assetsAtom.set({
      added: [],
      updated: [{ name: 'exit' }],
    })

    const assetNames = await waitUntil({
      atom: availableAssetsAtom,
      predicate: (array) => array.length > 2,
    })

    expect(assetNames).toEqual([
      ...expectedAssets,
      {
        assetName: 'exit',
        reason: 'assets-load',
      },
    ])
  })

  test('make added assets available on load', async () => {
    assetsAtom.set({
      added: [{ name: 'exit' }],
      updated: [],
    })

    const assetNames = await waitUntil({
      atom: availableAssetsAtom,
      predicate: (array) => array.length > 2,
    })

    expect(assetNames).toEqual([
      ...expectedAssets,
      {
        assetName: 'exit',
        reason: 'assets-load',
      },
    ])
  })

  test('make assets available when changed at a later time', async () => {
    await assetsAtom.set({
      added: [],
      updated: [],
    })

    await new Promise(setImmediate)

    await assetsAtom.set({
      added: [{ name: 'wayne' }],
      updated: [{ name: 'exit' }],
    })

    const assetNames = await waitUntil({
      atom: availableAssetsAtom,
      predicate: (array) => array.length === 4,
    })

    expect(assetNames).toEqual([
      ...expectedAssets,
      {
        assetName: 'wayne',
        reason: 'assets-add',
      },
      {
        assetName: 'exit',
        reason: 'assets-update',
      },
    ])
  })

  test('should not make delisted assets available', async () => {
    await assetsAtom.set({
      added: [],
      updated: [],
    })

    await new Promise(setImmediate)

    await assetsAtom.set({
      added: [{ name: 'wayne' }],
      updated: [{ name: 'exit', api: { features: { delisted: true } } }],
    })

    const assetNames = await waitUntil({
      atom: availableAssetsAtom,
      predicate: (array) => array.length === 3,
    })

    expect(assetNames).toEqual([
      ...expectedAssets,
      {
        assetName: 'wayne',
        reason: 'assets-add',
      },
    ])
  })

  describe('built-in tokens', () => {
    test('make unavailable built-in tokens available', async () => {
      await assetsAtom.set({
        added: [],
        updated: [],
      })

      const mockTokenName = 'rif_rootstock_c62f668d'

      await enabledAndDisabledAssetsAtom.set({ disabled: { [mockTokenName]: false } })

      expect(assetsModule.addRemoteTokens).toHaveBeenCalledWith({
        tokenNames: [mockTokenName],
        allowedStatusList: ['c', 'v'],
      })
    })

    test('no built-in tokens made available when already available', async () => {
      const mockTokenName = 'rif_rootstock_c62f668d'
      await availableAssetsAtom.set([{ assetName: mockTokenName, reason: 'assets-load' }])

      await assetsAtom.set({
        added: [],
        updated: [],
      })

      await enabledAndDisabledAssetsAtom.set({ disabled: { [mockTokenName]: false } })

      expect(assetsModule.addRemoteTokens).not.toHaveBeenCalled()
    })
  })

  describe('load', () => {
    test('fetches missing default assets via addRemoteTokens', async () => {
      const localAssetsModule = {
        getAsset: (assetName) => {
          const assets = {
            bitcoin: { name: 'bitcoin', baseAsset: { name: 'bitcoin' } },
            solana: { name: 'solana', baseAsset: { name: 'solana' } },
          }
          return assets[assetName]
        },
        addRemoteTokens: jest.fn(async () => {}),
      }

      const localAvailableAssetsAtom = availableAssetsAtomDefinition.factory()
      const localAssetsAtom = createInMemoryAtom({ added: [], updated: [] })
      const localEnabledAndDisabledAssetsAtom = createEnabledAndDisabledAssetsAtom()

      const availableAssets = createAvailableAssets({
        assetsModule: localAssetsModule,
        assetsAtom: localAssetsAtom,
        availableAssetsAtom: localAvailableAssetsAtom,
        enabledAndDisabledAssetsAtom: localEnabledAndDisabledAssetsAtom,
        logger: { log: jest.fn(), error: jest.fn() },
        config: {
          defaultAvailableAssetNames: [
            'bitcoin',
            'xous_solana_2a78fea2',
            'another_solana_8ae2dcb8',
            'notCustomTokenName',
          ],
        },
      })

      await availableAssets.load()

      expect(localAssetsModule.addRemoteTokens).toHaveBeenCalledWith({
        tokenNames: ['xous_solana_2a78fea2', 'another_solana_8ae2dcb8'],
        allowedStatusList: ['c'],
      })
    })

    test('does not call addRemoteTokens when all default assets exist', async () => {
      const localAssetsModule = {
        getAsset: (assetName) => {
          const assets = {
            bitcoin: { name: 'bitcoin', baseAsset: { name: 'bitcoin' } },
            solana: { name: 'solana', baseAsset: { name: 'solana' } },
            xous_solana_2a78fea2: { name: 'xous_solana_2a78fea2', baseAsset: { name: 'solana' } },
          }
          return assets[assetName]
        },
        addRemoteTokens: jest.fn(async () => {}),
      }

      const localAvailableAssetsAtom = availableAssetsAtomDefinition.factory()
      const localAssetsAtom = createInMemoryAtom({ added: [], updated: [] })
      const localEnabledAndDisabledAssetsAtom = createEnabledAndDisabledAssetsAtom()

      const availableAssets = createAvailableAssets({
        assetsModule: localAssetsModule,
        assetsAtom: localAssetsAtom,
        availableAssetsAtom: localAvailableAssetsAtom,
        enabledAndDisabledAssetsAtom: localEnabledAndDisabledAssetsAtom,
        logger: { log: jest.fn(), error: jest.fn() },
        config: {
          defaultAvailableAssetNames: ['bitcoin', 'solana', 'xous_solana_2a78fea2'],
        },
      })

      await availableAssets.load()

      expect(localAssetsModule.addRemoteTokens).not.toHaveBeenCalled()
    })

    test('only runs once after it succeeds', async () => {
      const localAssetsModule = {
        getAsset: () => {},
        addRemoteTokens: jest.fn(async () => {}),
      }

      const localAvailableAssetsAtom = availableAssetsAtomDefinition.factory()
      const localAssetsAtom = createInMemoryAtom({ added: [], updated: [] })
      const localEnabledAndDisabledAssetsAtom = createEnabledAndDisabledAssetsAtom()

      const availableAssets = createAvailableAssets({
        assetsModule: localAssetsModule,
        assetsAtom: localAssetsAtom,
        availableAssetsAtom: localAvailableAssetsAtom,
        enabledAndDisabledAssetsAtom: localEnabledAndDisabledAssetsAtom,
        logger: { log: jest.fn(), error: jest.fn() },
        config: {
          defaultAvailableAssetNames: ['another_solana_8ae2dcb8'],
        },
      })

      await availableAssets.load()
      await availableAssets.load()
      await availableAssets.load()

      expect(localAssetsModule.addRemoteTokens).toHaveBeenCalledTimes(1)
    })

    describe('after a failure', () => {
      let localAssetsModule
      let logger
      let availableAssets

      beforeEach(() => {
        jest.useFakeTimers()

        localAssetsModule = {
          getAsset: () => {},
          addRemoteTokens: jest.fn(async () => {}),
        }

        logger = { log: jest.fn(), error: jest.fn() }

        availableAssets = createAvailableAssets({
          assetsModule: localAssetsModule,
          assetsAtom: createInMemoryAtom({ added: [], updated: [] }),
          availableAssetsAtom: availableAssetsAtomDefinition.factory(),
          enabledAndDisabledAssetsAtom: createEnabledAndDisabledAssetsAtom(),
          logger,
          config: {
            defaultAvailableAssetNames: ['another_solana_8ae2dcb8'],
          },
        })
      })

      afterEach(() => {
        availableAssets.stop()
        jest.useRealTimers()
      })

      test('retries with a growing delay until it succeeds', async () => {
        const networkError = new Error('Network request failed')
        localAssetsModule.addRemoteTokens
          .mockRejectedValueOnce(networkError)
          .mockRejectedValueOnce(networkError)

        await expect(availableAssets.load()).rejects.toThrow('Network request failed')
        expect(logger.error).toHaveBeenCalledTimes(1)

        await jest.advanceTimersByTimeAsync(ms('5s'))
        expect(localAssetsModule.addRemoteTokens).toHaveBeenCalledTimes(2)
        expect(logger.error).toHaveBeenCalledTimes(2)

        await jest.advanceTimersByTimeAsync(ms('5s'))
        expect(localAssetsModule.addRemoteTokens).toHaveBeenCalledTimes(2)

        await jest.advanceTimersByTimeAsync(ms('5s'))
        expect(localAssetsModule.addRemoteTokens).toHaveBeenCalledTimes(3)

        await jest.advanceTimersByTimeAsync(ms('1h'))
        await availableAssets.load()
        expect(localAssetsModule.addRemoteTokens).toHaveBeenCalledTimes(3)
      })

      test('retries tokens a failed run registered before it threw', async () => {
        const registered = new Set()
        localAssetsModule.getAsset = (name) => (registered.has(name) ? { name } : undefined)
        localAssetsModule.addRemoteTokens.mockImplementationOnce(async ({ tokenNames }) => {
          tokenNames.forEach((name) => registered.add(name))
          throw new Error('storage write failed')
        })

        await expect(availableAssets.load()).rejects.toThrow('storage write failed')

        await jest.advanceTimersByTimeAsync(ms('5s'))
        expect(localAssetsModule.addRemoteTokens).toHaveBeenCalledTimes(2)
        expect(localAssetsModule.addRemoteTokens).toHaveBeenLastCalledWith({
          tokenNames: ['another_solana_8ae2dcb8'],
          allowedStatusList: ['c'],
        })
      })

      test('stops retrying when stopped', async () => {
        localAssetsModule.addRemoteTokens.mockRejectedValue(new Error('Network request failed'))

        await expect(availableAssets.load()).rejects.toThrow('Network request failed')
        availableAssets.stop()

        await jest.advanceTimersByTimeAsync(ms('1h'))
        expect(localAssetsModule.addRemoteTokens).toHaveBeenCalledTimes(1)
      })
    })
  })
})
