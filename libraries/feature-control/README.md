# feature-control

> Simplify feature availability handling

## Install

```
$ npm install @exodus/feature-control
```

## Usage

You can find more usage examples in [common scenarios](#common-scenarios).

```js
import { createFeatureControl } from '@exodus/feature-control'

const unicornFeatureControl = createFeatureControl(
  {
    enabled: true,
    ready: true,
    versionSemver: '1.0.0',
    geolocation: {
      countryCode: 'US',
      regionCode: 'TX',
    },
  },
  {
    enabledOverride: true,
    geolocation: true,
    shutdownSemver: true,
  }
)

unicornFeatureControl.getIsOn() //=> true
unicornFeatureControl.getIsOn({ enabled: false }) //=> false
unicornFeatureControl.getIsOn({ shutdownSemver: '1.x' }) //=> false
unicornFeatureControl.getIsOn({ shutdownSemver: '0.x' }) //=> true
unicornFeatureControl.getIsOn({ shutdownSemver: '1.x', enabled: true }) //=> false
unicornFeatureControl.getIsOn({ geolocation: { countries: 'all' } }) //=> true
unicornFeatureControl.getIsOn({
  geolocation: { countries: 'all', disabledCountries: { US: 'United States of America' } },
}) //=> false
unicornFeatureControl.getIsOn({ geolocation: { countries: { US: 'United States of America' } } }) //=> true
unicornFeatureControl.getIsOn({
  geolocation: { countries: 'all', disabledRegions: { US: { TX: 'Texas' } } },
}) //=> false

unicornFeatureControl.getUnavailableStatus({ error: 'Unicorn is disabled!', enabled: true }) //=> 'Unicorn is disabled!'
unicornFeatureControl.getUnavailableStatus({
  unavailableStatus: 'Unicorn is disabled!',
  enabled: false,
}) //=> 'Unicorn is disabled!'
```

This can also be used with selectors:

```js
import { useSelector } from 'react-redux'
import createFeatureControlSelectors from '@exodus/feature-control'

const unicornFeatureControl = createFeatureControlSelectors(
  {
    optsSelector: () => ({
      enabled: true,
      ready: true,
      versionSemver: '1.0.0',
      geolocation: {
        countryCode: 'US',
        regionCode: 'TX',
      },
    }),
    featureConfigSelector: (state) => state?.remoteConfig?.dapps?.unicorn,
  },
  {
    enabledOverride: true,
    geolocation: true,
    shutdownSemver: true,
  }
)

const Unicorn = () => {
  const isOn = useSelector(unicornFeatureControl.isOnSelector)
  const unAvailableStatus = useSelector(unicornFeatureControl.unavailableStatusSelector)

  return (
    <>
      <div>Unicorn is {isOn ? 'enabled' : 'disabled'}</div>
      {!isOn && <div>{unAvailableStatus}</div>}
    </>
  )
}

export default Unicorn
```

## API

### createFeatureControl(options, enabledModules?)

Create and [configure](#options) feature control instance. Returns an instance with the following methods:

#### .getIsOn(featureConfig)

Returns a `boolean` for whether the feature is available or not.

#### .getUnavailableStatus(featureConfig)

Returns an unavailable status to be shown when the feature is unavailable. Can be present even if the feature is available.

##### featureConfig

Type: `object`

Configure the enabled [modules](#enabledmodules).

###### enabled

Type: `boolean`

Override the default `enabled` option.

###### geolocation

Type: `object`

Enable or disable the feature in certain jurisdictions. Expects an object with the following signature:

```js
{
  countries: object<string, string> | string
  disabledCountries: object<string, string>
  disabledRegions: object<string, object<string, string>>
}
```

Enable the feature for certain countries by setting `countries` to an object with their country codes as keys and country names as values. Set it to `all` to enable it for all countries.

To disable the feature for certain countries, set `disabledCountries` to an object with their country codes as keys and country names as values.

E.g.

```js
const disabledCountries = {
  US: 'United States of America',
}
```

To disable the feature for certain regions, set `disabledRegions` to a per-country object with their region codes as keys and region names as values.

E.g.

```js
const disabledRegions = {
  US: {
    TX: 'Texas',
  },
}
```

###### shutdownSemver

Type: `string`

SemVer range for which the feature is disabled.

###### unavailableStatus

Type: `string`

Status to be returned when running `.getUnavailableStatus(featureConfig)`.

#### options

Type: `object`

##### enabled

Type: `boolean`\
Default: `true`

Toggle feature availability. Can be overriden when calling `.getIsOn(featureConfig)` and `.getUnavailableStatus(featureConfig)`.

##### ready

Type: `boolean`\
Default: `false`

Toggle feature readiness. If set to `false`, `.getIsOn(featureConfig)` will always return `false`. Mainly used in development when the feature is not ready to ship yet.

##### versionSemver

Type: `string`

SemVer version of the application. Can be used in conjunction with `shutdownSemver` to disable the feature for certain versions.

##### geolocation

Type: `object<string, string>`

Geolocation to use when enabling or disabling the application in certain jurisdictions. Expects an object with the following signature:

```js
{
  country: string
  countryCode: string
  region: string
  regionCode: string
}
```

#### enabledModules?

Type: `object<string, boolean>`

Specify which modules to use. Available modules sorted by priority in which the feature determines it's availability are:

- `enabledOverride`
- `geolocation`
- `shutdownSemver`

### createFeatureControlSelectors(options, enabledModules?)

Create and [configure](#options) feature control instance. Returns an instance with the following methods:

#### .isOnSelector(state)

Returns a `boolean` for whether the feature is available or not.

#### .unavailableStatusSelector(state)

Returns an unavailable status to be shown when the feature is unavailable. Can be present even if the feature is available.

#### options

Type: `object`

##### optsSelector

Type: `function`

Set [options](#options) on the feature control instance. Expects a selector `function` that takes a `state` and returns a [options](#options) object.

##### featureConfigSelector

Type: `function`

Set [feature config](#featureconfig) on the feature control instance. Expects a selector `function` that takes a `state` and returns a [feature config](#featureconfig) object.

#### enabledModules?

See [this](#enabledmodules).

## Common scenarios

### I'm developing a new feature that is not working and using it incorrectly might lose funds

The usage below can be used without impacting users in production and QA environments assuming the flag is set to `false` for those environments.

```js
createFeatureControl({
  enabled: true,
  ready: process.env.NEW_FEATURE_ENABLED,
})
```

### I'm developing a new feature that is not working, but doesn't risk losing funds or breaking the application

The usage below can be used without impacting users in the production environment. This allows QA and other users within the team to test the feature and follow the latest progress.

```js
createFeatureControl({
  enabled: true,
  ready: isDev || isGenesis || isEden,
})
```

### I'm developing a new feature that is working, but is not ready for production yet

The usage below can be used without impacting users in the production environment. This allows QA and other users within the team to test the feature before giving their final feedback.

```js
createFeatureControl({
  enabled: true,
  ready: isDev || isGenesis || isEden,
})
```

### I have developed a new feature that is ready for production and is expected to ship next the release

The usage below will make the feature available by default.

```js
createFeatureControl({
  enabled: true,
  ready: true,
})
```

### I have developed a new feature that is ready for production and is expected to ship the next release. But it cannot be enabled before a certain date

The feature can be toggled on at the expected date by using a remote config override for `enabled`. Once that date is passed we can switch `enabled` back to `true` in the client code.

```js
createFeatureControl({
  enabled: false,
  ready: true,
})
```

### I have a working feature shipped to production, but something is broken because the blockchain forked

Turn off the feature by setting `enabled` to `false` with a remote config override.

```js
createFeatureControl({
  enabled: false,
  ready: true,
})
```

You can also disable it using `shutdownSemver` that targets affected versions.

```js
const featureControl = createFeatureControl({
  enabled: true,
  ready: true,
  versionSemver: '1.0.0',
})

featureControl.getIsOn({ shutdownSemver: '1.x' })
//=> false
```

## Development

```
bun install
bun test
```
