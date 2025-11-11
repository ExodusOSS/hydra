const MODULE_ID = 'errorTracking'

const createErrorTracking = ({
  errorsAtom,
  remoteErrorTrackingEnabledAtom,
  remoteErrorTracking,
  config,
  logger,
}) => {
  const track = async ({ error, context, namespace, silent = true, timeout = 5000 }) => {
    const onError = (err) => {
      logger.error(err)
      if (!silent) throw err
    }

    logger.error(error)

    if (namespace !== undefined && typeof namespace !== 'string') {
      return onError(new Error('namespace must be a string'))
    }

    if (!(error instanceof Error)) {
      return onError(new TypeError('error must be an instance of Error'))
    }

    // TODO: eventually kill this and only track remote
    const localPromise = errorsAtom.set(({ errors }) => {
      return {
        // this array can be big. not sure about prefering spread operator here
        // concat function seems like a better option
        errors: [{ namespace, error, context, time: Date.now() }]
          // eslint-disable-next-line unicorn/prefer-spread
          .concat(errors)
          .slice(0, config.maxErrorsCount),
      }
    })

    const remotePromise = remoteErrorTracking
      ? remoteErrorTrackingEnabledAtom
          .get()
          .then((enabled) => enabled && remoteErrorTracking.track({ error, context }))
      : Promise.resolve()

    let timeoutId
    const timeoutPromise = new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('track call timed out'))
      }, timeout)
    })

    try {
      await Promise.race([
        //
        Promise.all([localPromise, remotePromise]),
        timeoutPromise,
      ])
    } catch (err) {
      onError(err)
    } finally {
      clearTimeout(timeoutId)
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
