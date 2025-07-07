import { SafeError } from '@exodus/errors'
import { z } from '@exodus/zod'

import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'

describe('reporting', () => {
  const passphrase = 'exceptionally-complex-secret'

  const setup = async (definitions) => {
    const adapters = createAdapters()
    const port = adapters.port
    const container = createExodus({
      adapters,
      config,
      port,
    })

    container.registerMultiple([...definitions, report('addressProvider', 'stubbed')])
    const exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    return exodus
  }

  const report = (namespace, value, schema = null) => ({
    definition: {
      id: `${namespace}Report`,
      type: 'report',
      factory: () => ({
        namespace,
        export: () => value,
        getSchema: () => schema,
      }),
      override: true,
      public: true,
    },
  })

  it('should extract report from a feature', async () => {
    const wayneCorpData = true
    const exodus = await setup([report('wayneCorp', Promise.resolve(wayneCorpData), z.boolean())])

    const result = await exodus.reporting.export()

    expect(result.wayneCorp).toEqual(wayneCorpData)

    await exodus.application.stop()
  })

  it('should merge reports into one place', async () => {
    const wayneCorpData = { count: 3 }
    const wayneFoundationData = [{ id: 1 }, { id: 2 }]
    const exodus = await setup([
      report('wayneCorp', wayneCorpData, z.object({ count: z.number() })),
      report(
        'wayneFoundation',
        Promise.resolve(wayneFoundationData),
        z.array(z.object({ id: z.number() }))
      ),
    ])

    const result = await exodus.reporting.export()

    expect(result.wayneCorp).toEqual(wayneCorpData)
    expect(result.wayneFoundation).toEqual(wayneFoundationData)

    await exodus.application.stop()
  })

  it('should report if an export fails', async () => {
    const wayneCorpData = { count: 3 }
    const wayneFoundationError = new Error('Hopefully this does not happen')
    const rejection = Promise.reject(wayneFoundationError)
    rejection.catch(() => {})

    const exodus = await setup([
      report('wayneCorp', Promise.resolve(wayneCorpData), z.object({ count: z.number() })),
      report('wayneFoundation', rejection, z.any()),
    ])

    const result = await exodus.reporting.export()

    expect(result.wayneCorp).toEqual(wayneCorpData)
    expect(result.wayneFoundation).toEqual({ error: expect.any(SafeError) })

    await exodus.application.stop()
  })

  it('should resolve after timeout for long-running export', async () => {
    const wayneManor = { count: 3 }
    const exodus = await setup([
      report('wayneManor', Promise.resolve(wayneManor), z.object({ count: z.number() })),
      report('wayneFoundation', new Promise(() => {}), z.any()),
    ])

    jest.useFakeTimers()

    let result
    exodus.reporting.export().then((report) => {
      result = report
    })

    await jest.advanceTimersByTimeAsync(config.reporting.exportTimeout - 1)

    expect(result).toBeUndefined()

    await jest.advanceTimersByTimeAsync(2)

    // multi-process might need some fake time for rpc
    if (process.env.MULTI_PROCESS) await jest.advanceTimersByTimeAsync(20)

    expect(result).toBeDefined()
    expect(result.wayneManor).toEqual(wayneManor)
    expect(result.wayneFoundation).toEqual({
      error: expect.any(SafeError),
    })

    jest.useRealTimers()
    await exodus.application.stop()
  })

  it('should export a report when locked', async () => {
    const wayneCorpData = { count: 3 }
    const exodus = await setup([
      report('wayneCorp', wayneCorpData, z.object({ count: z.number() })),
    ])

    await new Promise(setImmediate)

    await exodus.application.lock()

    const result = await exodus.reporting.export()
    expect(result.wayneCorp).toEqual(wayneCorpData)

    await exodus.application.stop()
  })

  it('should export reports in alphabetical order', async () => {
    const exodus = await setup([
      report(
        'z',
        { error: SafeError.from(new Error('zerror')) },
        z.object({ error: z.instanceof(SafeError) })
      ),
      report('a', { b: 2, a: 1 }, z.object({ a: z.number(), b: z.number() })),
    ])

    const result = await exodus.reporting.export()

    const topLevelKeys = Object.keys(result)
    expect(topLevelKeys[0]).toEqual('a')
    expect(topLevelKeys[topLevelKeys.length - 1]).toEqual('z')
    expect(Object.keys(result.a)).toEqual(['a', 'b'])
    expect(result.z).toEqual({ error: expect.any(SafeError) })

    await exodus.application.stop()
  })

  it('should return an error for a report if no schema is provided', async () => {
    const wayneCorpData = { count: 3 }

    const exodus = await setup([report('wayneCorp', wayneCorpData)])

    const result = await exodus.reporting.export()

    expect(result.wayneCorp).toEqual({
      error: SafeError.from(new Error(`Validation schema is missing for wayneCorp.`)),
    })

    await exodus.application.stop()
  })

  it('should convert regular Errors to SafeErrors in reports', async () => {
    const error = new Error('Some error.')
    const safeError = SafeError.from(new TypeError('Something went wrong.'))
    const wayneCorpData = { count: 3, error, safeError }

    const exodus = await setup([
      report(
        'wayneCorp',
        Promise.resolve(wayneCorpData),
        z.object({
          count: z.number(),
          error: z.instanceof(SafeError),
          safeError: z.instanceof(SafeError),
        })
      ),
    ])

    const result = await exodus.reporting.export()

    expect(result.wayneCorp).toEqual({ ...wayneCorpData, error: SafeError.from(error) })

    await exodus.application.stop()
  })

  it('reports with SafeErrors should be serializable with JSON.stringify', async () => {
    const safeError = SafeError.from(new TypeError('Something went wrong.'))
    const wayneCorpData = { count: 3, safeError }

    const exodus = await setup([
      report(
        'wayneCorp',
        Promise.resolve(wayneCorpData),
        z.object({
          count: z.number(),
          safeError: z.instanceof(SafeError),
        })
      ),
    ])

    const result = await exodus.reporting.export()

    expect(JSON.stringify(result.wayneCorp)).toEqual(JSON.stringify(wayneCorpData))

    await exodus.application.stop()
  })
})
