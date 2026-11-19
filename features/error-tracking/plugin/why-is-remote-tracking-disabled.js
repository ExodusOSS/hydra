import typeforce from '@exodus/typeforce'

export class ErrorTrackingAbExperiment {
  #experimentId
  #abExperimentSchema = typeforce.maybe({
    enabled: 'Boolean',
  })

  #abVariantSchema = typeforce.maybe({
    value: 'String',
    type: 'String',
  })

  #enabled
  #variant

  constructor({ experimentId, abTesting, logger }) {
    if (!logger) {
      throw new Error('logger is required')
    }

    this.#experimentId = experimentId

    if (experimentId) {
      try {
        const experimentParsed = typeforce.parse(
          this.#abExperimentSchema,
          abTesting?.experiments?.[experimentId],
          true
        )

        const variantParsed = typeforce.parse(
          this.#abVariantSchema,
          abTesting?.variants?.[experimentId],
          true
        )

        this.#enabled = experimentParsed?.enabled
        this.#variant = variantParsed?.value
      } catch {
        // Attract attention to the issue and keep 'enabled' and 'variant' undefined to ensure remote tracking is disabled.
        logger.debug(
          `ErrorTrackingAbExperiment: failed to parse abTesting for experimentId: ${experimentId}`
        )
      }
    }
  }

  get hasExperimentId() {
    return !!this.#experimentId
  }

  get enabled() {
    return this.#enabled
  }

  get variant() {
    return this.#variant
  }
}

function whyIsExperimentDisabled({ experimentId, abTesting, logger, prefix = '' }) {
  const experiment = new ErrorTrackingAbExperiment({ experimentId, abTesting, logger })

  if (!experiment.hasExperimentId) return `${prefix}missing-ab-experiment-id`
  if (!experiment.enabled) return `${prefix}ab-experiment-disabled`
  if (experiment.variant !== 'enabled') return `${prefix}ab-experiment-variant-disabled`
}

export function whyIsRemoteTrackingDisabled({
  remoteErrorTrackingABExperimentId,
  remoteErrorTrackingFundedWalletsABExperimentId,
  abTesting,
  trackWalletsCreatedAfter,
  walletCreatedAt,
  trackFundedWallets,
  earliestTxDate,
  buildMetadata,
  logger,
}) {
  if (buildMetadata.dev) return 'dev-mode'

  const baseDisabledReason = whyIsExperimentDisabled({
    experimentId: remoteErrorTrackingABExperimentId,
    abTesting,
    logger,
  })
  if (baseDisabledReason) return baseDisabledReason

  if (
    trackWalletsCreatedAfter &&
    // the negation's a bit harder to read but is a safer check
    !(new Date(walletCreatedAt) > trackWalletsCreatedAfter)
  ) {
    return 'wallet-too-old'
  }

  if (earliestTxDate) {
    if (!trackFundedWallets) return 'not-tracking-funded-wallets'
  } else {
    // track unfunded wallet
    return
  }

  // FUNDED WALLETS: separate AB experiment
  const fundedDisabledReason = whyIsExperimentDisabled({
    experimentId: remoteErrorTrackingFundedWalletsABExperimentId,
    abTesting,
    logger,
    prefix: 'funded-wallets-',
  })
  if (fundedDisabledReason) return fundedDisabledReason
}

export function whyIsUnsafeRemoteTrackingDisabled({
  remoteErrorTrackingABExperimentId,
  abTesting,
  buildMetadata,
  logger,
}) {
  if (buildMetadata.dev) return 'dev-mode'

  return whyIsExperimentDisabled({
    experimentId: remoteErrorTrackingABExperimentId,
    abTesting,
    logger,
  })
}
