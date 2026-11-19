import Tracker from '@exodus/segment-metrics'
import validateEventDefault from '@exodus/analytics-validation'
import type { Logger } from '@exodus/atoms'
import type { Definition } from '@exodus/dependency-types'

type Params = {
  config: {
    segment: {
      apiKey: string
      apiBaseUrl: string
      preserveEventNames?: boolean
      preservePropertyKeys?: boolean
    }
  }
  getBuildMetadata: () => Promise<Record<string, unknown>>
  logger: Logger
  validateAnalyticsEvent?: (event: unknown) => void
}

const createAnalyticsTracker = ({
  config,
  getBuildMetadata,
  logger,
  validateAnalyticsEvent = validateEventDefault,
}: Params) =>
  new Tracker({
    writeKey: config.segment.apiKey,
    apiBaseUrl: config.segment.apiBaseUrl,
    validateEvent: validateAnalyticsEvent,
    logger,
    getBuildMetadata,
    preserveEventNames: config.segment.preserveEventNames,
    preservePropertyKeys: config.segment.preservePropertyKeys,
  })

const analyticsTrackerDefinition = {
  id: 'analyticsTracker',
  // TODO: change to 'client'
  type: 'module',
  factory: createAnalyticsTracker,
  dependencies: ['config', 'getBuildMetadata', 'logger', 'validateAnalyticsEvent?'],
  public: true,
} as const satisfies Definition

export default analyticsTrackerDefinition
