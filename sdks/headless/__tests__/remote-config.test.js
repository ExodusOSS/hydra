import createAdapters from './adapters'
import config from './config'
import createExodus from './exodus'
import expectEvent from './expect-event'

describe('remoteConfig', () => {
  let container

  let adapters

  let port

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    adapters = createAdapters()
    port = adapters.port
    container = createExodus({ adapters, config })
  })

  test('should load remote config at start', async () => {
    const expectSync = expectEvent({ port, event: 'remoteConfig' })

    const exodus = container.resolve()

    await exodus.application.start()

    const config = await expectSync

    expect(typeof config).toBe('object')
  })

  test('should sync values again on unlock', async () => {
    const expectFirstSync = expectEvent({ port, event: 'remoteConfig' })

    const exodus = container.resolve()

    await exodus.application.start()
    await expectFirstSync

    await exodus.application.create({ passphrase })

    const expectSecondSync = expectEvent({ port, event: 'remoteConfig' })

    await exodus.application.unlock({ passphrase })

    const config = await expectSecondSync

    expect(typeof config).toBe('object')
  })

  test('should get all config once loaded', async () => {
    const exodus = container.resolve()

    await exodus.application.start()

    const config = await exodus.remoteConfig.getAll()

    expect(typeof config).toBe('object')
  })

  test('should get config by key once loaded', async () => {
    const exodus = container.resolve()

    await exodus.application.start()

    const config = await exodus.remoteConfig.get('dapps')

    expect(typeof config).toBe('object')
  })

  test('should get all data on reporting', async () => {
    const exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })

    const report = await exodus.reporting.export()

    expect(report.remoteConfig).toBeDefined()
    expect(report.remoteConfig.error).toBeDefined()
    expect(report.remoteConfig.loaded).toBeDefined()
  })
})
