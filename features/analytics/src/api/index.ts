import type { Atom } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'

import type { Analytics } from '../module/index.js'

type FactoryParams = {
  analytics: Analytics
  shareActivityAtom: Atom<boolean | undefined>
  analyticsUserIdAtom: Pick<Atom<string>, 'get'>
}

export interface AnalyticsApi {
  analytics: {
    /**
     * Tracks a generic event or activity.
     * @example
     * ```typescript
     * await exodus.analytics.track({ force: true, event: 'testEvent', properties: { test: true } })
     * ```
     */
    track: Analytics['track']

    /**
     * Tracks the installation of the application.
     * @example
     * ```typescript
     * await exodus.analytics.trackInstall()
     * ```
     */
    trackInstall: Analytics['trackInstall']

    /**
     * Sets persistent user traits (e.g., on seed import/create).
     * @example
     * ```typescript
     * await exodus.analytics.setUserTraits({ force: true, traits: { hasBackup: true } })
     * ```
     */
    setUserTraits: Analytics['setUserTraits']

    /**
     * Identifies the user by their traits.
     * @deprecated Use `setUserTraits` instead.
     */
    identify: Analytics['setUserTraits']

    /**
     * Sets default properties for analytics events.
     * @deprecated Use `setDefaultEventProperties` instead.
     */
    setDefaultProperties: Analytics['setDefaultProperties']

    /**
     * Sets default properties to be included with every tracked event.
     * @example
     * ```typescript
     * exodus.analytics.setDefaultEventProperties({ isAwesome: true })
     * ```
     */
    setDefaultEventProperties: Analytics['setDefaultEventProperties']

    /**
     * Requires that the provided properties are present in analytics events.
     * @example
     * ```typescript
     * exodus.analytics.requireDefaultEventProperties(['isAwesome', 'otherProperty'])
     * ```
     */
    requireDefaultEventProperties: Analytics['requireDefaultEventProperties']

    /**
     * Retrieves the user ID.
     */
    getUserId: () => Promise<string | undefined>

    /**
     * Sets whether to track user activities.
     */
    setTrackActivities: (track: boolean) => Promise<void>
  }
}

const createAnalyticsApi = ({
  analytics,
  shareActivityAtom,
  analyticsUserIdAtom,
}: FactoryParams): AnalyticsApi => ({
  analytics: {
    track: analytics.track,
    trackInstall: analytics.trackInstall,
    setUserTraits: analytics.setUserTraits,
    identify: analytics.setUserTraits, // deprecated
    setDefaultProperties: analytics.setDefaultProperties, // deprecated
    setDefaultEventProperties: analytics.setDefaultEventProperties,
    requireDefaultEventProperties: analytics.requireDefaultEventProperties,
    getUserId: async () => analyticsUserIdAtom.get(),
    setTrackActivities: (value) => shareActivityAtom.set(value),
  },
})

const analyticsApiDefinition = {
  id: 'analyticsApi',
  type: 'api',
  factory: createAnalyticsApi,
  dependencies: ['analytics', 'shareActivityAtom', 'analyticsUserIdAtom'],
} as const satisfies Definition

export default analyticsApiDefinition
