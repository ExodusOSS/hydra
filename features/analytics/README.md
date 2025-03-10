# @exodus/analytics

This Exodus SDK feature enables you to generate client-side analytics.

## Install

```sh
yarn add @exodus/analytics
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

```js
import createExodus from '@exodus/headless'
import analytics from '@exodus/analytics'

const container = createExodus({ adapters, config, debug })
container.use(
  analytics({
    segmentConfig: {
      apiKey: '<get this from segment.io>',
    },
  })
)
```

> [!IMPORTANT]
> Note: this feature defaults to using event payload validation using `@exodus/analytics-validation`. If you want to skip client-side validation (don't do it, it's dangerous), you can inject an alternative `validateAnalyticsEvent` dependency via the IOC.

### Play with it

1. Open the playground https://exodus-hydra.pages.dev/features/analytics
2. Run `await exodus.analytics.track({ event: 'AppSession' })` in the Dev Tools Console.

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK and the API interface in the [type declaration](./api/index.d.ts).

#### API Reference

| Property name                 | Description                                                                                                                                                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| track                         | Track an event. To track events before a wallet primary seed is known, e.g. during onboarding, call `track({ force: true, ...rest })`. To throttle tracked events, use `track({ sample })` with sample ranging from 0-1, e.g. `track({ sample: 0.2, ...rest })` will pass through 20% of events. |
| trackInstall                  | Track an install event.                                                                                                                                                                                                                                                                          |
| identify                      | Used to set global "traits". Should be used sparingly -- e.g. on seed import or seed create.                                                                                                                                                                                                     |
| setDefaultEventProperties     | Sets persistent properties to be sent with every `track` call.                                                                                                                                                                                                                                   |
| requireDefaultEventProperties | If called, will postpone `track` calls until the provided properties are set via `setDefaultEventProperties`.                                                                                                                                                                                    |
| getUserId                     | Gets the permanent user id, derived from the wallet's primary seed                                                                                                                                                                                                                               |

## UI

This feature doesn't provide any selectors, so use the API directly from the UI, as described above.
