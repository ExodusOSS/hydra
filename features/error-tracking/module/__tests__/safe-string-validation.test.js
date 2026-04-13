import { safeString } from '@exodus/safe-string'

import { errorTrackingDefinition } from '../error-tracking.js'

describe('error-tracking SafeString validation', () => {
  let module
  let mockErrorsAtom
  let mockLogger

  beforeEach(() => {
    mockErrorsAtom = {
      set: jest.fn(),
    }

    mockLogger = {
      error: jest.fn(),
    }

    module = errorTrackingDefinition.factory({
      errorsAtom: mockErrorsAtom,
      remoteErrorTrackingEnabledAtom: null,
      remoteErrorTracking: null,
      config: { maxErrorsCount: 100 },
      logger: mockLogger,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should accept SafeString namespace', async () => {
    const error = new Error('test error')
    const namespace = safeString`balances`

    await module.track({ error, namespace })

    expect(mockLogger.error).toHaveBeenCalledWith(error)

    expect(mockErrorsAtom.set).toHaveBeenCalled()
  })

  test('should reject plain string namespace', async () => {
    const error = new Error('test error')
    const namespace = 'plain-string'

    await module.track({ error, namespace })

    expect(mockLogger.error).toHaveBeenCalledTimes(2)
    expect(mockLogger.error).toHaveBeenCalledWith(error)
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('namespace must be a safe string'),
      })
    )

    expect(mockErrorsAtom.set).not.toHaveBeenCalled()
  })

  test('should reject template literal with dynamic values', async () => {
    const error = new Error('test error')
    const dynamicValue = 'dynamic-value'
    const namespace = `error-${dynamicValue}`

    await module.track({ error, namespace })

    expect(mockLogger.error).toHaveBeenCalledTimes(2)
    expect(mockLogger.error).toHaveBeenCalledWith(error)
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('namespace must be a safe string'),
      })
    )

    expect(mockErrorsAtom.set).not.toHaveBeenCalled()
  })

  test('should throw when silent mode is disabled', async () => {
    const error = new Error('test error')
    const namespace = 'plain-string'

    await expect(module.track({ error, namespace, silent: false })).rejects.toThrow(
      'namespace must be a safe string'
    )
  })

  test('should reject null namespace', async () => {
    const error = new Error('test error')
    const namespace = null

    await module.track({ error, namespace })

    expect(mockLogger.error).toHaveBeenCalledTimes(2)
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('namespace must be a string'),
      })
    )

    expect(mockErrorsAtom.set).not.toHaveBeenCalled()
  })

  test('should reject non-string namespace types', async () => {
    const error = new Error('test error')
    const namespace = 123

    await module.track({ error, namespace })

    expect(mockLogger.error).toHaveBeenCalledTimes(2)
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('namespace must be a string'),
      })
    )

    expect(mockErrorsAtom.set).not.toHaveBeenCalled()
  })
})
