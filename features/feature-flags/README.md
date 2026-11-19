# @exodus/feature-flags

Modules and atoms for monitoring/controlling the currently available features based on `remoteConfig`, device `geolocation`, etc. See also [@exodus/feature-control](https://github.com/ExodusMovement/feature-control).

## Usage

We recommend you use this feature via `@exodus/headless`, as follows in the below example:

1. Specify your feature flags when configuring the ` @exodus/headless` instance.
2. Consume/control feature flags:

- In your modules/atoms/plugins/features, use the `featureFlagAtoms` dependency.
- In the UI:
  - Use the `selectors.featureFlags.create(featureFlagName)` selector to read the current flag value.
  - Use `exodus.featureFlags.enable(featureFlagName)` and `exodus.featureFlags.disable(featureFlagName)` if you need to toggle the flag value at runtime.

See example code below.

### background

```js
import createExodus from '@exodus/headless'

const featureFlags = {
  // ... other feature flags,
  dogeMode: {
    localDefaults: {
      // `true` if feature is shipped (available at runtime), `false` otherwise
      available: true,
      // controls whether the feature is enabled by default
      // NOTE: if `available` is false, `enabled` can NOT be true, or you can expect an error
      enabled: true,
    },
    remoteConfig: {
      // path to flag in remote config schema
      path: 'features.dogeMode',
      supportedOverrides: {
        // can be enabled/disabled for all users via remote config
        enabled: true,
        // can be enabled/disabled for users in certain geolocations via remote config
        geolocation: true,
        // can be enabled/disabled for users on certain app versions via remote config
        shutdownSemver: true,
        // can be rolled out to a share of users via remote config, see "Gradual rollout"
        rollout: true,
      },
    },
  },
}

const exodusContainer = createExodus({
  port,
  adapters,
  config: {
    // ...,
    featureFlags,
  },
})

const checkDogeModePlugin = {
  id: 'checkDogeModePlugin',
  factory: ({ featureFlagAtoms }) => {
    const onStart = () => {
      featureFlagAtoms.dogeMode?.get().then(({ isOn }) => {
        console.log('>>> is dogeMode enabled?', isOn)
      })
    }

    return {
      onStart,
    }
  },
  dependencies: ['featureFlagAtoms'],
}

exodusContainer.register({
  definition: checkDogeModePlugin,
})

const exodus = exodusContainer.resolve()
// ... continue as usual
```

### UI-side

```js
import selectors from '~/ui/flux/selectors'

const dogeModeFeatureName = 'dogeMode'

const HomePage = () => {
  const dogeMode = useSelector(selectors.featureFlags.create(dogeModeFeatureName))
  useEffect(() => {
    if (Math.random() < 0.001) {
      exodus.featureFlags.enable(dogeModeFeatureName)
    }
  }, [dogeMode])

  return dogeMode?.isOn ? <DogeMode /> : <NormalMode />
}
```

### Gradual rollout

With `supportedOverrides.rollout`, set `rollout` in remote config to an integer from `0` to `100`:

```json
{ "features": { "dogeMode": { "enabled": true, "rollout": 10 } } }
```

Each user gets a bucket from `0` to `99`: `sha256(featureName + ":" + telemetryId)`, first 4 bytes, mod 100. The flag is on when the bucket is less than `rollout`. Thus:

- A user stays in the same cohort when you increase `rollout`, and on all devices with the same seed.
- Each flag has an independent cohort.
- Renaming the flag gives new cohorts.
- An invalid `rollout` value turns the flag off.
- The flag keeps its local default until the wallet is unlocked, because `telemetryId` comes from the seed.

Rollout requires the `analyticsUserIdAtom` dependency (from `@exodus/analytics`).

### Usage examples without `@exodus/headless`

See the [examples](https://github.com/ExodusOSS/hydra/tree/master/features/feature-flags/module/__tests__/examples/) folder

## Components

### remoteConfigFeatureFlagAtoms

An atom collection `{ [featureName]: atom }`, where each atom emits the current remote-config value for that feature flag:

```js
{
  isOn: Boolean,
  unavailableStatus: ?String
}
```

### featureFlagAtoms

An atom collection `{ [featureName]: atom }`, where each atom emits the current status of its feature flag:

```js
{
  isOn: Boolean,
  unavailableStatus: ?String
}
```

### featureFlagsAtom

An atom that emits the current status of all feature flags as an object map:

```js
{
  [featureName]: {
    isOn: Boolean,
    unavailableStatus: ?String
  }
}
```

### featureFlags

Module that overrides local values for feature flags based on `remoteConfig` and `geolocation`. It writes values to atoms in `featureFlagAtoms`, but it might be easier to observe the aggregate feature flags atom `featureFlagsAtom`.
