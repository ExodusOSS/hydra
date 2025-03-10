import { SafeError } from '@exodus/errors'

import createAdapters from './adapters'
import config from './config'
import createExodus from './exodus'

describe('reporting', () => {
  const passphrase = 'exceptionally-complex-secret'
  const exportTimeout = 10_000

  const setup = async (definitions) => {
    const adapters = createAdapters()
    const port = adapters.port
    const container = createExodus({ adapters, config: { ...config, exportTimeout }, port })

    container.registerMultiple([...definitions, report('addressProvider', 'stubbed')])
    const exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    return exodus
  }

  const report = (namespace, value) => ({
    definition: {
      id: `${namespace}Report`,
      type: 'report',
      factory: () => ({
        namespace,
        export: () => value,
      }),
      override: true,
      public: true,
    },
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should extract report from a feature', async () => {
    const wayneCorpData = true
    const exodus = await setup([report('wayneCorp', Promise.resolve(wayneCorpData))])

    const result = await exodus.reporting.export()

    expect(result.wayneCorp).toEqual(wayneCorpData)
  })

  it('should merge reports into one place', async () => {
    const wayneCorpData = { count: 3 }
    const wayneFoundationData = [{ id: 1 }, { id: 2 }]
    const exodus = await setup([
      report('wayneCorp', wayneCorpData),
      report('wayneFoundation', Promise.resolve(wayneFoundationData)),
    ])

    const result = await exodus.reporting.export()

    expect(result.wayneCorp).toEqual(wayneCorpData)
    expect(result.wayneFoundation).toEqual(wayneFoundationData)
  })

  it('should report if an export fails', async () => {
    const wayneCorpData = { count: 3 }
    const wayneFoundationError = new Error('Hopefully this does not happen')
    const rejection = Promise.reject(wayneFoundationError)
    rejection.catch(() => {})

    const exodus = await setup([
      report('wayneCorp', Promise.resolve(wayneCorpData)),
      report('wayneFoundation', rejection),
    ])

    const result = await exodus.reporting.export()

    expect(result.wayneCorp).toEqual(wayneCorpData)
    expect(result.wayneFoundation).toEqual({ error: expect.any(SafeError) })
  })

  it('should resolve after timeout for long-running export', async () => {
    const wayneManor = { count: 3 }
    const exodus = await setup([
      report('wayneManor', Promise.resolve(wayneManor)),
      report('wayneFoundation', new Promise(() => {})),
    ])

    jest.useFakeTimers()

    let result
    exodus.reporting.export().then((report) => {
      result = report
    })

    await jest.advanceTimersByTimeAsync(exportTimeout - 1)

    expect(result).toBeUndefined()

    await jest.advanceTimersByTimeAsync(2)

    expect(result).toBeDefined()
    expect(result.wayneManor).toEqual(wayneManor)
    expect(result.wayneFoundation).toEqual({
      error: expect.any(SafeError),
    })
  })

  it('should reject export when locked', async () => {
    const exodus = await setup([
      report('wayneCorp', {
        count: 3,
      }),
    ])

    await new Promise(setImmediate)

    await exodus.application.lock()

    await expect(exodus.reporting.export()).rejects.toEqual(
      new Error('Unable to export when locked')
    )
  })
})
