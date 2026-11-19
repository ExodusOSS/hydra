import typeforce from '@exodus/typeforce'
import { createFeatureControl } from '@exodus/feature-control'
import { mapValues, pickBy } from '@exodus/basic-utils'
import { combine, createInMemoryAtom, dedupe } from '@exodus/atoms'
import { convertConfigToFeatureControlFormat } from '../shared/format-config.js'
import * as types from './types.js'
import assert from 'minimalistic-assert'

import { createProvider } from './providers/index.js'
import getRolloutBucket from './rollout-bucket.js'

class FeatureFlags {
  #features
  #featureFlagAtoms
  #remoteConfigFeatureFlagAtoms
  #geolocationAtom
  #getBuildMetadata
  #loaded = false
  #nullAtom = createInMemoryAtom({ defaultValue: null })
  #subscriptions = []
  #provider = null
  #analyticsUserIdAtom = null
  #currentUserId = undefined
  #lastSyncedUserId = undefined

  constructor({
    config,
    featureFlagAtoms,
    remoteConfigFeatureFlagAtoms,
    geolocationAtom,
    getBuildMetadata,
    analytics,
    analyticsUserIdAtom,
  }) {
    this.#analyticsUserIdAtom = analyticsUserIdAtom
    const { features, provider, providerConfig } = config

    if (provider) {
      this.#provider = createProvider(provider, { providerConfig, analytics })
    }

    typeforce(types.config, { features }, true)
    typeforce(function validateRemoteConfigFeatureFlagAtoms(atoms) {
      return Object.keys(atoms).every((key) => features[key]?.remoteConfig)
    }, remoteConfigFeatureFlagAtoms)

    assert(
      analyticsUserIdAtom ||
        !Object.values(features).some((f) => f.remoteConfig?.supportedOverrides?.rollout),
      'rollout feature flags require analyticsUserIdAtom'
    )

    this.#features = convertConfigToFeatureControlFormat(features)
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

    if (this.#provider) {
      // Observe userId without blocking. The initial value (or any later change,
      // e.g. once the wallet unlocks and a seed-derived userId becomes available)
      // is mirrored into #currentUserId. Once load() has completed its first sync,
      // subsequent userId changes trigger a re-sync so the provider gets the real
      // distinct_id.
      if (this.#analyticsUserIdAtom) {
        const unobserve = this.#analyticsUserIdAtom.observe((userId) => {
          if (userId === this.#currentUserId) return
          this.#currentUserId = userId
          if (this.#loaded) {
            void this.#syncProviderFlagsToAtoms().catch(() => {})
          }
        })
        this.#subscriptions.push(unobserve)
      }

      await this.#syncProviderFlagsToAtoms().catch(() => {})

      // Race-safety: if userId became available between the initial sync's
      // snapshot and now, kick a re-sync so the provider sees the real userId.
      if (this.#analyticsUserIdAtom && this.#currentUserId !== this.#lastSyncedUserId) {
        void this.#syncProviderFlagsToAtoms().catch(() => {})
      }
    }

    this.#loaded = true
  }

  refresh = async () => {
    if (!this.#provider || !this.#loaded) return

    await this.#syncProviderFlagsToAtoms()
  }

  #syncProviderFlagsToAtoms = async () => {
    const metadata = await this.#getBuildMetadata()
    const geolocation = await this.#geolocationAtom.get()
    const userId = this.#currentUserId
    this.#lastSyncedUserId = userId

    await this.#provider.sync({
      ...metadata,
      ...(geolocation && { geolocation }),
      ...(userId && { userId }),
    })

    const providerFlags = new Set(this.#provider.getFeatureFlagNames())

    const updates = Object.entries(this.#featureFlagAtoms)
      .filter(([key]) => providerFlags.has(key))
      .map(async ([key, atom]) => {
        const isOn = this.#provider.isEnabled(key)
        const value = this.#provider.getValue(key, null)
        await atom.set({ isOn, value })
      })

    await Promise.all(updates)
  }

  #setFeatureFlags = async ({ name, geolocation, userId, remoteOverrides }) => {
    const featureFlagAtom = dedupe(this.#featureFlagAtoms[name])
    const featureConfig = this.#features[name]
    const { supportedOverrides } = featureConfig.remoteConfig
    const { version: versionSemver } = await this.#getBuildMetadata()
    const { geolocationValue, ...localDefaults } = featureConfig.localDefaults
    const opts = {
      ...localDefaults,
      versionSemver,
      ...(supportedOverrides.geolocation ? { geolocation } : {}),
      ...(supportedOverrides.rollout && userId
        ? { rolloutBucket: getRolloutBucket({ name, userId }) }
        : {}),
      __proto__: null,
    }

    // Fall back to the client's geolocationValue when remote config doesn't override it.
    const overrides = { ...remoteOverrides }
    if (supportedOverrides.geolocation && geolocationValue) {
      overrides.geolocation ??= geolocationValue
    }

    const featureControl = createFeatureControl(opts, supportedOverrides)
    const flagValue = pickBy(
      {
        isOn: featureControl.getIsOn(overrides),
        unavailableStatus: featureControl.getUnavailableStatus(overrides),
        unavailableReason: featureControl.getUnavailableReason(overrides),
      },
      (value) => value !== undefined
    )

    await featureFlagAtom.set(flagValue)
  }

  #createRemoteConfigurableFeatureFlag = ({ name }) => {
    assert(
      Object.prototype.hasOwnProperty.call(this.#remoteConfigFeatureFlagAtoms, name),
      `Feature flag atom ${name} not found`
    )

    const remoteConfigFeatureFlagAtom = this.#remoteConfigFeatureFlagAtoms[name]
    const featureConfig = this.#features[name]
    const { supportedOverrides } = featureConfig.remoteConfig

    const inputsAtom = combine({
      geolocation: supportedOverrides.geolocation ? this.#geolocationAtom : this.#nullAtom,
      userId: supportedOverrides.rollout ? this.#analyticsUserIdAtom : this.#nullAtom,
      remoteOverrides: remoteConfigFeatureFlagAtom,
    })

    // A client geolocationValue default must apply even when remote config has no entry,
    // otherwise a build-time geoblock is silently skipped when the remote path is absent.
    const hasClientGeolocationDefault =
      supportedOverrides.geolocation && Boolean(featureConfig.localDefaults?.geolocationValue)

    return inputsAtom.observe(
      (opts) =>
        (opts.remoteOverrides || hasClientGeolocationDefault) &&
        this.#setFeatureFlags({ ...opts, name })
    )
  }

  isEnabled = async (key) => {
    const atom = this.#featureFlagAtoms[key]
    if (!atom) return false
    const value = await atom.get()
    return value?.isOn === true
  }

  getValue = async (key, defaultValue) => {
    const atom = this.#featureFlagAtoms[key]
    if (!atom) return defaultValue
    const value = await atom.get()
    return value?.value ?? defaultValue
  }

  trackExposure = async (key) => {
    return this.#provider?.trackExposure(key)
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
  id: 'featureFlags',
  type: 'module',
  dependencies: [
    'config',
    'featureFlagAtoms',
    'remoteConfigFeatureFlagAtoms',
    'geolocationAtom',
    'getBuildMetadata',
    'analytics?',
    'analyticsUserIdAtom?',
  ],
  factory: createFeatureFlags,
  public: true,
}

export default featureFlagsDefinition
