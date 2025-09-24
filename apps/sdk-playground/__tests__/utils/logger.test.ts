import createLogger from '@/utils/logger'

describe('createLogger', () => {
  test('creates logger with all log methods', () => {
    const logger = createLogger('test-namespace')

    expect(logger).toHaveProperty('trace')
    expect(logger).toHaveProperty('debug')
    expect(logger).toHaveProperty('log')
    expect(logger).toHaveProperty('info')
    expect(logger).toHaveProperty('warn')
    expect(logger).toHaveProperty('error')
  })

  test('logger methods are functions', () => {
    const logger = createLogger('test-namespace')

    expect(typeof logger.trace).toBe('function')
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.log).toBe('function')
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.error).toBe('function')
  })

  test('logger object has null prototype', () => {
    const logger = createLogger('test-namespace')
    expect(Object.getPrototypeOf(logger)).toBe(null)
  })

  test('logger methods accept multiple arguments', () => {
    const logger = createLogger('test-namespace')

    // Should not throw when called with various arguments
    expect(() => {
      logger.trace('message')
      logger.debug('message', { data: 'value' })
      logger.log('message', 123, true)
      logger.info('message', ['array'], { object: true })
      logger.warn('message', null)
      logger.error('message', new Error('test'))
    }).not.toThrow()
  })

  test('creates different loggers for different namespaces', () => {
    const logger1 = createLogger('namespace1')
    const logger2 = createLogger('namespace2')

    // They should be different objects
    expect(logger1).not.toBe(logger2)
  })
})
