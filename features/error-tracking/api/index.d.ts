export interface ErrorTrackingApi {
  /**
   * Track an error
   * @example
   * ```typescript
   * exodus.errors.track({
   *   namespace: 'balances',
   *   error: new Error('Encountered an issue when computing total balances'),
   *   context: {},
   * })
   * ```
   */
  track(params: { error: Error; namespace: string; context?: any }): Promise<void>
}

declare const errorTrackingApiDefinition: {
  id: 'errorTrackingApi'
  type: 'api'
  factory(): {
    errors: ErrorTrackingApi
  }
}

export default errorTrackingApiDefinition
