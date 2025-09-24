import { combine, compute } from '@exodus/atoms'

import { whyIsRemoteTrackingDisabled } from './why-is-remote-tracking-disabled.js'

function errorTrackingPlugin({
  abTestingAtom,
  earliestTxDateAtom,
  walletCreatedAtAtom,
  getBuildMetadata,
  remoteErrorTrackingEnabledAtom,
  config: {
    remoteErrorTrackingABExperimentId,
    remoteErrorTrackingFundedWalletsABExperimentId,
    trackWalletsCreatedAfter,
    trackFundedWallets,
  },
  logger,
}) {
  const subscriptions = []

  const onAssetsSynced = async () => {
    if (!abTestingAtom) {
      logger.debug('remote error tracking is disabled, ab-testing feature not found')
      return
    }

    // defined locally instead of in /atoms to avoid circular dependency
    // literally everything depends on error-tracking, so error-tracking atoms can't depend on other features
    const internalRemoteErrorTrackingEnabledAtom = compute({
      atom: combine({
        abTesting: abTestingAtom,
        earliestTxDate: earliestTxDateAtom,
        walletCreatedAt: walletCreatedAtAtom,
      }),
      selector: async ({ abTesting, earliestTxDate, walletCreatedAt }) => {
        const reasonDisabled = whyIsRemoteTrackingDisabled({
          remoteErrorTrackingABExperimentId,
          remoteErrorTrackingFundedWalletsABExperimentId,
          abTesting,
          trackWalletsCreatedAfter,
          walletCreatedAt,
          trackFundedWallets,
          earliestTxDate,
          buildMetadata: await getBuildMetadata(),
          logger,
        })

        if (reasonDisabled) {
          logger.debug(`remote error tracking is disabled: ${reasonDisabled}`)
          return false
        }

        logger.debug('remote error tracking is enabled')
        return true
      },
    })

    subscriptions.push(
      internalRemoteErrorTrackingEnabledAtom.observe(remoteErrorTrackingEnabledAtom.set)
    )
  }

  const onStop = () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())
    subscriptions.length = 0
  }

  return {
    onAssetsSynced,
    onStop,
  }
}

const errorTrackingPluginDefinition = {
  id: 'errorTrackingPlugin',
  type: 'plugin',
  factory: errorTrackingPlugin,
  dependencies: [
    'abTestingAtom?',
    'earliestTxDateAtom',
    'walletCreatedAtAtom',
    'remoteErrorTrackingEnabledAtom',
    'getBuildMetadata',
    'config',
    'logger',
  ],
}

export default errorTrackingPluginDefinition
