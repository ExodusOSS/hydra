import createSentryClient from '@exodus/sentry-client'
import createFetchival from '@exodus/fetch/create-fetchival'

export const remoteErrorTrackingDefinition = {
  id: 'remoteErrorTracking',
  type: 'module',
  factory: ({ config, fetch }) => {
    const fetchival = createFetchival({ fetch })
    return createSentryClient({
      config,
      fetchival,
    })
  },
  dependencies: ['config', 'fetch'],
}
