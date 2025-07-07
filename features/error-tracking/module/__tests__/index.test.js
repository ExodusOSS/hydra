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
    })

    await expect(
      module.track({
        error: 'not an error',
        context: {},
        namespace: 'test',
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
  })

  await errorTracking.track({
    error: new Error('message1'),
    context: {},
    namespace: 'test',
  })

  await new Promise(setImmediate)
  expect(trackRemoteError).toHaveBeenCalledWith({ error: new Error('message1') })
})
