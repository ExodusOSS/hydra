import typeforce from '@exodus/typeforce'
import { createFeatureControl } from '@exodus/feature-control'
import ExodusModule from '@exodus/module' // eslint-disable-line import/no-deprecated
import { mapValues, pickBy } from '@exodus/basic-utils'
import { combine, createInMemoryAtom, dedupe } from '@exodus/atoms'
import { convertConfigToFeatureControlFormat } from '../shared/format-config'
import * as types from './types'

const MODULE_ID = 'featureFlags'

class FeatureFlags extends ExodusModule {
  #features
  #featureFlagAtoms
  #remoteConfigFeatureFlagAtoms
  #geolocationAtom
  #getBuildMetadata
  #loaded = false
  #nullAtom = createInMemoryAtom({ defaultValue: null })
  #subscriptions = []

  constructor({
    config,
    featureFlagAtoms,
    remoteConfigFeatureFlagAtoms,
    geolocationAtom,
    getBuildMetadata,
    logger,
  }) {
    super({ name: MODULE_ID, logger })

    typeforce(types.config, config, true)
    typeforce(function validateRemoteConfigFeatureFlagAtoms(atoms) {
      return Object.keys(atoms).every((key) => config.features[key]?.remoteConfig)
    }, remoteConfigFeatureFlagAtoms)

    this.#features = convertConfigToFeatureControlFormat(config.features)
    this.#featureFlagAtoms = featureFlagAtoms
    this.#remoteConfigFeatureFlagAtoms = remoteConfigFeatureFlagAtoms
    this.#geolocationAtom = geolocationAtom
    this.#getBuildMetadata = getBuildMetadata
  }

  load = async () => {
    if (this.#loaded) return

    this.#subscriptions = Object.values(
      mapValues(this.#remoteConfigFeatureFlagAtoms, (_, name) =>
        this.#createRemoteConfigurableFeatureFlag({ name })
      )
    )

    this.#loaded = true
  }

  #setFeatureFlags = async ({ name, geolocation, remoteOverrides }) => {
    const featureFlagAtom = dedupe(this.#featureFlagAtoms[name])
    const featureConfig = this.#features[name]
    const { supportedOverrides } = featureConfig.remoteConfig
    const { version: versionSemver } = await this.#getBuildMetadata()
    const opts = {
      ...featureConfig.localDefaults,
      versionSemver,
      ...(supportedOverrides.geolocation ? { geolocation } : {}),
    }

    const featureControl = createFeatureControl(opts, supportedOverrides)
    const flagValue = pickBy(
      {
        isOn: featureControl.getIsOn(remoteOverrides),
        unavailableStatus: featureControl.getUnavailableStatus(remoteOverrides),
        unavailableReason: featureControl.getUnavailableReason(remoteOverrides),
      },
      (value) => value !== undefined
    )

    await featureFlagAtom.set(flagValue)
  }

  #createRemoteConfigurableFeatureFlag = ({ name }) => {
    const remoteConfigFeatureFlagAtom = this.#remoteConfigFeatureFlagAtoms[name]
    const featureConfig = this.#features[name]
    const { supportedOverrides } = featureConfig.remoteConfig

    const inputsAtom = combine({
      geolocation: supportedOverrides.geolocation ? this.#geolocationAtom : this.#nullAtom,
      remoteOverrides: remoteConfigFeatureFlagAtom,
    })

    return inputsAtom.observe(
      (opts) => opts.remoteOverrides && this.#setFeatureFlags({ ...opts, name })
    )
  }

  clear = async () => {
    await Promise.all(Object.values(this.#featureFlagAtoms).map((atom) => atom.set(undefined)))
  }

  stop = () => {
    this.#subscriptions.forEach((unsubscribe) => unsubscribe())
  }
}

const createFeatureFlags = (opts) => new FeatureFlags(opts)

const featureFlagsDefinition = {
  id: MODULE_ID,
  type: 'module',
  dependencies: [
    'config',
    'featureFlagAtoms',
    'remoteConfigFeatureFlagAtoms',
    'geolocationAtom',
    'getBuildMetadata',
    'logger',
  ],
  factory: createFeatureFlags,
  public: true,
}

export default featureFlagsDefinition
