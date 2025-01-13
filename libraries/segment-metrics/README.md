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
const segmentMetrics = require('@exodus/segment-metrics')

// initialize with the Segment write key
const segment = new segmentMetrics(SEGMENT_WRITE_KEY)

// optionally add/remove default properties that will get sent with every event
segment.setDefaultProperty('anonymousId', SOME_DERIVED_ID_FOR_THE_USER)
segment.setDefaultProperties({}) // pass in an object of all default properties to set
segment.removeDefaultProperty('anonymousId')
segment.removeAllDefaultProperties()

/*
  note that by leveraging the default properties above, the only things actually needed below
  could be narrowed down to the "event" key (and potentially "properties" key if you're sending extra metadata)
*/
segment.track({
  event: 'EventName',
  anonymousId: SOME_DERIVED_ID_FOR_THE_USER, // uuid generated if not specified
  properties: {
    whateverItIs: 'that-you-want-to-track',
    // add as many fields as you like here
  },
  sensitive: false, // OPTIONAL setting to true will override the anonymousId with a random uuid for each event sent
  timestamp: Date, // OPTIONAL passing event Date value. useful to track events retroactively
  exactTimestamp: true, // OPTIONAL setting to false will set event timestamp to beginning of the day
})

// attach traits to an anonymousId via identify
segment.identify({
  traits: {
    dorkLevel: 'DavidCabal',
  },
})
```
