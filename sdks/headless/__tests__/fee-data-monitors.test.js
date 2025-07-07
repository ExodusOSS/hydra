import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'

describe('feeMonitors', () => {
  const passphrase = 'my-password-manager-generated-this'
  let exodus

  afterEach(() => exodus.wallet.stop())

  test('should load fees', async () => {
    const adapters = createAdapters()
    const port = adapters.port

    const container = createExodus({ adapters, config })
    exodus = container.resolve()

    const feeDataPromise = expectEvent({
      port,
      event: 'feeData',
      predicate: (payload) => !!payload.bitcoin,
    })

    await exodus.application.start()
    await exodus.application.load()

    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    const feesUpdatePayload = await feeDataPromise
    expect(feesUpdatePayload).toMatchObject({ bitcoin: expect.any(Object) })
  })
})
