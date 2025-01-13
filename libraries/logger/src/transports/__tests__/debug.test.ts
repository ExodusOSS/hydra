import DebugTransport from '../debug.js'

describe('DebugTransport', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2021-01-01').getTime())
    jest.resetAllMocks()
    jest.spyOn(process.stderr, 'write')
  })

  test('forwards logs to process.stderr in node', () => {
    const transport = new DebugTransport()
    transport.log({ level: 'log', namespace: 'gotham:city', args: ['the dark knight rises'] })

    expect(process.stderr.write).toHaveBeenCalledWith(
      expect.stringMatching(/gotham:city:log the dark knight rises/) // this also contains colors and a +0ms suffix
    )
  })

  test('forwards errors to process.stderr in node', () => {
    const transport = new DebugTransport()
    transport.log({ level: 'error', namespace: 'gotham:city', args: ['the dark knight rises'] })

    expect(process.stderr.write).toHaveBeenCalledWith(
      expect.stringMatching(/gotham:city:error the dark knight rises/)
    )
  })

  test('swallows errors in non-whitelisted namespace', () => {
    const transport = new DebugTransport()
    transport.log({ level: 'error', namespace: 'arkham:asylum', args: ['joker escapes'] })

    expect(process.stderr.write).not.toHaveBeenCalled()
  })
})
