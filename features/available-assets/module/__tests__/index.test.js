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
        defaultAvailableAssetNames: ['bitcoin', 'wrong-asset'],
      },
    })
    availableAssets.start()
  })

  it('should filter default available assets when they are not defined on assetModule', async () => {
    const availableAssets = await waitUntil({
      atom: availableAssetsAtom,
      predicate: (array) => array.length > 0,
    })

    expect(availableAssets).toEqual([
      {
        assetName: 'bitcoin',
        reason: 'default',
      },
    ])
  })

  test('make updated assets available on load', async () => {
    assetsAtom.set({
      added: [],
      updated: [{ name: 'exit' }],
    })

    const assetNames = await waitUntil({
      atom: availableAssetsAtom,
      predicate: (array) => array.length > 1,
    })

    expect(assetNames).toEqual([
      {
        assetName: 'bitcoin',
        reason: 'default',
      },
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
      predicate: (array) => array.length > 1,
    })

    expect(assetNames).toEqual([
      {
        assetName: 'bitcoin',
        reason: 'default',
      },
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
      predicate: (array) => array.length === 3,
    })

    expect(assetNames).toEqual([
      {
        assetName: 'bitcoin',
        reason: 'default',
      },
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

      expect(assetsModule.addRemoteTokens).toHaveBeenCalledWith({ tokenNames: [mockTokenName] })
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
})
