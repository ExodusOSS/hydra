import { FeeData } from '@exodus/asset-lib'
import { createInMemoryAtom } from '@exodus/atoms'

import feeMonitorsDefinition from '../index.js'

const { factory: createFeeMonitors } = feeMonitorsDefinition

const defaultAvailableAssetNames = ['bitcoin', 'ethereum', 'solana']

const defaultFeeData = new FeeData({ config: { value: 1 }, currency: {} })

// the remote-config observer applies payloads asynchronously
const settle = () => new Promise((resolve) => setTimeout(resolve, 0))

const createRemoteConfigData = (feeData) => ({ config: { assets: { solana: { feeData } } } })

class DummyFeeMonitor {
  constructor({ assetName, updateFee }) {
    this.assetName = assetName
    this.updateFee = updateFee
  }

  tick = async (feeConfig) => this.updateFee(this.assetName, feeConfig)

  start = jest.fn(() => async () => {})
}

describe('createFeeMonitors', () => {
  let assetsAtom
  let remoteConfigAtom
  let solanaMonitor
  let createFeeMonitor
  let feeDataAtom
  let availableAssetNamesAtom
  let monitors
  let logger
  let startError

  const baseAssetNamesToMonitorAtom = createInMemoryAtom({
    defaultValue: ['solana'],
  })

  beforeEach(() => {
    createFeeMonitor = jest.fn((args) => {
      solanaMonitor = new DummyFeeMonitor({ assetName: 'solana', ...args })
      if (startError) {
        solanaMonitor.start.mockImplementation(() => {
          throw new Error(startError)
        })
      }

      return solanaMonitor
    })

    const solana = {
      name: 'solana',
      baseAsset: { name: 'solana' },
      currency: {},
      api: {
        createFeeMonitor,
        features: { feeMonitor: true },
        getFeeData: () => defaultFeeData,
      },
    }

    assetsAtom = createInMemoryAtom({ defaultValue: { value: { solana } } })
    remoteConfigAtom = createInMemoryAtom({ defaultValue: createRemoteConfigData({}) })
    feeDataAtom = createInMemoryAtom({ defaultValue: {} })
    availableAssetNamesAtom = createInMemoryAtom({ defaultValue: defaultAvailableAssetNames })
    logger = { error: jest.fn() }

    monitors = createFeeMonitors({
      assetsAtom,
      feeDataAtom,
      remoteConfigAtom,
      availableAssetNamesAtom,
      baseAssetNamesToMonitorAtom,
      logger,
    })
  })

  test('should createFeeMonitors', async () => {
    await monitors.start()

    expect(createFeeMonitor).toHaveBeenCalledTimes(1)
  })

  test('should not crash if one monitor crashes', async () => {
    startError = 'Failed to start!!!'

    await monitors.start()

    expect(createFeeMonitor).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledWith(
      'Cannot start fee monitor for asset solana. Failed to start!!!',
      expect.any(Error)
    )
  })

  test('should start monitors', async () => {
    await monitors.start()

    expect(solanaMonitor.start).toHaveBeenCalledTimes(1)
  })

  test('fee data is set after start', async () => {
    await monitors.start()
    const fees = await feeDataAtom.get()

    expect(Object.keys(fees).length).toBeGreaterThan(0)
  })

  test('remote config always overrides', async () => {
    await monitors.start()

    expect(solanaMonitor.start).toHaveBeenCalledTimes(1)

    // before the first tick we have the default FeeData
    expect(await monitors.getFeeData({ assetName: 'solana' })).toEqual(defaultFeeData)

    // first tick
    await solanaMonitor.tick({ value: 2, foo: 42 })
    expect(await monitors.getFeeData({ assetName: 'solana' })).toEqual({ value: 2, foo: 42 })

    // remote config override
    await remoteConfigAtom.set(createRemoteConfigData({ value: 3 }))
    expect(await monitors.getFeeData({ assetName: 'solana' })).toEqual({ value: 3, foo: 42 })

    // monitor update ignored becuase of remote override
    await solanaMonitor.tick({ value: 4 })
    expect(await monitors.getFeeData({ assetName: 'solana' })).toEqual({ value: 3, foo: 42 })

    // cancel override, revert to last monitor update (if any)
    await remoteConfigAtom.set(createRemoteConfigData({}))
    expect(await monitors.getFeeData({ assetName: 'solana' })).toEqual({ value: 3, foo: 42 })

    // monitor updates register again
    await solanaMonitor.tick({ value: 5 })
    expect(await monitors.getFeeData({ assetName: 'solana' })).toEqual({ value: 5, foo: 42 })
  })
})

