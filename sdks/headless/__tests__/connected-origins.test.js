import connectedOrigins from '@exodus/connected-origins'

import createAdapters from './adapters/index.js'
import baseConfig from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'

const config = {
  ...baseConfig,
}

const origin = {
  origin: 'exodus.com',
  name: 'Exodus',
  icon: 'exodus_icon',
  connectedAssetName: 'ethereum',
  trusted: true,
}

describe('connectedOrigins', () => {
  let exodus
  let adapters
  let port

  const passphrase = 'my-password-manager-generated-this'

  const getExpectConnectedOrigin = (port) =>
    expectEvent({
      port,
      event: 'connectedOrigins',
    })

  beforeEach(async () => {
    adapters = createAdapters()

    port = adapters.port

    const container = createExodus({ adapters, config })

    container.use(connectedOrigins())

    exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })
  })

  afterEach(() => exodus.application.stop())

  test('add connected origin', async () => {
    const expectedConnectedOrigin = getExpectConnectedOrigin(port)

    await exodus.connectedOrigins.add(origin)
    await expect(expectedConnectedOrigin).resolves.toHaveLength(1)
  })

  test('untrust connected origin', async () => {
    await exodus.connectedOrigins.add(origin)

    const expectedConnectedOrigin = getExpectConnectedOrigin(port)

    await exodus.connectedOrigins.untrust({ origin: origin.origin })

    await expect(expectedConnectedOrigin).resolves.toHaveLength(0)
  })

  test('is trusted connected origin', async () => {
    await exodus.connectedOrigins.add(origin)
    await expect(exodus.connectedOrigins.isTrusted({ origin: origin.origin })).resolves.toBe(true)
  })

  test('is auto approve connected origin', async () => {
    await exodus.connectedOrigins.add(origin)
    await expect(exodus.connectedOrigins.isAutoApprove({ origin: origin.origin })).resolves.toBe(
      false
    )
  })

  test('set favorite connected origin', async () => {
    await exodus.connectedOrigins.add({ ...origin, favorite: false })

    const expectedConnectedOrigin = getExpectConnectedOrigin(port)

    await exodus.connectedOrigins.setFavorite({ origin: origin.origin, value: true })

    const connectedOrigins = await expectedConnectedOrigin

    expect(connectedOrigins[0]).toMatchObject({ favorite: true })
  })

  test('set auto approve connected origin', async () => {
    await exodus.connectedOrigins.add({ ...origin, autoApprove: false })

    const expectedConnectedOrigin = getExpectConnectedOrigin(port)

    await exodus.connectedOrigins.setAutoApprove({ origin: origin.origin, value: true })

    const connectedOrigins = await expectedConnectedOrigin

    expect(connectedOrigins[0]).toMatchObject({ autoApprove: true })
  })

  test('connect and disconnect connect origin', async () => {
    await exodus.connectedOrigins.add(origin)

    const expectedConnectedOrigin = getExpectConnectedOrigin(port)

    await exodus.connectedOrigins.connect({ id: 1, origin: origin.origin })

    const connectedOrigins = await expectedConnectedOrigin

    expect(connectedOrigins[0].activeConnections).toHaveLength(1)

    const newExpectedConnectedOrigin = getExpectConnectedOrigin(port)

    await exodus.connectedOrigins.disconnect({ id: 1, origin: origin.origin })

    const newConnectedOrigin = await newExpectedConnectedOrigin

    expect(newConnectedOrigin[0].activeConnections).toHaveLength(0)
  })
})
