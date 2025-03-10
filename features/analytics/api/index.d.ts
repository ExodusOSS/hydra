/**
 * The payload for analytics event tracking.
 * @remarks
 * The payload can be extended with extra properties on demand.
 */
export type AnalyticsTrackPayload = {
  /**
   *  Whether to force the tracking regardless of conditions, defaults to `false`.
   */
  force?: boolean

  /*
   * A sample rate for tracking events (between 0 and 1). Defaults to 1.
   */
  sample?: number

  /**
   * The event name.
   */
  event: string

  /**
   * Properties of the event.
   */
  properties?: Record<string, any>

  [key: string]: any
}

/**
 * The payload for identifying the user.
 * @remarks
 * The payload can be extended with extra properties on demand.
 */
export type AnalyticsIdentifyPayload = {
  /**
   *  Whether to force the identifying regardless of conditions, defaults to `false`.
   */
  force?: boolean

  /**
   * The current user id.
   */
  userId?: string

  /**
   * The anonymous user id.
   */
  anonymousId: string

  [key: string]: any
}

/**
 * API interface representing the analytics API methods and properties.
 * Each method interacts with the internal analytics system to track user data, events, and activities.
 */
export type Analytics = {
  /**
   * Tracks a generic event or activity.
   * @remarks
   * This method allows the tracking of user interactions or system events.
   * @param payload - The analytics event to track, along with metadata
   * @returns A promise that resolves when the event is tracked.
   * @example
   * ```typescript
   * await exodus.analytics.track({ force: true, event: 'testEvent', properties: { test: true } })
   * ```
   */
  track: (payload: AnalyticsTrackPayload) => Promise<void>

  /**
   * Tracks the installation of the application.
   * @remarks
   * This method should be used to track when the application is installed by the user.
   * @returns A promise that resolves when the install event is tracked.
   * @example
   * ```typescript
   * await exodus.analytics.trackInstall()
   * ```
   */
  trackInstall: () => Promise<void>

  /**
   * Identifies the user by their traits.
   * @deprecated
   * @returns A promise that resolves when the identification is complete.
   * @example
   * ```typescript
   * await exodus.analytics.trackInstall()
   * ```
   */
  identify: () => Promise<void>

  /**
   * Sets default properties for analytics events.
   * @deprecated Use `setDefaultEventProperties` instead for setting event properties.
   * @param payload The default properties
   * @example
   * ```typescript
   * exodus.analytics.setDefaultProperties({ isAwesome: true })
   * ```
   */
  setDefaultProperties: (payload: Record<string, any>) => void

  /**
   * Sets default properties for analytics events.
   * @remarks
   * This method allows setting properties that will be included with every tracked event.
   * @param payload The default properties
   * @example
   * ```typescript
   * exodus.analytics.setDefaultEventProperties({ isAwesome: true })
   * ```
   */
  setDefaultEventProperties: (payload: Record<string, any>) => void

  /**
   * Requires that the provided properties are present in analytics events.
   * @param payload The properties to require
   * @example
   * ```typescript
   * exodus.analytics.requireDefaultEventProperties(['isAwesome', 'otherProperty'])
   * ```
   */
  requireDefaultEventProperties: (payload: string[]) => void

  /**
   * Retrieves the user ID.
   * @returns A promise that resolves to the user ID or `undefined` if not set.
   * @example
   * ```typescript
   * const userId = await exodus.analytics.getUserId()
   * ```
   */
  getUserId: () => Promise<string>

  /**
   * Sets the tracking status for user activities.
   * @param value - A boolean value indicating whether to enable or disable activity tracking.
   * @example
   * ```typescript
   * await exodus.analytics.setTrackActivities(true)
   * ```
   */
  setTrackActivities: (track: boolean) => Promise<void>
}

declare const analyticsApiDefinition: {
  id: 'analytics'
  type: 'api'
  factory(): {
    analytics: Analytics
  }
}

export default analyticsApiDefinition
