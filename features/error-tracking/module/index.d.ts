import type { ErrorsAtom } from '../atoms/index.js'
import type { SafeContextType } from '@exodus/errors'
import type { SafeString } from '@exodus/safe-string'

export interface ErrorTrackingModule {
  /**
   * Track an error
   * @example
   * ```typescript
   * import { safeString } from '@exodus/safe-string'
   *
   * errorTracking.track({
   *   namespace: safeString`balances`,
   *   error: new Error('Encountered an issue when computing total balances'),
   *   context: {},
   * })
   * ```
   */
  track(params: { error: Error; namespace: SafeString; context?: SafeContextType }): Promise<void>
}

declare const errorTrackingModuleDefinition: {
  id: 'errorTracking'
  type: 'module'
  factory({ config, errorsAtom }: { config: { maxErrorsCount: number }; errorsAtom: ErrorsAtom }): {
    errors: ErrorTrackingModule
  }
}

export default errorTrackingModuleDefinition