describe('remote fee data across several assets', () => {
  const buildAsset = (name) => ({
    name,
    baseAsset: { name },
    currency: {},
    api: {
      features: { feeMonitor: false },
      getFeeData: () => new FeeData({ config: { value: 1 }, currency: {} }),
    },
  })

  const remoteConfigFor = (feeDataByAsset) => ({
    config: {
      assets: Object.fromEntries(
        Object.entries(feeDataByAsset).map(([name, feeData]) => [name, { feeData }])
      ),
    },
  })

  let remoteConfigAtom
  let feeDataAtom
  let monitors

  beforeEach(async () => {
    remoteConfigAtom = createInMemoryAtom({ defaultValue: { config: { assets: {} } } })
    feeDataAtom = createInMemoryAtom({ defaultValue: {} })

    monitors = createFeeMonitors({
      assetsAtom: createInMemoryAtom({
        defaultValue: {
          value: {
            bitcoin: buildAsset('bitcoin'),
            ethereum: buildAsset('ethereum'),
            solana: buildAsset('solana'),
          },
        },
      }),
      feeDataAtom,
      remoteConfigAtom,
      availableAssetNamesAtom: createInMemoryAtom({ defaultValue: defaultAvailableAssetNames }),
      baseAssetNamesToMonitorAtom: createInMemoryAtom({ defaultValue: [] }),
      logger: { error: jest.fn() },
    })

    await monitors.start()
  })

  test('publishes one value for a payload spanning several assets', async () => {
    const received = []
    const unobserve = feeDataAtom.observe((value) =>
      received.push(JSON.parse(JSON.stringify(value)))
    )
    await settle()
    const before = received.length

    await remoteConfigAtom.set(
      remoteConfigFor({ bitcoin: { value: 11 }, ethereum: { value: 22 }, solana: { value: 33 } })
    )
    await settle()
    unobserve()

    expect(received.length - before).toBe(1)
    expect(received.at(-1).bitcoin.value).toBe(11)
    expect(received.at(-1).ethereum.value).toBe(22)
    expect(received.at(-1).solana.value).toBe(33)
  })

  test('applies every asset in one payload, each with its own value', async () => {
    await remoteConfigAtom.set(
      remoteConfigFor({ bitcoin: { value: 11 }, ethereum: { value: 22 }, solana: { value: 33 } })
    )
    await settle()

    expect(await monitors.getFeeData({ assetName: 'bitcoin' })).toEqual({ value: 11 })
    expect(await monitors.getFeeData({ assetName: 'ethereum' })).toEqual({ value: 22 })
    expect(await monitors.getFeeData({ assetName: 'solana' })).toEqual({ value: 33 })
  })

  test('publishes every changed asset to the fee data atom', async () => {
    await remoteConfigAtom.set(
      remoteConfigFor({ bitcoin: { value: 11 }, ethereum: { value: 22 }, solana: { value: 33 } })
    )

    const published = await feeDataAtom.get()

    expect(published.bitcoin).toEqual({ value: 11 })
    expect(published.ethereum).toEqual({ value: 22 })
    expect(published.solana).toEqual({ value: 33 })
  })

  test('leaves assets missing from the payload at their previous value', async () => {
    await remoteConfigAtom.set(remoteConfigFor({ ethereum: { value: 22 } }))
    await settle()

    expect(await monitors.getFeeData({ assetName: 'ethereum' })).toEqual({ value: 22 })
    expect(await monitors.getFeeData({ assetName: 'bitcoin' })).toEqual({ value: 1 })
    expect(await monitors.getFeeData({ assetName: 'solana' })).toEqual({ value: 1 })

    const published = await feeDataAtom.get()

    expect(published.ethereum).toEqual({ value: 22 })
    expect(published.bitcoin).toEqual({ value: 1 })
    expect(published.solana).toEqual({ value: 1 })
  })

  test('overlapping updates do not lose each other', async () => {
    const overlapping = [
      monitors.updateFee({ assetName: 'bitcoin', feeData: { value: 11 } }),
      monitors.updateFee({ assetName: 'ethereum', feeData: { value: 22 } }),
      remoteConfigAtom.set(remoteConfigFor({ solana: { value: 33 } })),
    ]

    await Promise.all(overlapping)
    await settle()

    const published = await feeDataAtom.get()

    expect(published.bitcoin).toEqual({ value: 11 })
    expect(published.ethereum).toEqual({ value: 22 })
    expect(published.solana).toEqual({ value: 33 })
  })

  test('publishes a snapshot, so an already-read value never changes underneath its reader', async () => {
    const readEarly = await feeDataAtom.get()
    const early = JSON.stringify(readEarly)

    await remoteConfigAtom.set(remoteConfigFor({ bitcoin: { value: 11 } }))
    await settle()

    expect(JSON.stringify(readEarly)).toBe(early)
    expect(JSON.stringify(await feeDataAtom.get())).not.toBe(early)
  })

  test('a later payload updates one asset without disturbing the others', async () => {
    await remoteConfigAtom.set(
      remoteConfigFor({ bitcoin: { value: 11 }, ethereum: { value: 22 }, solana: { value: 33 } })
    )
    await remoteConfigAtom.set(
      remoteConfigFor({ bitcoin: { value: 11 }, ethereum: { value: 99 }, solana: { value: 33 } })
    )
    await settle()

    expect(await monitors.getFeeData({ assetName: 'ethereum' })).toEqual({ value: 99 })
    expect(await monitors.getFeeData({ assetName: 'bitcoin' })).toEqual({ value: 11 })
    expect(await monitors.getFeeData({ assetName: 'solana' })).toEqual({ value: 33 })
  })
})

