import {
  ErrorTrackingAbExperiment,
  whyIsRemoteTrackingDisabled,
} from '../why-is-remote-tracking-disabled.js'

const paramsWhenEnabled = {
  remoteErrorTrackingABExperimentId: 'sentry',
  abTesting: {
    experiments: { sentry: { enabled: true } },
    variants: { sentry: { value: 'enabled', type: 'remote' } },
  },
  trackWalletsCreatedAfter: new Date('2023-01-01'),
  walletCreatedAt: new Date('2023-06-01'),
  trackFundedWallets: true,
  earliestTxDate: null,
  buildMetadata: { build: 'production' },
  logger: { debug: jest.fn() },
}

const paramsWhenEnabledForFundedWallets = {
  ...paramsWhenEnabled,
  earliestTxDate: new Date('2023-06-01'),
  remoteErrorTrackingFundedWalletsABExperimentId: 'sentry-funded',
  abTesting: {
    experiments: {
      sentry: { enabled: true },
      'sentry-funded': { enabled: true },
    },
    variants: {
      sentry: { value: 'enabled', type: 'remote' },
      'sentry-funded': { value: 'enabled', type: 'remote' },
    },
  },
}

describe('unfunded wallets', () => {
  test('it is disabled when no experiment ID is provided', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabled,
      remoteErrorTrackingABExperimentId: null,
    })
    expect(result).toBe('missing-ab-experiment-id')
  })

  test('it is disabled when remoteErrorTrackingABExperimentId is empty string', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabled,
      remoteErrorTrackingABExperimentId: '',
    })
    expect(result).toBe('missing-ab-experiment-id')
  })

  test('it is disabled when experiment is not enabled', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabled,
      abTesting: { experiments: { sentry: { enabled: false } } },
    })
    expect(result).toBe('ab-experiment-disabled')
  })

  test('it is disabled when experiment does not exist', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabled,
      abTesting: { experiments: {} },
    })
    expect(result).toBe('ab-experiment-disabled')
  })

  test('it is disabled when experiment is enabled, but variant is disabled', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabled,
      abTesting: {
        experiments: { sentry: { enabled: true } },
        variants: { sentry: { value: 'disabled', type: 'remote' } },
      },
    })
    expect(result).toBe('ab-experiment-variant-disabled')
  })

  test('it is disabled when wallet created before trackWalletsCreatedAfter date', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabled,
      walletCreatedAt: new Date('2022-06-01'), // Before 2023-01-01
    })
    expect(result).toBe('wallet-too-old')
  })

  test('it is disabled when wallet created exactly at trackWalletsCreatedAfter date', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabled,
      walletCreatedAt: new Date('2023-01-01'), // Exactly at the cutoff date
    })
    expect(result).toBe('wallet-too-old') // Should be false since it's not > the date
  })

  test('it is enabled when wallet created after trackWalletsCreatedAfter date', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabled,
      walletCreatedAt: new Date('2023-01-02'), // After 2023-01-01
    })
    expect(result).toBe(undefined)
  })

  test('it is enabled when trackWalletsCreatedAfter is null', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabled,
      trackWalletsCreatedAfter: null,
      walletCreatedAt: new Date('2020-01-01'), // Very old wallet
    })
    expect(result).toBe(undefined) // Should pass since no date limit is set
  })

  test('it is disabled when trackFundedWallets is false and wallet has transactions', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabled,
      trackFundedWallets: false,
      earliestTxDate: new Date('2023-06-01'),
    })
    expect(result).toBe('not-tracking-funded-wallets')
  })

  test('it is enabled when trackFundedWallets is false and wallet has no transactions', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabled,
      trackFundedWallets: false,
      earliestTxDate: null, // No transactions
    })
    expect(result).toBe(undefined)
  })

  test('it is enabled when trackFundedWallets is true and wallet has no transactions', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabled,
      trackFundedWallets: true,
      earliestTxDate: null, // No transactions
    })
    expect(result).toBe(undefined)
  })

  test('it is disabled when build is dev', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabled,
      buildMetadata: { dev: true },
    })
    expect(result).toBe('dev-mode')
  })

  test('it is enabled when build is production', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabled,
      buildMetadata: { build: 'production' },
    })
    expect(result).toBe(undefined)
  })

  test('it is enabled when build is staging', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabled,
      buildMetadata: { build: 'staging' },
    })
    expect(result).toBe(undefined)
  })

  test('it is enabled when build is release', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabled,
      buildMetadata: { build: 'release' },
    })
    expect(result).toBe(undefined)
  })

  test('it handles string walletCreatedAt dates', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabled,
      walletCreatedAt: '2023-06-01', // String date
    })
    expect(result).toBe(undefined)
  })

  test('it is enabled when all conditions are met', () => {
    const result = whyIsRemoteTrackingDisabled(paramsWhenEnabled)
    expect(result).toBe(undefined)
  })
})

