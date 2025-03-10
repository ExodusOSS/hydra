import semver from 'semver'
import assert from 'assert'

import _isShutDown from './modules/is-shut-down.js'
import _getUnavailableStatus from './modules/get-unavailable-status.js'
import _isEnabledInGeolocation from './modules/is-enabled-in-geolocation.js'

const modules = {
  SHUT_DOWN_SEMVER: 'shutdownSemver',
  GEOLOCATION: 'geolocation',
  ENABLED_OVERRIDE: 'enabledOverride',
}

const _getEnabledStatus = (featureConfig, opts, enabledModules) => {
  if (enabledModules.shutdownSemver && _isShutDown(featureConfig, opts))
    return { isOn: false, module: modules.SHUT_DOWN_SEMVER }
  if (enabledModules.geolocation && !_isEnabledInGeolocation(featureConfig, opts))
    return { isOn: false, module: modules.GEOLOCATION }
  if (enabledModules.enabledOverride && typeof featureConfig?.enabled === 'boolean')
    return { isOn: featureConfig.enabled, module: modules.ENABLED_OVERRIDE }
  return { isOn: opts.enabled }
}

const _getIsOn = (featureConfig, opts, enabledModules) =>
  opts.ready && _getEnabledStatus(featureConfig, opts, enabledModules).isOn

const _getUnavailableReason = (featureConfig, opts, enabledModules) => {
  if (!opts.ready) return
  const { isOn, module } = _getEnabledStatus(featureConfig, opts, enabledModules)

  if (isOn) return
  return module
}

const validateOpts = (opts, enabledModules) => {
  const { versionSemver, ready, enabled, geolocation } = opts

  assert(typeof ready === 'boolean', 'ready must be a boolean')
  assert(typeof enabled === 'boolean', 'enabled must be a boolean')
  if (enabledModules.shutdownSemver)
    assert(
      typeof versionSemver === 'string' && semver.valid(versionSemver),
      'versionSemver must be a valid semver'
    )
  if (enabledModules.geolocation)
    assert(typeof geolocation === 'object', 'geolocation must be an object')
}

const availableModules = new Set(['shutdownSemver', 'geolocation', 'enabledOverride'])
const validateModules = (enabledModules) => {
  Object.keys(enabledModules).forEach((module) =>
    assert(
      availableModules.has(module),
      `module ${module} must be one of available modules ${[...availableModules].join(', ')}`
    )
  )
}

const createFeatureControl = (
  { ready = false, enabled = true, ...rest } = {},
  enabledModules = {}
) => {
  const opts = { ready, enabled, ...rest }
  validateModules(enabledModules)
  validateOpts(opts, enabledModules)

  const getIsOn = (featureConfig) => _getIsOn(featureConfig, opts, enabledModules)

  const getUnavailableStatus = (featureConfig) => _getUnavailableStatus(featureConfig, opts)

  const getUnavailableReason = (featureConfig) =>
    _getUnavailableReason(featureConfig, opts, enabledModules)

  return {
    getIsOn,
    getUnavailableStatus,
    getUnavailableReason,
  }
}

export default createFeatureControl
