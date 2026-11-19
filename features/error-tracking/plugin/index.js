import { combine, compute } from '@exodus/atoms'

import {
  whyIsRemoteTrackingDisabled,
  whyIsUnsafeRemoteTrackingDisabled,
} from './why-is-remote-tracking-disabled.js'

function errorTrackingPlugin({
  abTestingAtom,
  earliestTxDateAtom,
  walletCreatedAtAtom,
  getBuildMetadata,
  remoteErrorTrackingEnabledAtom,
  unsafeRemoteErrorTrackingEnabledAtom,
  config: {
    remoteErrorTrackingABExperimentId,
    remoteErrorTrackingFundedWalletsABExperimentId,
    trackWalletsCreatedAfter,
    trackFundedWallets,
  },
  logger,
}) {
  const subscriptions = []

  const toEnabled = (reasonDisabled, label) => {
    if (reasonDisabled) {
      logger.debug(`${label} is disabled: ${reasonDisabled}`)
      return false
    }

    logger.debug(`${label} is enabled`)
    return true
  }

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
      selector: async ({ abTesting, earliestTxDate, walletCreatedAt }) =>
        toEnabled(
          whyIsRemoteTrackingDisabled({
            remoteErrorTrackingABExperimentId,
            remoteErrorTrackingFundedWalletsABExperimentId,
            abTesting,
            trackWalletsCreatedAfter,
            walletCreatedAt,
            trackFundedWallets,
            earliestTxDate,
            buildMetadata: await getBuildMetadata(),
            logger,
          }),
          'remote error tracking'
        ),
    })

    subscriptions.push(
      internalRemoteErrorTrackingEnabledAtom.observe(remoteErrorTrackingEnabledAtom.set)
    )

    const internalUnsafeRemoteErrorTrackingEnabledAtom = compute({
      atom: abTestingAtom,
      selector: async (abTesting) =>
        toEnabled(
          whyIsUnsafeRemoteTrackingDisabled({
            remoteErrorTrackingABExperimentId,
            abTesting,
            buildMetadata: await getBuildMetadata(),
            logger,
          }),
          'unsafe remote error tracking'
        ),
    })

    subscriptions.push(
      internalUnsafeRemoteErrorTrackingEnabledAtom.observe(unsafeRemoteErrorTrackingEnabledAtom.set)
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
    'getBuildMetadata',
    'remoteErrorTrackingEnabledAtom',
    'unsafeRemoteErrorTrackingEnabledAtom',
    'config',
    'logger',
  ],
}

export default errorTrackingPluginDefinition
