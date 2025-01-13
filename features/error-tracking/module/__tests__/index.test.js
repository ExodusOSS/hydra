import { errorTrackingDefinition } from '../error-tracking.js'
import { remoteErrorTrackingDefinition } from '../remote-error-tracking.js'
import errorsAtomDefinition from '../../atoms/index.js'

const { factory: createErrorsAtom } = errorsAtomDefinition

describe('errorTracking module tests', () => {
  it('should setup correctly', async () => {
    const errorsAtom = createErrorsAtom()

    const module = errorTrackingDefinition.factory({
      errorsAtom,
      config: { maxErrorsCount: 10 },
    })

    expect(module.track).toBeDefined()
  })

  it('should have all errors in the namespace object of the module', async () => {
    const errorsAtom = createErrorsAtom()

    const module = errorTrackingDefinition.factory({
      errorsAtom,
      config: { maxErrorsCount: 10 },
    })
    await module.track({
      error: { message: 'message1' },
      context: {},
      namespace: 'test',
    })
    await module.track({
      error: { message: 'message2' },
      context: {},
      namespace: 'test',
    })

    const { errors } = await errorsAtom.get()

    expect(errors).toBeDefined()
    expect(errors.length).toEqual(2)
    expect(errors[0].error.message).toEqual('message2')
  })

  it("should not exceed the errors it's holding more than maxErrorsCount as provided by the config", async () => {
    const errorsAtom = createErrorsAtom()

    const module = errorTrackingDefinition.factory({
      errorsAtom,
      config: { maxErrorsCount: 2 },
    })
    await module.track({
      error: { message: 'message1' },
      context: {},
      namespace: 'test',
    })
    await module.track({
      error: { message: 'message2' },
      context: {},
      namespace: 'test',
    })
    await module.track({
      error: { message: 'message3' },
      context: {},
      namespace: 'test',
    })

    const { errors } = await errorsAtom.get()

    expect(errors.length).toEqual(2)
    expect(errors[0].error.message).toEqual('message3')
    expect(errors[1].error.message).toEqual('message2')
  })
})

describe('remoteErrorTracking module tests', () => {
  const sentryConfig = {
    dsnUrl: 'https://...',
    publicKey: 'publicKey',
    projectId: 'projectId',
    environment: 'staging',
    os: 'testos',
    osVersion: '1.2.3',
    platform: 'testplatform',
    appName: 'testapp',
    appVersion: '4.5.6',
    buildId: 'some-build-id',
    jsEngine: 'jsc',
  }

  const fetch = jest.fn(async () => ({ status: 200, json: async () => {} }))

  it('should setup correctly', async () => {
    const module = remoteErrorTrackingDefinition.factory({
      fetch,
      config: sentryConfig,
    })

    expect(module.captureError).toBeDefined()
  })
})
