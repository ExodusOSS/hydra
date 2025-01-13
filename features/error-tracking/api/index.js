const createTrackRemote = ({ remoteErrorTracking, logger }) => {
  if (!remoteErrorTracking) {
    return async ({ error }) => {
      logger.debug('remote error tracking is disabled', error)
    }
  }

  return async ({ error }) => {
    try {
      await remoteErrorTracking.captureError({
        error,
      })
    } catch (err) {
      logger.error('failed to remote track error', err)
    }
  }
}

export const errorTrackingApiDefinition = {
  id: 'errorTrackingApi',
  type: 'api',
  factory: ({ errorTracking, logger, remoteErrorTracking }) => {
    const trackRemote = createTrackRemote({ remoteErrorTracking, logger })

    return {
      errors: {
        track: errorTracking.track,
        trackRemote,
      },
    }
  },
  dependencies: ['logger', 'remoteErrorTracking?', 'errorTracking'],
}
