import { createAtomMock } from '@exodus/atoms'

import {
  defaultEnabledAssetNamesAtomDefinition,
  enabledAssetsAtomDefinition,
} from '../../atoms/index.js'
import enabledAssetsModuleDefinition from '../index.js'

const { factory: createEnabledAssets } = enabledAssetsModuleDefinition
const { factory: createEnabledAssetsAtom } = enabledAssetsAtomDefinition
const { factory: createDefaultEnabledAssetNamesAtom } = defaultEnabledAssetNamesAtomDefinition

const assetsMock = {
  baseAsset: {
    name: 'baseAsset',
    get baseAsset() {
      return assetsMock.baseAsset
    },
  },
  token: {
    name: 'token',
    get baseAsset() {
      return assetsMock.baseAsset
    },
  },
  otherBaseAsset: {
    name: 'otherBaseAsset',
    get baseAsset() {
      return assetsMock.otherBaseAsset
    },
  },
  otherToken: {
    name: 'otherToken',
    get baseAsset() {
      return assetsMock.otherBaseAsset
    },
  },
}

const assetsModule = {
  getAsset: (assetName) => assetsMock[assetName],
  getBaseAssetNames: () => Object.keys(assetsMock),
}

const defaultEnabledAssetsList = ['baseAsset']

describe('enabled-assets', () => {
  let defaultEnabledAssetNamesAtom
  let enabledAssetsAtom
  let enabledAndDisabledAssetsAtom
  let enabledAssets
  let availableAssetNamesAtom

  beforeEach(() => {
    enabledAndDisabledAssetsAtom = createAtomMock({
      defaultValue: {
        disabled: {},
      },
    })
    availableAssetNamesAtom = createAtomMock({
      defaultValue: Object.keys(assetsMock),
    })
    defaultEnabledAssetNamesAtom = createDefaultEnabledAssetNamesAtom()
    enabledAssetsAtom = createEnabledAssetsAtom({
      enabledAndDisabledAssetsAtom,
      availableAssetNamesAtom,
    })
    enabledAssets = createEnabledAssets({
      defaultEnabledAssetNamesAtom,
      enabledAndDisabledAssetsAtom,
      assetsModule,
      availableAssetNamesAtom,
      config: { defaultEnabledAssetsList },
      logger: console,
    })
  })

  it('enables default-enabled assets using provided config', async () => {
    await enabledAssets.load()
    const enabledAssetsData = await enabledAssetsAtom.get()

    expect(enabledAssetsData).toEqual({
      baseAsset: true,
    })

    // true because it's default-enabled
    expect(await enabledAssets.wasChangedByUser('baseAsset')).toEqual(true)
    expect(await enabledAssets.wasChangedByUser('token')).toEqual(false)
  })

  it('defaults to available base assets', async () => {
    const anotherEnabledAssets = createEnabledAssets({
      defaultEnabledAssetNamesAtom,
      enabledAndDisabledAssetsAtom,
      assetsModule,
      availableAssetNamesAtom,
      config: {},
      logger: console,
    })
    await anotherEnabledAssets.load()

    const enabledAssetsData = await enabledAssetsAtom.get()

    const availableAssetNames = await availableAssetNamesAtom.get()
    const availableBaseAssetNames = availableAssetNames.filter((assetName) => {
      const asset = assetsModule.getAsset(assetName)
      return asset.name === asset.baseAsset.name
    })
    const expectedAssets = Object.fromEntries(availableBaseAssetNames.map((name) => [name, true]))

    expect(enabledAssetsData).toEqual(expectedAssets)

    // true because it's default-enabled
    expect(await enabledAssets.wasChangedByUser('baseAsset')).toEqual(true)
    expect(await enabledAssets.wasChangedByUser('token')).toEqual(false)
  })

  it('supports enabling assets dynamically', async () => {
    await enabledAssets.load()
    await enabledAssets.enable(['token'])
    const enabledAssetsData = await enabledAssetsAtom.get()
    expect(enabledAssetsData).toEqual({
      baseAsset: true,
      token: true,
    })

    // true because it's default-enabled
    expect(await enabledAssets.wasChangedByUser('baseAsset')).toEqual(true)
    expect(await enabledAssets.wasChangedByUser('token')).toEqual(true)
  })

  it('supports enabling base asset when token is enabled', async () => {
    await enabledAssets.load()
    await enabledAssets.enable(['otherToken'])
    const enabledAssetsData = await enabledAssetsAtom.get()
    expect(enabledAssetsData).toEqual({
      baseAsset: true,
      otherBaseAsset: true,
      otherToken: true,
    })

    // true because it's default-enabled
    expect(await enabledAssets.wasChangedByUser('baseAsset')).toEqual(true)
    expect(await enabledAssets.wasChangedByUser('token')).toEqual(false)
    expect(await enabledAssets.wasChangedByUser('otherBaseAsset')).toEqual(true)
    expect(await enabledAssets.wasChangedByUser('otherToken')).toEqual(true)
  })

  it('supports disabling assets dynamically', async () => {
    await enabledAssets.load()
    await enabledAssets.disable(['token'])
    const enabledAssetsData = await enabledAssetsAtom.get()
    expect(enabledAssetsData).toEqual({
      baseAsset: true,
    })

    // true because it's default-enabled
    expect(await enabledAssets.wasChangedByUser('baseAsset')).toEqual(true)
    expect(await enabledAssets.wasChangedByUser('token')).toEqual(true)
  })

  it('clears enabled assets on clear()', async () => {
    await enabledAssets.load()
    await enabledAssets.disable(['token'])
    const enabledAssetsData = await enabledAssetsAtom.get()
    expect(enabledAssetsData).toEqual({
      baseAsset: true,
    })

    await enabledAssets.clear()
    const enabledAssetsData2 = await enabledAssetsAtom.get()
    expect(enabledAssetsData2).toEqual({})
  })

  it('ignores enabling same asset', async () => {
    const handler = jest.fn()
    enabledAndDisabledAssetsAtom.observe(handler)
    expect(await enabledAndDisabledAssetsAtom.get()).toEqual({
      disabled: {},
    })
    expect(handler).toBeCalledTimes(1)
    await enabledAssets.load()
    expect(handler).toBeCalledTimes(2)
    expect(await enabledAndDisabledAssetsAtom.get()).toEqual({
      disabled: {
        baseAsset: false,
      },
    })

    expect(handler).toBeCalledTimes(2)
    await enabledAssets.enable(['baseAsset'])

    expect(await enabledAndDisabledAssetsAtom.get()).toEqual({
      disabled: {
        baseAsset: false,
      },
    })
    expect(handler).toBeCalledTimes(2)
  })

  it('ignores disabling same asset', async () => {
    const handler = jest.fn()
    enabledAndDisabledAssetsAtom.observe(handler)
    expect(await enabledAndDisabledAssetsAtom.get()).toEqual({
      disabled: {},
    })
    expect(handler).toBeCalledTimes(1)
    await enabledAssets.load()
    expect(handler).toBeCalledTimes(2)
    expect(await enabledAndDisabledAssetsAtom.get()).toEqual({
      disabled: {
        baseAsset: false,
      },
    })

    await enabledAssets.disable(['baseAsset'])

    expect(await enabledAndDisabledAssetsAtom.get()).toEqual({
      disabled: {
        baseAsset: true,
      },
    })
    expect(handler).toBeCalledTimes(3)

    await enabledAssets.disable(['baseAsset'])
    expect(await enabledAndDisabledAssetsAtom.get()).toEqual({
      disabled: {
        baseAsset: true,
      },
    })
    expect(handler).toBeCalledTimes(3)
  })

  it('ignores enabling asset disabled by user when call enabled with unlessDisabled', async () => {
    const handler = jest.fn()
    enabledAndDisabledAssetsAtom.observe(handler)
    expect(await enabledAndDisabledAssetsAtom.get()).toEqual({
      disabled: {},
    })
    expect(handler).toBeCalledTimes(1)
    await enabledAssets.load()
    expect(handler).toBeCalledTimes(2)
    expect(await enabledAndDisabledAssetsAtom.get()).toEqual({
      disabled: {
        baseAsset: false,
      },
    })

    await enabledAssets.disable(['baseAsset'])

    expect(await enabledAndDisabledAssetsAtom.get()).toEqual({
      disabled: {
        baseAsset: true,
      },
    })
    expect(handler).toBeCalledTimes(3)

    await enabledAssets.enable(['baseAsset'], { unlessDisabled: true })

    expect(await enabledAndDisabledAssetsAtom.get()).toEqual({
      disabled: {
        baseAsset: true,
      },
    })
    expect(handler).toBeCalledTimes(3)
  })

  it('enable asset disabled by user', async () => {
    const handler = jest.fn()
    enabledAndDisabledAssetsAtom.observe(handler)
    expect(await enabledAndDisabledAssetsAtom.get()).toEqual({
      disabled: {},
    })
    expect(handler).toBeCalledTimes(1)
    await enabledAssets.load()
    expect(handler).toBeCalledTimes(2)
    expect(await enabledAndDisabledAssetsAtom.get()).toEqual({
      disabled: {
        baseAsset: false,
      },
    })

    await enabledAssets.disable(['baseAsset'])

    expect(await enabledAndDisabledAssetsAtom.get()).toEqual({
      disabled: {
        baseAsset: true,
      },
    })
    expect(handler).toBeCalledTimes(3)

    await enabledAssets.enable(['baseAsset'])

    expect(await enabledAndDisabledAssetsAtom.get()).toEqual({
      disabled: {
        baseAsset: false,
      },
    })
    expect(handler).toBeCalledTimes(4)
  })
})
