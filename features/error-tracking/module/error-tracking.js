const MODULE_ID = 'errorTracking'

const createErrorTracking = ({
  errorsAtom,
  remoteErrorTrackingEnabledAtom,
  remoteErrorTracking,
  config,
  logger,
}) => {
  const track = async ({ error, context, namespace }) => {
    if (namespace !== undefined && typeof namespace !== 'string') {
      throw new Error('namespace must be a string')
    }

    if (!(error instanceof Error)) {
      throw new TypeError('error must be an instance of Error')
    }

    // TODO: figure out what to do with `context`

    // eventually kill this and only track remote
    await errorsAtom.set(({ errors }) => {
      return {
        // this array can be big. not sure about prefering spread operator here
        // concat function seems like a better option
        errors: [{ namespace, error, context, time: Date.now() }]
          // eslint-disable-next-line unicorn/prefer-spread
          .concat(errors)
          .slice(0, config.maxErrorsCount),
      }
    })

    if (remoteErrorTracking) {
      remoteErrorTrackingEnabledAtom
        .get()
        .then((enabled) => enabled && remoteErrorTracking.track({ error }))
        .catch((err) => {
          logger.error('failed to upload error', error, err)
        })
    }
  }

  return { track }
}

export const errorTrackingDefinition = {
  id: MODULE_ID,
  type: 'module',
  factory: createErrorTracking,
  dependencies: [
    'config',
    'errorsAtom',
    'remoteErrorTrackingEnabledAtom',
    'remoteErrorTracking?',
    'logger',
  ],
  public: true,
}
