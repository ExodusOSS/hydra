import apyRates from '@exodus/apy-rates'

import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'

describe('apy-rates', () => {
  let exodus

  let adapters

  let port

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    adapters = createAdapters()

    port = adapters.port

    const container = createExodus({ adapters, config })

    container.use(apyRates())

    exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
  })

  afterEach(() => exodus.application.stop())

  test('should load apy rates data when enabled', async () => {
    const expectApyRates = expectEvent({ port, event: 'apyRates' })

    await exodus.application.unlock({ passphrase })

    const payload = await expectApyRates

    expect(typeof payload.algorand).toBe('number')
    expect(typeof payload.solana).toBe('number')
  })
})
