import oldToNewStyleTokenNames from '@exodus/asset-legacy-token-name-mapping'
import { createInMemoryAtom } from '@exodus/atoms'
import { UnitType } from '@exodus/currency'
import { FiatOrderSet, Order, OrderSet } from '@exodus/models'
import EventEmitter from 'events/events.js'

const assetsMock = {
  builtInBaseAsset: {
    name: 'builtInBaseAsset',
    get baseAsset() {
      return assetsMock.builtInBaseAsset
    },
    currency: UnitType.create({
      base: 0,
      notBase: 6,
    }),
  },
  builtInToken: {
    name: 'builtInToken',
    get baseAsset() {
      return assetsMock.builtInBaseAsset
    },
    currency: UnitType.create({
      base: 0,
      notBase: 6,
    }),
  },
  customToken: {
    name: 'customToken',
    get baseAsset() {
      return assetsMock.builtInBaseAsset
    },
    currency: UnitType.create({
      base: 0,
      notBase: 6,
    }),
  },
  combinedAsset: {
    name: 'combinedAsset',
    assetType: 'MULTI_NETWORK_ASSET',
  },
  cosmos: {
    currency: UnitType.create({
      base: 0,
      notBase: 6,
    }),
  },
}

const DEFAULT_ENABLED_ASSET_NAMES = ['builtInBaseAsset', 'builtInToken']

const { default: autoEnableAssetsPluginDefinition } = await import('../auto-enable-assets.js')

const { once } = EventEmitter
const createAutoEnableAssets = autoEnableAssetsPluginDefinition.factory

