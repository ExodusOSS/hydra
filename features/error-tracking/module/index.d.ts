import type { ErrorsAtom } from '../atoms/index.js'
import type { SafeContextType } from '@exodus/errors'

export interface ErrorTrackingModule {
  /**
   * Track an error
   * @example
   * ```typescript
   * errorTracking.track({
   *   namespace: 'balances',
   *   error: new Error('Encountered an issue when computing total balances'),
   *   context: {},
   * })
   * ```
   */
  track(params: { error: Error; namespace: string; context?: SafeContextType }): Promise<void>
}

declare const errorTrackingModuleDefinition: {
  id: 'errorTracking'
  type: 'module'
  factory({ config, errorsAtom }: { config: { maxErrorsCount: number }; errorsAtom: ErrorsAtom }): {
    errors: ErrorTrackingModule
  }
}

export default errorTrackingModuleDefinition
