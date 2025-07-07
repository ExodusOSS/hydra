export default function whyIsRemoteTrackingDisabled({
  remoteErrorTrackingABExperimentId,
  abTesting,
  trackWalletsCreatedAfter,
  walletCreatedAt,
  trackFundedWallets,
  earliestTxDate,
  buildMetadata,
}) {
  if (!remoteErrorTrackingABExperimentId) return 'missing-ab-experiment-id'
  if (!abTesting.experiments?.[remoteErrorTrackingABExperimentId]?.enabled)
    return 'ab-experiment-disabled'
  if (
    trackWalletsCreatedAfter &&
    // the negation's a bit harder to read but is a safer check
    !(new Date(walletCreatedAt) > trackWalletsCreatedAfter)
  ) {
    return 'wallet-too-old'
  }

  if (!trackFundedWallets && earliestTxDate) return 'not-tracking-funded-wallets'
  if (buildMetadata.dev) return 'dev-mode'
}
