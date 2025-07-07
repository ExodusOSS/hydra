import isRemoteTrackingEnabled from '../why-is-remote-tracking-disabled.js'

const paramsWhenEnabled = {
  remoteErrorTrackingABExperimentId: 'sentry',
  abTesting: { experiments: { sentry: { enabled: true } } },
  trackWalletsCreatedAfter: new Date('2023-01-01'),
  walletCreatedAt: new Date('2023-06-01'),
  trackFundedWallets: true,
  earliestTxDate: null,
  buildMetadata: { build: 'production' },
}

test('it is disabled when no experiment ID is provided', () => {
  const result = isRemoteTrackingEnabled({
    ...paramsWhenEnabled,
    remoteErrorTrackingABExperimentId: null,
  })
  expect(result).toBe('missing-ab-experiment-id')
})

test('it is disabled when remoteErrorTrackingABExperimentId is empty string', () => {
  const result = isRemoteTrackingEnabled({
    ...paramsWhenEnabled,
    remoteErrorTrackingABExperimentId: '',
  })
  expect(result).toBe('missing-ab-experiment-id')
})

test('it is disabled when experiment is not enabled', () => {
  const result = isRemoteTrackingEnabled({
    ...paramsWhenEnabled,
    abTesting: { experiments: { sentry: { enabled: false } } },
  })
  expect(result).toBe('ab-experiment-disabled')
})

test('it is disabled when experiment does not exist', () => {
  const result = isRemoteTrackingEnabled({
    ...paramsWhenEnabled,
    abTesting: { experiments: {} },
  })
  expect(result).toBe('ab-experiment-disabled')
})

test('it is disabled when wallet created before trackWalletsCreatedAfter date', () => {
  const result = isRemoteTrackingEnabled({
    ...paramsWhenEnabled,
    walletCreatedAt: new Date('2022-06-01'), // Before 2023-01-01
  })
  expect(result).toBe('wallet-too-old')
})

test('it is disabled when wallet created exactly at trackWalletsCreatedAfter date', () => {
  const result = isRemoteTrackingEnabled({
    ...paramsWhenEnabled,
    walletCreatedAt: new Date('2023-01-01'), // Exactly at the cutoff date
  })
  expect(result).toBe('wallet-too-old') // Should be false since it's not > the date
})

test('it is enabled when wallet created after trackWalletsCreatedAfter date', () => {
  const result = isRemoteTrackingEnabled({
    ...paramsWhenEnabled,
    walletCreatedAt: new Date('2023-01-02'), // After 2023-01-01
  })
  expect(result).toBe(undefined)
})

test('it is enabled when trackWalletsCreatedAfter is null', () => {
  const result = isRemoteTrackingEnabled({
    ...paramsWhenEnabled,
    trackWalletsCreatedAfter: null,
    walletCreatedAt: new Date('2020-01-01'), // Very old wallet
  })
  expect(result).toBe(undefined) // Should pass since no date limit is set
})

test('it is disabled when trackFundedWallets is false and wallet has transactions', () => {
  const result = isRemoteTrackingEnabled({
    ...paramsWhenEnabled,
    trackFundedWallets: false,
    earliestTxDate: new Date('2023-06-01'),
  })
  expect(result).toBe('not-tracking-funded-wallets')
})

test('it is enabled when trackFundedWallets is false and wallet has no transactions', () => {
  const result = isRemoteTrackingEnabled({
    ...paramsWhenEnabled,
    trackFundedWallets: false,
    earliestTxDate: null, // No transactions
  })
  expect(result).toBe(undefined)
})

test('it is enabled when trackFundedWallets is true and wallet has transactions', () => {
  const result = isRemoteTrackingEnabled({
    ...paramsWhenEnabled,
    trackFundedWallets: true,
    earliestTxDate: new Date('2023-06-01'), // Has transactions
  })
  expect(result).toBe(undefined)
})

test('it is enabled when trackFundedWallets is true and wallet has no transactions', () => {
  const result = isRemoteTrackingEnabled({
    ...paramsWhenEnabled,
    trackFundedWallets: true,
    earliestTxDate: null, // No transactions
  })
  expect(result).toBe(undefined)
})

test('it is disabled when build is dev', () => {
  const result = isRemoteTrackingEnabled({
    ...paramsWhenEnabled,
    buildMetadata: { dev: true },
  })
  expect(result).toBe('dev-mode')
})

test('it is enabled when build is production', () => {
  const result = isRemoteTrackingEnabled({
    ...paramsWhenEnabled,
    buildMetadata: { build: 'production' },
  })
  expect(result).toBe(undefined)
})

test('it is enabled when build is staging', () => {
  const result = isRemoteTrackingEnabled({
    ...paramsWhenEnabled,
    buildMetadata: { build: 'staging' },
  })
  expect(result).toBe(undefined)
})

test('it is enabled when build is release', () => {
  const result = isRemoteTrackingEnabled({
    ...paramsWhenEnabled,
    buildMetadata: { build: 'release' },
  })
  expect(result).toBe(undefined)
})

test('it handles string walletCreatedAt dates', () => {
  const result = isRemoteTrackingEnabled({
    ...paramsWhenEnabled,
    walletCreatedAt: '2023-06-01', // String date
  })
  expect(result).toBe(undefined)
})

test('it is enabled when all conditions are met', () => {
  const result = isRemoteTrackingEnabled(paramsWhenEnabled)
  expect(result).toBe(undefined)
})
