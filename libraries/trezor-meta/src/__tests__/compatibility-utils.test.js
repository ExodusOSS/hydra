import {
  getTrezorConfiguration,
  isSupportedOnlyByModelT,
  isTrezorSupported,
  MODEL_1,
  MODEL_SAFE_3,
  MODEL_T,
} from '../compatibility-utils.js'

const makeAsset = (baseName, name = baseName) => ({
  name,
  baseAsset: { name: baseName },
})

describe('isTrezorSupported', () => {
  test('returns false if asset is undefined', () => {
    expect(isTrezorSupported({ asset: null })).toBe(false)
  })

  test('supports all models', () => {
    const asset = makeAsset('bitcoin')

    expect(isTrezorSupported({ asset })).toBe(true)
    expect(isTrezorSupported({ asset, onlyBase: true })).toBe(true)
    expect(isTrezorSupported({ asset, onlyBase: false })).toBe(true)
    expect(isTrezorSupported({ asset, model: MODEL_T })).toBe(true)
    expect(isTrezorSupported({ asset, model: MODEL_1 })).toBe(true)
  })

  test('supports specific models only', () => {
    const asset = makeAsset('dash')

    expect(isTrezorSupported({ asset, model: MODEL_T })).toBe(true)
    expect(isTrezorSupported({ asset, model: MODEL_1 })).toBe(true)
    expect(isTrezorSupported({ asset, model: MODEL_SAFE_3 })).toBe(false)
  })

  test('token support with onlyBase false', () => {
    const asset = makeAsset('ethereum', 'USDC')

    expect(isTrezorSupported({ asset })).toBe(true)
    expect(isTrezorSupported({ asset, model: MODEL_T })).toBe(true)
    expect(isTrezorSupported({ asset, onlyBase: false })).toBe(true)
    expect(isTrezorSupported({ asset, onlyBase: true })).toBe(false)
  })

  test('token support with onlyBase true', () => {
    const asset = makeAsset('ethereum', 'USDC')
    expect(isTrezorSupported({ asset, onlyBase: true })).toBe(false)
  })

  test('unsupported network', () => {
    const asset = makeAsset('nonexistentcoin')
    expect(isTrezorSupported({ asset })).toBe(false)
  })
})

describe('isSupportedOnlyByModelT', () => {
  test('ripple supported only by model T', () => {
    expect(isSupportedOnlyByModelT({ asset: makeAsset('ripple') })).toBe(true)
  })

  test('cardano supported only by model T', () => {
    expect(isSupportedOnlyByModelT({ asset: makeAsset('cardano') })).toBe(true)
  })

  test('bitcoin supported by all models, not only model T', () => {
    expect(isSupportedOnlyByModelT({ asset: makeAsset('bitcoin') })).toBe(false)
  })
})

describe('getTrezorConfiguration', () => {
  test('returns correct config', () => {
    const config = getTrezorConfiguration({ asset: makeAsset('litecoin') })

    expect(config?.isSegwit).toBeTruthy()
    expect(config).toEqual({
      isBip84: true,
      isSegwit: true,
      models: ['1', 'T', 'Safe 3', 'Safe 5'],
    })
  })
})
