import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'

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

    await exodus.application.stop()
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

    await exodus.application.stop()
  })

  test('should get all config once loaded', async () => {
    const exodus = container.resolve()

    await exodus.application.start()

    const config = await exodus.remoteConfig.getAll()

    expect(typeof config).toBe('object')

    await exodus.application.stop()
  })

  test('should get config by key once loaded', async () => {
    const exodus = container.resolve()

    await exodus.application.start()

    const config = await exodus.remoteConfig.get('dapps')

    expect(typeof config).toBe('object')

    await exodus.application.stop()
  })

  test('should successfully export report', async () => {
    const exodus = container.resolve()
    const reportNode = container.get('remoteConfigReport')

    await exodus.application.start()

    await expect(exodus.reporting.export()).resolves.toMatchObject({
      remoteConfig: await reportNode.export(),
    })

    await exodus.application.stop()
  })
})
