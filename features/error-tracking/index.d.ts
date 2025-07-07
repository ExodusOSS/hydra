import type errorTrackingApiDefinition from './api/index.js'
import type errorTrackingModuleDefinition from './module/index.js'
import type errorsAtomDefinition from './atoms/index.js'

declare const errorTracking: (config?: { maxErrorsCount?: number }) => {
  id: 'errorTracking'
  definitions: [
    { definition: typeof errorTrackingApiDefinition },
    { definition: typeof errorTrackingModuleDefinition },
    { definition: typeof errorsAtomDefinition },
  ]
}

export { ErrorTrackingModule } from './module/index.js'
export { ErrorsAtom } from './atoms/index.js'

export default errorTracking
