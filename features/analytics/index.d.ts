import type analyticsApiDefinition from './api/index.js'

export type AnalyticsApiConfig = {
  installEventReportingUrl?: string
}

declare const analytics: (config?: AnalyticsApiConfig) => {
  id: 'analytics'
  definitions: [{ definition: typeof analyticsApiDefinition }]
}

export type { AnalticsTrackPayload, AnalyticsIdentifyPayload, Analytics } from './api/index.js'

export default analytics