describe('funded wallets', () => {
  test('it is disabled when no experiment ID is provided', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabledForFundedWallets,
      remoteErrorTrackingFundedWalletsABExperimentId: null,
    })
    expect(result).toBe('missing-funded-wallets-ab-experiment-id')
  })

  test('it is disabled when experiment is not enabled', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabledForFundedWallets,
      abTesting: {
        ...paramsWhenEnabledForFundedWallets.abTesting,
        experiments: {
          ...paramsWhenEnabledForFundedWallets.abTesting.experiments,
          'sentry-funded': { enabled: false },
        },
      },
    })
    expect(result).toBe('funded-wallets-ab-experiment-disabled')
  })

  test('it is disabled when experiment does not exist', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabledForFundedWallets,
      abTesting: paramsWhenEnabled.abTesting,
    })

    expect(result).toBe('funded-wallets-ab-experiment-disabled')
  })

  test('it is disabled when experiment is enabled, but variant is disabled', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabledForFundedWallets,
      abTesting: {
        ...paramsWhenEnabledForFundedWallets.abTesting,
        variants: {
          ...paramsWhenEnabledForFundedWallets.abTesting.variants,
          'sentry-funded': { value: 'disabled', type: 'remote' },
        },
      },
    })
    expect(result).toBe('funded-wallets-ab-experiment-variant-disabled')
  })

  test('it is disabled when wallet created before trackWalletsCreatedAfter date', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabledForFundedWallets,
      walletCreatedAt: new Date('2022-06-01'), // Before 2023-01-01
    })
    expect(result).toBe('wallet-too-old')
  })

  test('it is enabled when wallet created after trackWalletsCreatedAfter date', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabledForFundedWallets,
      walletCreatedAt: new Date('2023-01-02'), // After 2023-01-01
    })
    expect(result).toBe(undefined)
  })

  test('it is enabled when trackWalletsCreatedAfter is null', () => {
    const result = whyIsRemoteTrackingDisabled({
      ...paramsWhenEnabledForFundedWallets,
      trackWalletsCreatedAfter: null,
      walletCreatedAt: new Date('2020-01-01'), // Very old wallet
    })
    expect(result).toBe(undefined) // Should pass since no date limit is set
  })

  test('it is enabled when all conditions are met', () => {
    const result = whyIsRemoteTrackingDisabled(paramsWhenEnabledForFundedWallets)
    expect(result).toBe(undefined)
  })
})

describe('ErrorTrackingAbExperiment', () => {
  const logger = { debug: jest.fn() }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('gracefully handles undefined experimentId', () => {
    const errorTrackingAbExperiment = new ErrorTrackingAbExperiment({
      experimentId: undefined,
      logger,
    })
    expect(errorTrackingAbExperiment.hasExperimentId).toBe(false)
    expect(errorTrackingAbExperiment.enabled).toBe(undefined)
    expect(errorTrackingAbExperiment.variant).toBe(undefined)
  })

  test('gracefully handles undefined abTesting', () => {
    const errorTrackingAbExperiment = new ErrorTrackingAbExperiment({
      experimentId: 'sentry',
      abTesting: undefined,
      logger,
    })
    expect(errorTrackingAbExperiment.hasExperimentId).toBe(true)
    expect(errorTrackingAbExperiment.enabled).toBe(undefined)
    expect(errorTrackingAbExperiment.variant).toBe(undefined)
    // It's expected to allow undefined values for experiments and variants
    expect(logger.debug).not.toHaveBeenCalled()
  })

  test('"experiment" is undefined if experiments do not match the schema', () => {
    const errorTrackingAbExperiment1 = new ErrorTrackingAbExperiment({
      experimentId: 'sentry',
      abTesting: { experiments: { sentry: { enabled: 'true' } } }, // Should be a boolean.
      logger,
    })
    expect(errorTrackingAbExperiment1.hasExperimentId).toBe(true)

    expect(errorTrackingAbExperiment1.enabled).toBe(undefined)
    expect(errorTrackingAbExperiment1.variant).toBe(undefined)
    expect(logger.debug).toHaveBeenCalled()
  })

  test('"variant" is undefined if variants do not match the schema', () => {
    const errorTrackingAbExperiment1 = new ErrorTrackingAbExperiment({
      experimentId: 'sentry',
      abTesting: { variants: { sentry: 'enabled' } }, // Should be an object with 'value' and 'type' properties.
      logger,
    })
    expect(errorTrackingAbExperiment1.hasExperimentId).toBe(true)

    expect(errorTrackingAbExperiment1.enabled).toBe(undefined)
    expect(errorTrackingAbExperiment1.variant).toBe(undefined)
    expect(logger.debug).toHaveBeenCalled()
  })

  test('"experiment" and "variant" exist when they match the schema', () => {
    const errorTrackingAbExperiment1 = new ErrorTrackingAbExperiment({
      experimentId: 'sentry',
      abTesting: {
        experiments: { sentry: { enabled: true } },
        variants: { sentry: { value: 'disabled', type: 'remote' } },
      },
      logger,
    })
    expect(errorTrackingAbExperiment1.hasExperimentId).toBe(true)

    expect(errorTrackingAbExperiment1.enabled).toBe(true)
    expect(errorTrackingAbExperiment1.variant).toBe('disabled')
    expect(logger.debug).not.toHaveBeenCalled()
  })
})
