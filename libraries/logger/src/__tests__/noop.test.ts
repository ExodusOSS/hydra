import createNoopLogger from '../noop.js'

describe('noop logger', () => {
  const message =
    'It is our choices, Bruce, that show what we truly are, far more than our abilities.'

  const noop = () => {}

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(noop)
    jest.spyOn(console, 'info').mockImplementation(noop)
    jest.spyOn(console, 'error').mockImplementation(noop)
    jest.spyOn(console, 'warn').mockImplementation(noop)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test.each([['log'], ['info'], ['error'], ['warn']] as const)(
    'does not %s to console',
    (level) => {
      const logger = createNoopLogger()
      logger[level](message)

      expect(console[level]).not.toHaveBeenCalled()
    }
  )
})
