import ConsoleTransport from '../console.js'

describe('ConsoleTransport', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'warn').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  test('forwards logs to console.log', () => {
    const transport = new ConsoleTransport()
    transport.log({ level: 'log', args: ['hello', 'world'] })

    expect(console.log).toHaveBeenCalledWith('hello', 'world')
  })

  test('forwards errors to console.error', () => {
    const transport = new ConsoleTransport()
    transport.log({ level: 'error', args: ['hello', 'world'] })

    expect(console.error).toHaveBeenCalledWith('hello', 'world')
  })

  test('logs errors as warnings if configured to', () => {
    const transport = new ConsoleTransport({ errorAsWarning: true })
    transport.log({ level: 'error', args: ['hello', 'world'] })

    expect(console.warn).toHaveBeenCalledWith('hello', 'world')
  })
})
