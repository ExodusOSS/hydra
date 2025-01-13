import { remoteErrorTrackingDefinition } from '../../module/remote-error-tracking.js'
import { errorTrackingApiDefinition } from '../index.js'
import { errorTrackingDefinition } from '../../module/index.js'
import errorsAtomDefinition from '../../atoms/index.js'

const logger = { ...console, fatal: console.log }
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

const { factory: createErrorTracking } = errorTrackingDefinition
const { factory: createErrorTrackingApi } = errorTrackingApiDefinition
const { factory: createRemoteErrorTracking } = remoteErrorTrackingDefinition
const { factory: createErrorsAtom } = errorsAtomDefinition

describe('errorTrackingApi', () => {
  let errorsAtom
  let remoteErrorTracking
  let errorTracking

  beforeEach(() => {
    errorsAtom = createErrorsAtom()
    errorTracking = createErrorTracking({ errorsAtom, config: { maxErrorsCount: 3 } })
    remoteErrorTracking = createRemoteErrorTracking({
      fetch,
      config: sentryConfig,
    })
  })

  it('should setup correctly', async () => {
    const api = createErrorTrackingApi({
      errorTracking,
      logger,
    })

    expect(api.errors.track).toBeDefined()
  })

  it('should throw on track if namespace is not provided', async () => {
    const api = createErrorTrackingApi({
      errorTracking,
      logger,
    })

    await expect(
      api.errors.track({
        error: { message: 'message1' },
        context: {},
      })
    ).rejects.toThrow()
  })

  it('should have all errors based on their namespace', async () => {
    const api = createErrorTrackingApi({
      errorTracking,
      logger,
    })

    await api.errors.track({
      namespace: 'a',
      error: { message: 'message1' },
      context: {},
    })

    await api.errors.track({
      namespace: 'b',
      error: { message: 'message1' },
      context: {},
    })

    const { errors } = await errorsAtom.get()

    expect(errors).toBeDefined()
    expect(errors.length).toEqual(2)
    expect(errors[0].namespace).toEqual('b')
    expect(errors[1].namespace).toEqual('a')
  })

  it("should not exceed the errors it's holding more than maxErrorsCount as provided by the config", async () => {
    const errorTracking = createErrorTracking({ errorsAtom, config: { maxErrorsCount: 2 } })
    const api = createErrorTrackingApi({
      errorTracking,
      logger,
    })

    await api.errors.track({
      namespace: 'a',
      error: { message: 'message1' },
      context: {},
    })

    await api.errors.track({
      namespace: 'a',
      error: { message: 'message2' },
      context: {},
    })

    await api.errors.track({
      namespace: 'a',
      error: { message: 'message3' },
      context: {},
    })

    const { errors } = await errorsAtom.get()

    expect(errors.length).toEqual(2)
    expect(errors[0].error.message).toEqual('message3')
    expect(errors[1].error.message).toEqual('message2')
  })

  describe('remoteErrorTrackingApi tests', () => {
    it('remoteErrorTrackingApi should setup correctly', async () => {
      const api = createErrorTrackingApi({
        errorTracking,
        logger,
        remoteErrorTracking,
      })
      expect(api.errors.trackRemote).toBeDefined()
    })

    it('should setup correctly with no remoteErrorTracking module', async () => {
      const api = createErrorTrackingApi({
        errorTracking,
        logger,
      })
      expect(api.errors.trackRemote).toBeDefined()
      await expect(api.errors.trackRemote({ error: 'error message' })).resolves.not.toThrow()
    })
  })
})
