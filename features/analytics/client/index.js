import Tracker from '@exodus/segment-metrics'
import validateEventDefault from '@exodus/analytics-validation'

const DEFAULT_API_BASE_URL = 'https://api.segment.io/v1/'

const analyticsTrackerDefinition = {
  id: 'analyticsTracker',
  // TODO: change to 'client'
  type: 'module',
  factory: ({ config, getBuildMetadata, logger, validateAnalyticsEvent = validateEventDefault }) =>
    new Tracker({
      writeKey: config.segment.apiKey,
      apiBaseUrl: config.segment.apiBaseUrl || DEFAULT_API_BASE_URL,
      validateEvent: validateAnalyticsEvent,
      logger,
      getBuildMetadata,
    }),
  dependencies: ['config', 'getBuildMetadata', 'logger', 'validateAnalyticsEvent?'],
  public: true,
}

export default analyticsTrackerDefinition
