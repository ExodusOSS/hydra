# Exodus analytics

A base class encapsulating analytics integration.

## API Reference

| Property name             | Description                                                                                                                                                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| setAnonymousId            | Use this to set a temporary id, mostly used to track onboarding events                                                                                                                                                                                                          |
| setUserId                 | Use this to set the permanent user id, i.e. the seed derived id fetched from `analyticsUserIdAtom`                                                                                                                                                                              |
| flush                     | Use this to send persisted events to segment. Events that are `track`ed before `setPermanentUserId` is set will need to be flushed                                                                                                                                              |
| getAnonymousId            | Gets the anonymousId associated with the tracker. This is a UUID until `setPermanentUserId` is called with the `userId`                                                                                                                                                         |
| track                     | Use this method to send events to segment. If `setPermanentUserId` has not been called, you must call `track({ force: true })`. To throttle tracked events, use `track({ sample })` with sample ranging from 0-1, e.g. `track({ sample: 0.2 })` will pass through 20% of events |
| setUserTraits             | Used to set global "traits". Should be used sparingly -- on seed import or seed create for example.                                                                                                                                                                             |
| setDefaultEventProperties | Pretty much as it sounds. This sets persistent properties to be sent with every call to segment via `track`                                                                                                                                                                     |
| trackInstall              | sets a persisted event that can be sent with `flush` postinstall                                                                                                                                                                                                                |

## Usage

```js
import createStorage from '@exodus/storage-memory' // use the relevant platform-specific implementation
import analyticsDefinition from '@exodus/analytics/module'
import Tracker from '@exodus/segment-metrics'

const analytics = analyticsDefinition.factory({
  storage: storage.namespace('analytics'),
  shareActivityAtom,
  tracker: new Tracker({ writeKey: segmentApiKey }),
  // optional
  config: {
    installEventReportingUrl,
  },
  logger,
})

// before onboarding, while not mandatory, it's recommended to set an annonymousId so all
// events triggered until we have can derive real userId from seed can be linked together
const anonymousId = '5c8d5e90-1ddb-4bdc-b428-a03ac2358c7f'
analytics.setAnonymousId(anonymousId)

// if we want all events to have a common set of properties, we can require their presence
analytics.requireDefaultEventProperties(['build', 'version'])

// now we can start tracking events
// using force: true, you can send the event right away associated w/ the anonymousId
// force: false (default) will simply persist the event until you call .flush()
analytics.track({ event: 'PersistedEvent' })
analytics.track({ event: 'UrgentEvent', force: true })

// throw out ~70% of events
analytics.track({ event: 'ThrottledEvent', sample: 0.3 })

// after we have access to a seed, analyticsUserIdAtom should hold a unique userId value
const userId = await analyticsUserIdAtom.get()
analytics.setUserId(userId)

// link anonymousId and userId together, done only once on wallet creation or import
analytics.linkUserIds({ userId, annonymousId })

// flush persisted events. Note this won't flush them right away, will wait for required properties are present
analytics.flush()

// set default properties
analytics.setDefaultEventProperties({ build: 'genesis', version: '1.0.0' })

// events will flow directly to segment now with real user id
analytics.track({ event: 'OtherEvent' })
```

## Constructor Options

| Property name                   | Required | Description                                                                                                                                                                     |
| ------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tracker                         | yes      | A [Tracker](https://github.com/ExodusMovement/segment-metrics) class instance.                                                                                                  |
| storage                         | yes      | An object implementing the `Storage` interface (see below). Needed if you need to persist events (e.g. when a consumer application can be temporarily locked).                  |
| shareActivityAtom               | yes      | An [atom](https://github.com/ExodusMovement/exodus-hydra/tree/master/modules/atoms/src) returning a boolean value indicating if a consumer application is ready to send events. |
| config                          | no       | Static configuration options                                                                                                                                                    |
| config.installEventReportingUrl | no       | Url to which to post app install events                                                                                                                                         |

```ts
type SerializedEvent = 'string'

interface Storage {
  set: (key: string, events: SerializedEvent[]) => Promise<undefined>
  get: (key: string) => Promise<SerializedEvent[]>
}
```
