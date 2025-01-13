import createAdapters from './adapters'
import config from './config'
import createExodus from './exodus'
import expectEvent from './expect-event'

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
  })

  test('should emit default language value', async () => {
    const languageEvent = expectEvent({ port, event: 'language', payload: 'en' })

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    await languageEvent
  })

  test('should change currency', async () => {
    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    const currencyEvent = expectEvent({ port, event: 'currency', payload: 'EUR' })

    await exodus.locale.setCurrency('EUR')

    await currencyEvent
  })

  test('should change language', async () => {
    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    const languageEvent = expectEvent({ port, event: 'language', payload: 'es' })

    await exodus.locale.setLanguage('es')

    await languageEvent
  })

  test('should store language in namespaced storage', async () => {
    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    await exodus.locale.setLanguage('es')

    const storedValue = await adapters.unsafeStorage.namespace('locale').get('language')

    expect(storedValue).toBe('es')
  })
})
