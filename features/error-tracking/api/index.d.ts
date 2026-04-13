import type { SafeString } from '@exodus/safe-string'

export interface ErrorTrackingApi {
  /**
   * Track an error
   * @example
   * ```typescript
   * import { safeString } from '@exodus/safe-string'
   *
   * exodus.errors.track({
   *   namespace: safeString`balances`,
   *   error: new Error('Encountered an issue when computing total balances'),
   *   context: {},
   * })
   * ```
   */
  track(params: { error: Error; namespace: SafeString; context?: any }): Promise<void>
}

declare const errorTrackingApiDefinition: {
  id: 'errorTrackingApi'
  type: 'api'
  factory(): {
    errors: ErrorTrackingApi
  }
}

export default errorTrackingApiDefinition
