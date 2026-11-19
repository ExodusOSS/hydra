import { unsafeRemoteErrorTrackingEnabledAtomDefinition } from '../../atoms/index.js'
import { unsafeErrorTrackingDefinition } from '../unsafe-error-tracking.js'

const createModule = ({ remoteErrorTracking } = {}) => {
  const unsafeRemoteErrorTrackingEnabledAtom =
    unsafeRemoteErrorTrackingEnabledAtomDefinition.factory()
  const logger = { error: jest.fn() }

  const module = unsafeErrorTrackingDefinition.factory({
    unsafeRemoteErrorTrackingEnabledAtom,
    remoteErrorTracking,
    logger,
  })

  return { module, unsafeRemoteErrorTrackingEnabledAtom, logger }
}

test('track respects atom state changes at call time', async () => {
  const trackRemote = jest.fn().mockResolvedValue()
  const { module, unsafeRemoteErrorTrackingEnabledAtom } = createModule({
    remoteErrorTracking: { track: trackRemote },
  })

  await unsafeRemoteErrorTrackingEnabledAtom.set(true)
  await module.track({ error: new Error('first'), context: {} })
  expect(trackRemote).toHaveBeenCalledTimes(1)

  await unsafeRemoteErrorTrackingEnabledAtom.set(false)
  await module.track({ error: new Error('second'), context: {} })
  expect(trackRemote).toHaveBeenCalledTimes(1)

  await unsafeRemoteErrorTrackingEnabledAtom.set(true)
  await module.track({ error: new Error('third'), context: {} })
  expect(trackRemote).toHaveBeenCalledTimes(2)
})

test('track logs and returns early when error is not an Error instance', async () => {
  const trackRemote = jest.fn()
  const { module, unsafeRemoteErrorTrackingEnabledAtom, logger } = createModule({
    remoteErrorTracking: { track: trackRemote },
  })

  await unsafeRemoteErrorTrackingEnabledAtom.set(true)
  await module.track({ error: 'not-an-error', context: {} })

  expect(logger.error).toHaveBeenCalledWith(expect.any(TypeError))
  expect(trackRemote).not.toHaveBeenCalled()
})

test('track returns early when remoteErrorTracking is not provided', async () => {
  const trackRemote = jest.fn().mockResolvedValue()
  const { module, unsafeRemoteErrorTrackingEnabledAtom } = createModule({
    remoteErrorTracking: undefined,
  })

  await unsafeRemoteErrorTrackingEnabledAtom.set(true)

  await module.track({ error: new Error('boom'), context: {} })

  expect(trackRemote).not.toHaveBeenCalled()
})
