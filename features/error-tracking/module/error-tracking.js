import { isSafe } from '@exodus/safe-string'
import { captureStackTrace } from '@exodus/errors'

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

    if (error instanceof Error) {
      captureStackTrace(error)
    } else {
      return onError(new TypeError('error must be an instance of Error'))
    }

    logger.error(error)

    if (namespace !== undefined && typeof namespace !== 'string') {
      return onError(new TypeError('namespace must be a string'))
    }

    if (namespace !== undefined && !isSafe(namespace)) {
      return onError(
        new TypeError(
          'namespace must be a safe string. Use safeString`your-namespace` from @exodus/safe-string'
        )
      )
    }

    // TODO: eventually kill this and only track remote
    const localPromise = errorsAtom.set(({ errors }) => {
      return {
        errors: [{ namespace, error, context, time: Date.now() }, ...errors].slice(
          0,
          config.maxErrorsCount
        ),
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
