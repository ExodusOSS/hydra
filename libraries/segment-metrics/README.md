# segment-metrics

This library allows any app to send events to Segment for metrics analysis.

## Formatting

Per convention of the Telemetry team, events should generally follow the following formatting structure:

```js
const event = {
  event: 'EventInPascalCase',
  anonymousId: SOME_DERIVED_ID_FOR_THE_USER,
  properties: {
    property_keys_in_snake_case: 'property-values-in-kebab-case',

    // Generally try not to nest properties
    nested_properties: {
      are_generally: 'discouraged',
    },
  },
}
```

This library enforces the following:

1. `event` names will automatically be `PascalCased`
2. Shallow `properties` keys will automatically be `snake_cased`

## Usage

```js
import Tracker from '@exodus/segment-metrics'

const segment = new Tracker({
  writeKey: SEGMENT_WRITE_KEY,
  apiBaseUrl: 'https://api.segment.io/v1/',
  fetch: globalThis.fetch,
  // optional
  validateEvent: ({ event, properties }) => {
    if (event === 'abc' && properties.someProperty === '123') {
      throw new Error('absolutely not, 123 is private user data')
    }
  },
  logger: console,
})

// optionally add/remove default properties that will get sent with every event
segment.setDefaultProperty('anonymousId', SOME_DERIVED_ID_FOR_THE_USER)
segment.setDefaultProperties({}) // pass in an object of all default properties to set
segment.removeDefaultProperty('anonymousId')
segment.removeAllDefaultProperties()

// if you don't know the user's ID yet, e.g. during onboarding, set a temporary anonymousId
segment.setAnonymousId(id) // defaults to UUIDv4 if not set
// when you know the user's ID, link it to the anonymousId to merge their events
segment.identify({
  userId,
  traits: { telemetryId: userId },
})

// set other persistent user traits for the user
segment.identify({
  traits: {
    dorkLevel: 'DavidCabal',
  },
})

/*
  note that by leveraging the default properties above, the only things actually needed below
  could be narrowed down to the "event" key (and potentially "properties" key if you're sending extra metadata)
*/
segment.track({
  event: 'EventName',
  properties: {
    whateverItIs: 'that-you-want-to-track',
    // add as many fields as you like here
  },
  sensitive: false, // OPTIONAL setting to true will override the anonymousId with a random uuid for each event sent
  timestamp: Date, // OPTIONAL passing event Date value. useful to track events retroactively
  exactTimestamp: true, // OPTIONAL. By default, event timestamps are truncted to the beginning of the UTC day
})
```