describe('remote fee data when one asset rejects the payload', () => {
  const buildAsset = (name, feeData) => ({
    name,
    baseAsset: { name },
    currency: {},
    api: { features: { feeMonitor: false }, getFeeData: () => feeData },
  })

  // Remote config is server data, and FeeData.update runs it through mapCurrency, which throws on
  // values it cannot parse. One such asset must not stop the rest of the payload being applied.
  const throwingFeeData = {
    update: () => {
      throw new Error('unparseable fee config')
    },
  }

  test('applies the assets around the one that throws, and reports it', async () => {
    const remoteConfigAtom = createInMemoryAtom({ defaultValue: { config: { assets: {} } } })
    const feeDataAtom = createInMemoryAtom({ defaultValue: {} })
    const logger = { error: jest.fn() }

    const monitors = createFeeMonitors({
      assetsAtom: createInMemoryAtom({
        defaultValue: {
          value: {
            aaa: buildAsset('aaa', new FeeData({ config: { value: 1 }, currency: {} })),
            bbb: buildAsset('bbb', throwingFeeData),
            ccc: buildAsset('ccc', new FeeData({ config: { value: 1 }, currency: {} })),
          },
        },
      }),
      feeDataAtom,
      remoteConfigAtom,
      availableAssetNamesAtom: createInMemoryAtom({ defaultValue: ['aaa', 'bbb', 'ccc'] }),
      baseAssetNamesToMonitorAtom: createInMemoryAtom({ defaultValue: [] }),
      logger,
    })

    await monitors.start()

    await remoteConfigAtom.set({
      config: {
        assets: {
          aaa: { feeData: { value: 11 } },
          bbb: { feeData: { value: 22 } },
          ccc: { feeData: { value: 33 } },
        },
      },
    })

    // the observer applies the payload asynchronously
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(await monitors.getFeeData({ assetName: 'aaa' })).toEqual({ value: 11 })
    expect(await monitors.getFeeData({ assetName: 'ccc' })).toEqual({ value: 33 })

    const published = await feeDataAtom.get()

    expect(published.aaa).toEqual({ value: 11 })
    expect(published.ccc).toEqual({ value: 33 })
    expect(logger.error).toHaveBeenCalledWith(
      'Cannot apply remote fee data for asset bbb. unparseable fee config',
      expect.any(Error)
    )
  })
})

describe('remote fee data when the last asset rejects the payload', () => {
  const buildAsset = (name, feeData) => ({
    name,
    baseAsset: { name },
    currency: {},
    api: { features: { feeMonitor: false }, getFeeData: () => feeData },
  })

  test('still publishes the assets that applied before it', async () => {
    const remoteConfigAtom = createInMemoryAtom({ defaultValue: { config: { assets: {} } } })
    const feeDataAtom = createInMemoryAtom({ defaultValue: {} })

    const monitors = createFeeMonitors({
      assetsAtom: createInMemoryAtom({
        defaultValue: {
          value: {
            aaa: buildAsset('aaa', new FeeData({ config: { value: 1 }, currency: {} })),
            zzz: buildAsset('zzz', {
              update: () => {
                throw new Error('unparseable fee config')
              },
            }),
          },
        },
      }),
      feeDataAtom,
      remoteConfigAtom,
      availableAssetNamesAtom: createInMemoryAtom({ defaultValue: ['aaa', 'zzz'] }),
      baseAssetNamesToMonitorAtom: createInMemoryAtom({ defaultValue: [] }),
      logger: { error: jest.fn() },
    })

    await monitors.start()

    await remoteConfigAtom.set({
      config: { assets: { aaa: { feeData: { value: 11 } }, zzz: { feeData: { value: 22 } } } },
    })
    await settle()

    const published = await feeDataAtom.get()

    expect(published.aaa).toEqual({ value: 11 })
  })
})
