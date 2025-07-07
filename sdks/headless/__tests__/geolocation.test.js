import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'

describe('geolocation', () => {
  const passphrase = 'my-password-manager-generated-this'

  test('should emit geolocation', async () => {
    const adapters = createAdapters()
    const port = adapters.port

    const container = createExodus({ adapters, config })
    const exodus = container.resolve()

    const event = expectEvent({ port, event: 'geolocation' })

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    const payload = await event

    expect(payload).toMatchObject({
      countryCode: expect.any(String),
      countryName: expect.any(String),
      ip: expect.any(String),
      isAllowed: expect.any(Boolean),
      isProxy: expect.any(Boolean),
      regionCode: expect.any(String),
      regionName: expect.any(String),
      timezoneName: expect.any(String),
    })

    await exodus.application.stop()
  })
})
