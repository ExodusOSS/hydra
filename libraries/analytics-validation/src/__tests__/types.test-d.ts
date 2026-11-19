import type {
  AnalyticsEventName,
  AnalyticsEventPayload,
  AnalyticsEventProperties,
} from '../index.js'

// Helpers to check types and don't make eslint complain about unused variables.
declare const expectName: (name: AnalyticsEventName) => void
declare const expectProps: <E extends AnalyticsEventName>(
  props: AnalyticsEventProperties<E>
) => void
declare const expectPayload: <E extends string>(payload: AnalyticsEventPayload<E>) => void

expectName('PerformanceAppStartup')

expectProps<'PerformanceAppStartup'>({ startTime: 1, destination: 'home' })

expectPayload({
  event: 'PerformanceAppStartup',
  properties: { startTime: 1, destination: 'home' },
})

expectPayload({
  event: 'PerformanceAppStartup',
  properties: {
    startTime: 1,
    destination: 'home',
    stage: 'main',
    isInstantStartup: true,
    appBuild: 'production',
  },
})

expectPayload({
  event: 'BrandNewEventNotInSchema',
  properties: { time: Date.now() },
})

expectPayload({
  event: 'DAppConnectionRequest',
  properties: { approved: true, dappDomain: 'example.com' },
})

// prettier-ignore
// @ts-expect-error wrong property type
expectPayload({ event: 'PerformanceAppStartup', properties: { startTime: 'not-a-number', destination: 'home' } })

// prettier-ignore
// @ts-expect-error unknown property on known event
expectPayload({ event: 'PerformanceAppStartup', properties: { startTime: 1, destination: 'home', bogus: 1 } })

// prettier-ignore
// @ts-expect-error missing required property on known event
expectPayload({ event: 'PerformanceAppStartup', properties: { destination: 'home' } })

// prettier-ignore
// @ts-expect-error snake_case rejected on known event
expectPayload({ event: 'PerformanceAppStartup', properties: { start_time: 1, destination: 'home' } })

// prettier-ignore
// @ts-expect-error unknown event with non-common property
expectPayload({ event: 'BrandNewEventNotInSchema', properties: { someEventSpecificField: 1 } })

// prettier-ignore
// @ts-expect-error invalid enum value
expectPayload({ event: 'DAppConnectionRequest', properties: { connectionOrigin: 'totally-bogus' } })

// Optional `properties` when the known event has no required fields
expectPayload({ event: 'AppSession' })
expectPayload({ event: 'PayAppSession' })

// Optional `properties` for unknown event names (Mobile DX)
expectPayload({ event: 'BrandNewEventNotInSchema' })

// prettier-ignore
// @ts-expect-error required `properties` when known event has required fields
expectPayload({ event: 'PerformanceAppStartup' })
