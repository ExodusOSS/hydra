import createSentryClient from '@exodus/sentry-client'

export const remoteErrorTrackingDefinition = {
  id: 'remoteErrorTracking',
  type: 'module',
  factory: ({ config }) => {
    const client = createSentryClient({
      config,
    })

    return {
      track: ({ error, context }) => client.captureError({ error, context }),
    }
  },
  dependencies: ['config'],
}
