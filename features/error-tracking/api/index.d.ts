export interface ErrorTrackingApi {
  /**
   * Track an error
   * @example
   * ```typescript
   * exodus.errors.track({
   *   namespace: 'balances',
   *   error: 'Encountered an issue when computing total balances',
   *   context: {},
   * })
   * ```
   */
  track(params: { error: string | Error; namespace: string; context: any }): Promise<void>
  /**
   * Track an error remotely using sentry if available
   * @example
   * ```typescript
   * exodus.errors.trackRemote({
   *   error: 'Encountered an issue when computing total balances',
   * })
   * ```
   */
  trackRemote(params: { error: string }): Promise<void>
}

declare const errorTrackingApiDefinition: {
  id: 'errorTrackingApi'
  type: 'api'
  factory(): {
    errors: ErrorTrackingApi
  }
}

export default errorTrackingApiDefinition
