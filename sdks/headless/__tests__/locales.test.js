import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'

describe('locales', () => {
  let exodus

  let adapters

  let port

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    adapters = createAdapters()

    port = adapters.port

    const container = createExodus({ adapters, config })

    exodus = container.resolve()
  })

  test('should emit default currency value', async () => {
    const currencyEvent = expectEvent({ port, event: 'currency', payload: 'USD' })

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    await currencyEvent

    await exodus.application.stop()
  })

  test('should emit default language value', async () => {
    const languageEvent = expectEvent({ port, event: 'language', payload: 'en' })

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    await languageEvent

    await exodus.application.stop()
  })

  test('should change currency', async () => {
    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    const currencyEvent = expectEvent({ port, event: 'currency', payload: 'EUR' })

    await exodus.locale.setCurrency('EUR')

    await currencyEvent

    await exodus.application.stop()
  })

  test('should change language', async () => {
    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    const languageEvent = expectEvent({ port, event: 'language', payload: 'es' })

    await exodus.locale.setLanguage('es')

    await languageEvent

    await exodus.application.stop()
  })

  test('should store language in namespaced storage', async () => {
    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    await exodus.locale.setLanguage('es')

    const storedValue = await adapters.unsafeStorage.namespace('locale').get('language')

    expect(storedValue).toBe('es')

    await exodus.application.stop()
  })
})
