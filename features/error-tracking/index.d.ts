import type errorTrackingApiDefinition from './api/index.js'

declare const errorTracking: () => {
  id: 'errorTracking'
  definitions: [{ definition: typeof errorTrackingApiDefinition }]
}

export default errorTracking
