import { createSelector } from 'reselect'
import assert from 'minimalistic-assert'

import createFeatureControl from './create-feature-control.js'

const validateOpts = (opts) => {
  const { featureConfigSelector, optsSelector } = opts

  assert(typeof featureConfigSelector === 'function', 'featureConfigSelector must be a function')
  assert(typeof optsSelector === 'function', 'optsSelector must be a function')
}

const createFeatureControlSelectors = ({ featureConfigSelector, optsSelector }, enabledModules) => {
  validateOpts({ featureConfigSelector, optsSelector })

  return {
    isOnSelector: createSelector(featureConfigSelector, optsSelector, (featureConfig, opts) =>
      createFeatureControl(opts, enabledModules).getIsOn(featureConfig)
    ),
    unavailableStatusSelector: createSelector(
      featureConfigSelector,
      optsSelector,
      (featureConfig, opts) =>
        createFeatureControl(opts, enabledModules).getUnavailableStatus(featureConfig)
    ),
    unavailableReasonSelector: createSelector(
      featureConfigSelector,
      optsSelector,
      (featureConfig, opts) =>
        createFeatureControl(opts, enabledModules).getUnavailableReason(featureConfig)
    ),
  }
}

export default createFeatureControlSelectors
