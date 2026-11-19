import { captureStackTrace } from '@exodus/errors'

const createUnsafeErrorTracking = ({
  unsafeRemoteErrorTrackingEnabledAtom,
  remoteErrorTracking,
  logger,
}) => {
  const track = async ({ error, context }) => {
    if (!remoteErrorTracking) return

    if (!(error instanceof Error)) {
      logger.error(new TypeError('error must be an instance of Error'))
      return
    }

    captureStackTrace(error)
    logger.error(error)
    const enabled = await unsafeRemoteErrorTrackingEnabledAtom.get()
    if (!enabled) return

    await remoteErrorTracking.track({ error, context })
  }

  return { track }
}

export const unsafeErrorTrackingDefinition = {
  // oxlint-disable-next-line @exodus/oxlint-plugin-hydra/dependency-ids
  id: 'unsafe__errorTracking',
  type: 'module',
  factory: createUnsafeErrorTracking,
  dependencies: ['unsafeRemoteErrorTrackingEnabledAtom', 'remoteErrorTracking?', 'logger'],
  public: true,
}
