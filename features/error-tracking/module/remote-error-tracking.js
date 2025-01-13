import createSentryClient from '@exodus/sentry-client'
import stackTraceParser from '@exodus/sentry-client/src/stack-trace-parsers/default.js'
import createFetchival from '@exodus/fetch/create-fetchival'

export const remoteErrorTrackingDefinition = {
  id: 'remoteErrorTracking',
  type: 'module',
  factory: ({ config, fetch, defaultStackTraceParser }) => {
    const fetchival = createFetchival({ fetch })
    return createSentryClient({
      config,
      fetchival,
      defaultStackTraceParser: defaultStackTraceParser || stackTraceParser,
    })
  },
  dependencies: ['config', 'fetch', 'defaultStackTraceParser?'],
}
