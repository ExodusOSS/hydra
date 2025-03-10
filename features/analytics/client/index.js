import Tracker from '@exodus/segment-metrics'
import validateEventDefault from '@exodus/analytics-validation'

const analyticsTrackerDefinition = {
  id: 'analyticsTracker',
  // TODO: change to 'client'
  type: 'module',
  factory: ({ config, getBuildMetadata, logger, validateAnalyticsEvent = validateEventDefault }) =>
    new Tracker({
      writeKey: config.segment.apiKey,
      apiBaseUrl: config.segment.apiBaseUrl,
      validateEvent: validateAnalyticsEvent,
      logger,
      getBuildMetadata,
    }),
  dependencies: ['config', 'getBuildMetadata', 'logger', 'validateAnalyticsEvent?'],
  public: true,
}

export default analyticsTrackerDefinition
