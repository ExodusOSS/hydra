import createLogger from '../logger.js'

describe('logger', () => {
  const message =
    'It is our choices, Harry, that show what we truly are, far more than our abilities.'
  const namespace = 'dumbledore'

  const noop = () => {}

  beforeEach(() => {
    jest.spyOn(global.console, 'log').mockImplementation(noop)
    jest.spyOn(global.console, 'info').mockImplementation(noop)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('print messages to console', () => {
    const logger = createLogger()
    logger.log(message)

    expect(console.log).toHaveBeenCalledWith(message)
  })

  test('log-level is equal console method', () => {
    const logger = createLogger()
    logger.info(message)

    expect(console.info).toHaveBeenCalledWith(message)
  })

  test('prefix a message', () => {
    const logger = createLogger(namespace)
    logger.log(message)

    expect(console.log).toHaveBeenCalledWith(`[${namespace}]`, message)
  })

  test('log-level is in prefix if not "log"', () => {
    const logger = createLogger(namespace)
    logger.info(message)

    expect(console.info).toHaveBeenCalledWith(`[${namespace}:info]`, message)
  })

  test('support for multiple args', () => {
    const character = 'Albus Dumbledore:'

    const logger = createLogger()
    logger.info(character, message)

    expect(console.info).toHaveBeenCalledWith(character, message)
  })

  test('has null prototype', () => {
    const logger = createLogger()
    expect(logger.toString).toBeUndefined()
  })
})
