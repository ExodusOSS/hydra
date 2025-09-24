import createAdapters from '../adapters/index.js'
import config from '../config.js'
import createExodus from '../exodus.js'
import expectEvent from '../expect-event.js'

describe('application port events', () => {
  let exodus
  let adapters
  let container
  let port

  beforeEach(async () => {
    adapters = createAdapters()
    container = createExodus({ adapters, config })
    port = adapters.port

    exodus = container.resolve()
  })

  test('should emit correct params to port when creating wallet without passphrase', async () => {
    await exodus.application.start()

    const createEventPromise = expectEvent({
      port,
      event: 'create',
      predicate: (payload) => {
        return (
          payload.walletExists === true &&
          payload.hasPassphraseSet === false &&
          payload.isLocked === true &&
          payload.isBackedUp === false &&
          payload.isRestoring === false &&
          typeof payload.seedId === 'string'
        )
      },
    })

    await exodus.application.create()
    await createEventPromise

    await exodus.application.stop()
  })

  test('should emit correct params to port when creating wallet with passphrase', async () => {
    await exodus.application.start()

    const createEventPromise = expectEvent({
      port,
      event: 'create',
      predicate: (payload) => {
        return (
          payload.walletExists === true &&
          payload.hasPassphraseSet === true &&
          payload.isLocked === true &&
          payload.isBackedUp === false &&
          payload.isRestoring === false &&
          typeof payload.seedId === 'string'
        )
      },
    })

    await exodus.application.create({ passphrase: 'test-passphrase' })

    await createEventPromise
    await exodus.application.stop()
  })

  test('should emit correct params when wallet is unlocked during creation', async () => {
    await exodus.application.start()

    const createEventPromise = expectEvent({
      port,
      event: 'create',
      predicate: (payload) => {
        return (
          payload.walletExists === true &&
          payload.hasPassphraseSet === true &&
          payload.isLocked === true &&
          payload.isBackedUp === false &&
          payload.isRestoring === false &&
          typeof payload.seedId === 'string'
        )
      },
    })

    const unlockEventPromise = expectEvent({
      port,
      event: 'unlock',
    })

    await exodus.application.create({ passphrase: 'test-passphrase' })
    await createEventPromise

    await exodus.application.unlock({ passphrase: 'test-passphrase' })
    await unlockEventPromise

    await exodus.application.stop()
  })

  test('should emit pre-load and load events with correct params', async () => {
    await exodus.application.start()

    const preLoadEventPromise = expectEvent({
      port,
      event: 'pre-load',
      payload: {
        walletExists: false,
        hasPassphraseSet: false,
        isLocked: true,
        isBackedUp: false,
        isRestoring: false,
      },
    })

    const loadEventPromise = expectEvent({
      port,
      event: 'load',
      payload: {
        walletExists: false,
        hasPassphraseSet: false,
        isLocked: true,
        isBackedUp: false,
        isRestoring: false,
      },
    })

    await exodus.application.load()
    await preLoadEventPromise
    await loadEventPromise

    await exodus.application.stop()
  })

  test('should emit lock and unlock events', async () => {
    await exodus.application.start()
    await exodus.application.create({ passphrase: 'test-passphrase' })

    const unlockEventPromise = expectEvent({
      port,
      event: 'unlock',
    })

    await exodus.application.unlock({ passphrase: 'test-passphrase' })
    await unlockEventPromise

    const lockEventPromise = expectEvent({
      port,
      event: 'lock',
    })

    await exodus.application.lock()
    await lockEventPromise

    await exodus.application.stop()
  })
})
