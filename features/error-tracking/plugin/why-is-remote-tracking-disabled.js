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

  const unfundedExperiment = new ErrorTrackingAbExperiment({
    experimentId: remoteErrorTrackingABExperimentId,
    abTesting,
    logger,
  })

  if (!unfundedExperiment.hasExperimentId) return 'missing-ab-experiment-id'
  if (!unfundedExperiment.enabled) {
    return 'ab-experiment-disabled'
  }

  if (unfundedExperiment.variant !== 'enabled') {
    return 'ab-experiment-variant-disabled'
  }

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
  const fundedExperiment = new ErrorTrackingAbExperiment({
    experimentId: remoteErrorTrackingFundedWalletsABExperimentId,
    abTesting,
    logger,
  })

  if (!fundedExperiment.hasExperimentId) {
    return 'missing-funded-wallets-ab-experiment-id'
  }

  if (!fundedExperiment.enabled) {
    return 'funded-wallets-ab-experiment-disabled'
  }

  if (fundedExperiment.variant !== 'enabled') {
    return 'funded-wallets-ab-experiment-variant-disabled'
  }
}
