import { createInMemoryAtom, waitUntil } from '@exodus/atoms'
import { enabledAndDisabledAssetsAtomDefinition } from '@exodus/enabled-assets/atoms/index.js'

import { availableAssetsAtomDefinition } from '../../atoms/index.js'
import availableAssetsDefinition from '../index.js'

const { factory: createAvailableAssets } = availableAssetsDefinition
const { factory: createEnabledAndDisabledAssetsAtom } = enabledAndDisabledAssetsAtomDefinition

describe('available-assets module', () => {
  let assetsModule
  let availableAssetsAtom
  let enabledAndDisabledAssetsAtom
  let mockStorage
  let assetsAtom
  let expectedAssets

  beforeEach(() => {
    availableAssetsAtom = availableAssetsAtomDefinition.factory()

    mockStorage = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    }
    enabledAndDisabledAssetsAtom = createEnabledAndDisabledAssetsAtom({ storage: mockStorage })

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

    availableAssets.start()
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
      const localEnabledAndDisabledAssetsAtom = createEnabledAndDisabledAssetsAtom({
        storage: mockStorage,
      })

      const availableAssets = createAvailableAssets({
        assetsModule: localAssetsModule,
        assetsAtom: localAssetsAtom,
        availableAssetsAtom: localAvailableAssetsAtom,
        enabledAndDisabledAssetsAtom: localEnabledAndDisabledAssetsAtom,
        logger: { log: jest.fn(), error: jest.fn() },
        config: {
          defaultAvailableAssetNames: [
            'bitcoin',
            'xous_solana_8ae2dcb8',
            'another_solana_8ae2dcb8',
            'notCustomTokenName',
          ],
        },
      })

      await availableAssets.load()

      expect(localAssetsModule.addRemoteTokens).toHaveBeenCalledWith({
        tokenNames: ['xous_solana_8ae2dcb8', 'another_solana_8ae2dcb8'],
        allowedStatusList: ['c'],
      })
    })

    test('does not call addRemoteTokens when all default assets exist', async () => {
      const localAssetsModule = {
        getAsset: (assetName) => {
          const assets = {
            bitcoin: { name: 'bitcoin', baseAsset: { name: 'bitcoin' } },
            solana: { name: 'solana', baseAsset: { name: 'solana' } },
            xous_solana_8ae2dcb8: { name: 'xous_solana_8ae2dcb8', baseAsset: { name: 'solana' } },
          }
          return assets[assetName]
        },
        addRemoteTokens: jest.fn(async () => {}),
      }

      const localAvailableAssetsAtom = availableAssetsAtomDefinition.factory()
      const localAssetsAtom = createInMemoryAtom({ added: [], updated: [] })
      const localEnabledAndDisabledAssetsAtom = createEnabledAndDisabledAssetsAtom({
        storage: mockStorage,
      })

      const availableAssets = createAvailableAssets({
        assetsModule: localAssetsModule,
        assetsAtom: localAssetsAtom,
        availableAssetsAtom: localAvailableAssetsAtom,
        enabledAndDisabledAssetsAtom: localEnabledAndDisabledAssetsAtom,
        logger: { log: jest.fn(), error: jest.fn() },
        config: {
          defaultAvailableAssetNames: ['bitcoin', 'solana', 'xous_solana_8ae2dcb8'],
        },
      })

      await availableAssets.load()

      expect(localAssetsModule.addRemoteTokens).not.toHaveBeenCalled()
    })

    test('only runs once due to lodash.once', async () => {
      const localAssetsModule = {
        getAsset: () => {},
        addRemoteTokens: jest.fn(async () => {}),
      }

      const localAvailableAssetsAtom = availableAssetsAtomDefinition.factory()
      const localAssetsAtom = createInMemoryAtom({ added: [], updated: [] })
      const localEnabledAndDisabledAssetsAtom = createEnabledAndDisabledAssetsAtom({
        storage: mockStorage,
      })

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
  })
})