describe('auto-enable-assets', () => {
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  const prepare = async ({
    requiredEnabledAssetNames = [],
    assetNamesChangedByUser = [],
    assets = { ...assetsMock },
    ordersAtom = createInMemoryAtom({
      defaultValue: OrderSet.EMPTY,
    }),
    fiatOrdersAtom,
    ...opts
  } = {}) => {
    const emitter = new EventEmitter()
    const enable = jest.fn((assetNames) => emitter.emit('enabled', assetNames))

    const nonDustBalanceAssetNamesAtom = createInMemoryAtom({
      defaultValue: requiredEnabledAssetNames,
    })

    const config = {
      throttleInterval: 0,
      defaultEnabledAssetNames: DEFAULT_ENABLED_ASSET_NAMES,
      oldToNewStyleTokenNames: {
        ...oldToNewStyleTokenNames,
        oldStyleAsset: 'newStyleCustomToken',
      },
      ...opts.config,
    }

    const assetsModule = {
      getAsset: (assetName) => assets[assetName],
      getBaseAssetNames: () => Object.keys(assets),
    }

    const defaultEnabledAssetNamesAtom = createInMemoryAtom({
      defaultValue: config.defaultEnabledAssetNames,
    })

    const enabledAssets = {
      enable,
      wasChangedByUser: async (assetName) => assetNamesChangedByUser.includes(assetName),
    }

    const enabledAndDisabledAssetsAtom = createInMemoryAtom({
      defaultValue: {
        disabled: {},
      },
    })

    const syncedBalancesAtom = createInMemoryAtom()
    const enabledAssetsAtom = createInMemoryAtom({ defaultValue: {} })
    const availableAssetNamesAtom = createInMemoryAtom({ defaultValue: [] })

    const autoEnabledAssets = createAutoEnableAssets({
      nonDustBalanceAssetNamesAtom,
      assetsModule,
      defaultEnabledAssetNamesAtom,
      enabledAssets,
      ordersAtom,
      fiatOrdersAtom,
      enabledAndDisabledAssetsAtom,
      syncedBalancesAtom,
      enabledAssetsAtom,
      availableAssetNamesAtom,
      logger: {
        debug: jest.fn(),
      },
      errorTracking: {
        track: jest.fn(),
      },
      ...opts,
      config,
    })
    await autoEnabledAssets.onAssetsSynced()

    // Wait for throttled flush (leading: false means it waits)
    await jest.advanceTimersByTimeAsync(50)

    // Check if enable was called directly instead of waiting for event
    expect(enable).toBeCalledTimes(1)
    expect(enable).toBeCalledWith(config.defaultEnabledAssetNames)
    enable.mockClear()
    return {
      emitter,
      enable,
      assets,
      assetsModule,
      nonDustBalanceAssetNamesAtom,
      enabledAssets,
      ordersAtom,
      autoEnabledAssets,
      enabledAndDisabledAssetsAtom,
      syncedBalancesAtom,
      enabledAssetsAtom,
      availableAssetNamesAtom,
    }
  }

  it('auto-enables the default enabled assets + available built-ins', async () => {
    await prepare()
  })

  it('auto-enables assets when ordersAtom missing', async () => {
    await prepare({
      ordersAtom: null,
    })
  })

  it('auto-enables non-disableable assets even if the user disabled them', async () => {
    const { emitter, enable, nonDustBalanceAssetNamesAtom, assets } = await prepare({
      config: {
        defaultEnabledAssetNames: ['builtInBaseAsset'],
      },
      assetNamesChangedByUser: ['builtInToken'],
    })

    Object.assign(assets, assetsMock)

    const promiseEmitted = once(emitter, 'enabled')
    nonDustBalanceAssetNamesAtom.set(['builtInToken'])

    await jest.advanceTimersByTimeAsync(50)
    await promiseEmitted

    expect(enable).toBeCalledTimes(1)
    expect(enable).toHaveBeenCalledWith(['builtInToken'])
  })

  it('auto-enables custon tokens that was native tokens before', async () => {
    const { emitter, enable, enabledAndDisabledAssetsAtom } = await prepare({
      config: {
        defaultEnabledAssetNames: ['builtInBaseAsset'],
      },
    })

    const promiseEmitted = once(emitter, 'enabled')
    enabledAndDisabledAssetsAtom.set({ disabled: { oldStyleAsset: false } })

    await jest.advanceTimersByTimeAsync(50)
    await promiseEmitted

    expect(enable).toHaveBeenCalledWith(expect.arrayContaining(['newStyleCustomToken']))
    expect(enable).not.toHaveBeenCalledWith(expect.arrayContaining(['oldStyleAsset']))
  })

  it('does not auto-enable disabled old deprecated native tokens as custom token', async () => {
    const { enable, enabledAndDisabledAssetsAtom } = await prepare({
      config: {
        defaultEnabledAssetNames: ['builtInBaseAsset'],
      },
    })

    await enabledAndDisabledAssetsAtom.set({ disabled: { oldStyleAsset: true } })

    await jest.advanceTimersByTimeAsync(50)
    expect(enable).not.toHaveBeenCalled()
  })

  it('does not auto-enable custom tokens that were already added', async () => {
    const { enable, enabledAndDisabledAssetsAtom } = await prepare({
      config: {
        defaultEnabledAssetNames: ['builtInBaseAsset'],
      },
    })

    await enabledAndDisabledAssetsAtom.set({
      disabled: { oldStyleAsset: false, newStyleCustomToken: true },
    })

    await jest.advanceTimersByTimeAsync(50)
    expect(enable).not.toHaveBeenCalled()
  })

  it('auto-enables assets in order history', async () => {
    const { emitter, enable, ordersAtom } = await prepare({
      config: {
        defaultEnabledAssetNames: ['builtInBaseAsset'],
      },
    })

    const promiseEmitted = once(emitter, 'enabled')
    ordersAtom.set(
      OrderSet.fromArray([
        Order.fromJSON({
          orderId: '0',
          fromAmount: assetsMock.builtInBaseAsset.currency.defaultUnit(1),
          fromAsset: assetsMock.builtInBaseAsset.name,
          toAmount: assetsMock.customToken.currency.defaultUnit(1),
          toAsset: assetsMock.customToken.name,
        }),
      ])
    )

    await jest.advanceTimersByTimeAsync(50)
    await promiseEmitted

    expect(enable).toHaveBeenCalledWith(expect.arrayContaining(['customToken']))
    expect(enable).not.toHaveBeenCalledWith(expect.arrayContaining(['builtInToken']))
  })

  it('ignores missing assets', async () => {
    const { emitter, enable, ordersAtom } = await prepare({
      config: {
        defaultEnabledAssetNames: ['builtInBaseAsset'],
      },
    })

    const promiseEmitted = once(emitter, 'enabled')
    ordersAtom.set(
      OrderSet.fromArray([
        Order.fromJSON({
          orderId: '0',
          fromAmount: assetsMock.customToken.currency.defaultUnit(1),
          fromAsset: assetsMock.customToken.name,
          toAmount: UnitType.create({
            base: 0,
            notBase: 6,
          }).defaultUnit(1),
          toAsset: 'missingAsset',
        }),
      ])
    )

    await jest.advanceTimersByTimeAsync(50)
    await promiseEmitted

    expect(enable).toHaveBeenCalledWith(expect.arrayContaining(['customToken']))
  })

  it('throttles calls to `enabledAssetsModule`', async () => {
    const { enable, assets, ordersAtom } = await prepare({
      config: {
        defaultEnabledAssetNames: ['builtInBaseAsset'],
        throttleInterval: 20,
      },
    })

    Object.assign(assets, assetsMock)

    ordersAtom.set(
      OrderSet.fromArray([
        Order.fromJSON({
          orderId: '0',
          fromAmount: assetsMock.builtInBaseAsset.currency.defaultUnit(1),
          fromAsset: assetsMock.builtInBaseAsset.name,
          toAmount: assetsMock.builtInToken.currency.defaultUnit(1),
          toAsset: assetsMock.builtInToken.name,
        }),
      ])
    )

    await jest.advanceTimersByTimeAsync(8)
    expect(enable).toBeCalledTimes(0)

    ordersAtom.set(
      OrderSet.fromArray([
        Order.fromJSON({
          orderId: '0',
          fromAmount: assetsMock.builtInBaseAsset.currency.defaultUnit(1),
          fromAsset: assetsMock.builtInBaseAsset.name,
          toAmount: assetsMock.customToken.currency.defaultUnit(1),
          toAsset: assetsMock.customToken.name,
        }),
      ])
    )

    await jest.advanceTimersByTimeAsync(8)
    expect(enable).toBeCalledTimes(0)
    await jest.advanceTimersByTimeAsync(20)
    expect(enable).toBeCalledTimes(1)
    expect(enable).toHaveBeenCalledWith(['builtInBaseAsset', 'builtInToken', 'customToken'])
  })

  it('auto-enables non-zero balance assets from synced-balances considering available assets', async () => {
    const { enable, syncedBalancesAtom, enabledAssetsAtom, availableAssetNamesAtom } =
      await prepare({
        config: {
          defaultEnabledAssetNames: ['builtInBaseAsset'],
        },
      })

    await enabledAssetsAtom.set({
      bitcoin: true,
      ethereum: true,
    })

    await availableAssetNamesAtom.set(['bitcoin', 'ethereum', 'cosmos'])

    const syncedBalancesCosmosPayload = {
      exodus_0: {
        cosmos: assetsMock.cosmos.currency.defaultUnit(1),
      },
    }

    await syncedBalancesAtom.set(syncedBalancesCosmosPayload)
    await jest.advanceTimersByTimeAsync(50)
    expect(enable).toHaveBeenCalledWith(['cosmos'])
  })

  it('auto-enables assets when nonDustBalance atom changes', async () => {
    const { enable, nonDustBalanceAssetNamesAtom, assets } = await prepare({
      config: {
        defaultEnabledAssetNames: ['builtInBaseAsset'],
        alwaysAutoEnable: true,
      },
    })

    assets.ethereum = {
      name: 'ethereum',
      currency: UnitType.create({ base: 0, notBase: 18 }),
    }

    nonDustBalanceAssetNamesAtom.set(['ethereum'])

    await jest.advanceTimersByTimeAsync(50)

    expect(enable).toHaveBeenCalledWith(['ethereum'])
  })

  it('processes pending assets via onAssetsSynced hook', async () => {
    const { enable, nonDustBalanceAssetNamesAtom, autoEnabledAssets, assets } = await prepare({
      config: {
        defaultEnabledAssetNames: ['builtInBaseAsset'],
        alwaysAutoEnable: true,
      },
    })

    assets.ethereum = {
      name: 'ethereum',
      currency: UnitType.create({ base: 0, notBase: 18 }),
    }

    // Set some assets that need to be enabled
    await nonDustBalanceAssetNamesAtom.set(['ethereum'])

    // Wait for initial processing
    await jest.advanceTimersByTimeAsync(10)

    // Simulate assets sync completed
    await autoEnabledAssets.onAssetsSynced()
    await jest.advanceTimersByTimeAsync(50)

    expect(enable).toHaveBeenCalledWith(['ethereum'])
  })

  describe('fiat orders', () => {
    const assets = {
      ...assetsMock,
      waynecoin: { name: 'waynecoin' },
      jokercoin: { name: 'jokercoin' },
    }

    const buyOrder = {
      orderId: 'buy1',
      provider: 'moonpay',
      orderType: 'buy',
      status: 'completed',
      fromAsset: 'EUR',
      fromAmount: 10,
      toAmount: 1,
      fiatValue: 100,
      providerRate: 10,
      exodusRate: 10,
      toAsset: 'waynecoin',
      fromAddress: null,
      toAddress: null,
      fromWalletAccount: 'exodus_0',
      toWalletAccount: null,
    }

    const sellOrder = {
      orderId: 'sell1',
      provider: 'ramp',
      status: 'completed',
      fromAsset: 'jokercoin',
      orderType: 'sell',
      toAsset: 'EUR',
      fromAmount: 10,
      toAmount: 1,
      fiatValue: 100,
      providerRate: 10,
      exodusRate: 10,
      fromAddress: null,
      toAddress: null,
      fromWalletAccount: 'exodus_0',
      toWalletAccount: null,
    }

    let fiatOrdersAtom

    beforeEach(() => {
      fiatOrdersAtom = createInMemoryAtom({ defaultValue: FiatOrderSet.EMPTY })
    })

    it('does not throw when fiatOrdersAtom not provided', async () => {
      await expect(prepare()).resolves.not.toThrow()
    })

    it('enables assets from buy order', async () => {
      const { enable } = await prepare({ fiatOrdersAtom, assets })

      fiatOrdersAtom.set(FiatOrderSet.fromArray([buyOrder]))

      await jest.advanceTimersByTimeAsync(50)

      expect(enable).toHaveBeenCalledTimes(1)
      expect(enable).toHaveBeenCalledWith(['waynecoin'])
    })

    it('enables assets from sell order', async () => {
      const { enable } = await prepare({ fiatOrdersAtom, assets })

      fiatOrdersAtom.set(FiatOrderSet.fromArray([sellOrder]))

      await jest.advanceTimersByTimeAsync(50)

      expect(enable).toHaveBeenCalledTimes(1)
      expect(enable).toHaveBeenCalledWith(['jokercoin'])
    })
  })
})
