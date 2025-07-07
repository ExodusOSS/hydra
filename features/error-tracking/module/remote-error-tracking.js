import createSentryClient from '@exodus/sentry-client'
import createFetchival from '@exodus/fetch/create-fetchival'

export const remoteErrorTrackingDefinition = {
  id: 'remoteErrorTracking',
  type: 'module',
  factory: ({ config, fetch }) => {
    const fetchival = createFetchival({ fetch })
    const client = createSentryClient({
      config,
      fetchival,
    })

    return {
      track: ({ error }) => client.captureError({ error }),
    }
  },
  dependencies: ['config', 'fetch'],
}
