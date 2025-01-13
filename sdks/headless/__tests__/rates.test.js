import createAdapters from './adapters'
import config from './config'
import createExodus from './exodus'
import expectEvent from './expect-event'

describe('rates', () => {
  let exodus

  let adapters

  let port

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    adapters = createAdapters()

    port = adapters.port

    const container = createExodus({ adapters, config })

    exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.create({ passphrase })
  })

  const priceSchema = {
    price: expect.any(Number),
    priceUSD: expect.any(Number),
    change24: expect.any(Number),
    volume24: expect.any(Number),
    cap: expect.any(Number),
    invalid: false,
  }

  test('should emit rates after unlock', async () => {
    const ratesEvent = expectEvent({ port, event: 'rates' })

    await exodus.application.unlock({ passphrase })
    await exodus.application.load()

    const rates = await ratesEvent

    expect(rates.USD).toMatchObject({ BTC: priceSchema, ETH: priceSchema })
  })

  test('should emit new rates after currency change', async () => {
    const firstRatesEvent = expectEvent({ port, event: 'rates' })
    const secondRatesEvent = expectEvent({ port, event: 'rates' })

    await exodus.application.unlock({ passphrase })
    await exodus.application.load()
    await firstRatesEvent
    await secondRatesEvent

    await exodus.locale.setCurrency('EUR')

    const rates = await expectEvent({ port, event: 'rates' })

    expect(rates.EUR).toMatchObject({ BTC: priceSchema, ETH: priceSchema })
  })
})
