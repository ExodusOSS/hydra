import { createInMemoryAtom } from '@exodus/atoms'

import { errorsAtomDefinition } from '../../atoms/index.js'
import { errorTrackingDefinition } from '../error-tracking.js'

const { factory: createErrorsAtom } = errorsAtomDefinition

describe('errorTracking module tests', () => {
  it('should setup correctly', async () => {
    const errorsAtom = createErrorsAtom()

    const module = errorTrackingDefinition.factory({
      errorsAtom,
      remoteErrorTrackingEnabledAtom: createInMemoryAtom({ defaultValue: false }),
      remoteErrorTracking: {
        track: jest.fn(),
      },
      config: { maxErrorsCount: 10 },
      logger: console,
    })

    expect(module.track).toBeDefined()
  })

  it('should have all errors in the namespace object of the module', async () => {
    const errorsAtom = createErrorsAtom()

    const trackRemoteError = jest.fn()
    const module = errorTrackingDefinition.factory({
      errorsAtom,
      remoteErrorTrackingEnabledAtom: createInMemoryAtom({ defaultValue: false }),
      remoteErrorTracking: { track: trackRemoteError },
      config: { maxErrorsCount: 10 },
      logger: console,
    })

    await module.track({
      error: new Error('message1'),
      context: {},
      namespace: 'test',
    })

    await module.track({
      error: new Error('message2'),
      context: {},
      namespace: 'test',
    })

    const { errors } = await errorsAtom.get()

    expect(errors).toBeDefined()
    expect(errors.length).toEqual(2)
    expect(errors[0].error.message).toEqual('message2')
    expect(trackRemoteError).not.toHaveBeenCalled()
  })

  it("should not exceed the errors it's holding more than maxErrorsCount as provided by the config", async () => {
    const errorsAtom = createErrorsAtom()

    const trackRemoteError = jest.fn()
    const module = errorTrackingDefinition.factory({
      errorsAtom,
      remoteErrorTrackingEnabledAtom: createInMemoryAtom({ defaultValue: false }),
      remoteErrorTracking: { track: trackRemoteError },
      config: { maxErrorsCount: 2 },
      logger: console,
    })

    await module.track({
      error: new Error('message1'),
      context: {},
      namespace: 'test',
    })
    await module.track({
      error: new Error('message2'),
      context: {},
      namespace: 'test',
    })
    await module.track({
      error: new Error('message3'),
      context: {},
      namespace: 'test',
    })

    const { errors } = await errorsAtom.get()

    expect(errors.length).toEqual(2)
    expect(errors[0].error.message).toEqual('message3')
    expect(errors[1].error.message).toEqual('message2')
    expect(trackRemoteError).not.toHaveBeenCalled()
  })

  it('should throw an error if the error is not an instance of Error', async () => {
    const errorsAtom = createErrorsAtom()

    const module = errorTrackingDefinition.factory({
      errorsAtom,
      config: { maxErrorsCount: 2 },
      logger: console,
    })

    await expect(
      module.track({
        error: 'not an error',
        context: {},
        namespace: 'test',
        silent: false,
      })
    ).rejects.toThrow('error must be an instance of Error')
  })
})

test('remote error tracking', async () => {
  const errorsAtom = createErrorsAtom()

  const trackRemoteError = jest.fn()
  const errorTracking = errorTrackingDefinition.factory({
    errorsAtom,
    remoteErrorTrackingEnabledAtom: createInMemoryAtom({ defaultValue: true }),
    remoteErrorTracking: { track: trackRemoteError },
    config: { maxErrorsCount: 10 },
    logger: console,
  })

  await errorTracking.track({
    error: new Error('message1'),
    context: {},
    namespace: 'test',
  })

  await new Promise(setImmediate)
  expect(trackRemoteError).toHaveBeenCalledWith({ error: new Error('message1') })
})

test('error propagation: local error', async () => {
  const errorsAtom = createErrorsAtom()
  errorsAtom.set = () => Promise.reject(new Error('local failed'))

  const trackRemoteError = jest.fn()
  const errorTracking = errorTrackingDefinition.factory({
    errorsAtom,
    remoteErrorTrackingEnabledAtom: createInMemoryAtom({ defaultValue: true }),
    remoteErrorTracking: { track: trackRemoteError },
    config: { maxErrorsCount: 10 },
    logger: console,
  })

  await expect(
    errorTracking.track({
      error: new Error('message1'),
      context: {},
      namespace: 'test',
    })
  ).resolves.not.toThrow()

  await expect(
    errorTracking.track({
      error: new Error('message1'),
      context: {},
      namespace: 'test',
      silent: false,
    })
  ).rejects.toThrow('local failed')
})

test('error propagation: remote error', async () => {
  const errorsAtom = createErrorsAtom()
  const trackRemoteError = jest.fn().mockRejectedValue(new Error('remote failed'))

  const errorTracking = errorTrackingDefinition.factory({
    errorsAtom,
    remoteErrorTrackingEnabledAtom: createInMemoryAtom({ defaultValue: true }),
    remoteErrorTracking: { track: trackRemoteError },
    config: { maxErrorsCount: 10 },
    logger: console,
  })

  await expect(
    errorTracking.track({
      error: new Error('message1'),
      context: {},
      namespace: 'test',
    })
  ).resolves.not.toThrow()

  await expect(
    errorTracking.track({
      error: new Error('message1'),
      context: {},
      namespace: 'test',
      silent: false,
    })
  ).rejects.toThrow('remote failed')
})

test('error propagation: timeout', async () => {
  jest.useFakeTimers()

  const errorsAtom = createErrorsAtom()
  const trackRemoteError = jest.fn().mockImplementation(
    () =>
      new Promise((resolve) => {
        // hang
      })
  )

  const errorTracking = errorTrackingDefinition.factory({
    errorsAtom,
    remoteErrorTrackingEnabledAtom: createInMemoryAtom({ defaultValue: true }),
    remoteErrorTracking: { track: trackRemoteError },
    config: { maxErrorsCount: 10 },
    logger: console,
  })

  const promise1 = errorTracking.track({
    error: new Error('message1'),
    context: {},
    namespace: 'test',
  })

  jest.advanceTimersByTime(5000)
  await expect(promise1).resolves.not.toThrow()

  const promise2 = errorTracking.track({
    error: new Error('message1'),
    context: {},
    namespace: 'test',
    silent: false,
  })

  jest.advanceTimersByTime(5000)
  await expect(promise2).rejects.toThrow('track call timed out')

  jest.useRealTimers()
})
