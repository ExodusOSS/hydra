import Emitter from '@exodus/wild-emitter'

import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'

const passphrase = 'my-password-manager-generated-this'

jest.setTimeout(60_000)

describe('restore-complete', () => {
  let port
  let exodus
  let adapters
  let container

  beforeEach(async () => {
    adapters = createAdapters()

    port = adapters.port
    container = createExodus({ adapters, config })

    exodus = container.resolve()

    await expect(exodus.wallet.exists()).resolves.toBe(false)
  })

  test('should restore a wallet after start without restart', async () => {
    const mnemonic = 'menu memory fury language physical wonder dog valid smart edge decrease worth'
    const listener = jest.fn()
    port.subscribe((e) => {
      if (e.type !== 'restoringAssets') return
      listener(e.payload)
    })

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.import({ passphrase, mnemonic })
    await exodus.application.unlock({ passphrase })

    expect(listener).toBeCalledTimes(2)
    expect(listener.mock.calls[0][0]).toEqual({})
    expect(listener.mock.calls[1][0]).toEqual({ ethereum: true, bitcoin: true })

    const expectBitcoinRestored = expectEvent({
      port,
      event: 'restoringAssets',
      payload: {
        ethereum: true,
      },
    })

    const expectEthereumRestored = expectEvent({
      port,
      event: 'restoringAssets',
      payload: {},
    })

    const { txLogMonitors } = container.getAll()
    txLogMonitors.emit('after-tick-multiple-wallet-accounts', {
      assetName: 'bitcoin',
    })

    await expectBitcoinRestored

    const expectRestoreComplete = expectEvent({
      port,
      event: 'restore-completed',
    })

    txLogMonitors.emit('after-tick-multiple-wallet-accounts', {
      assetName: 'ethereum',
    })
    await expectEthereumRestored

    await expectRestoreComplete
  })

  test('should restore a wallet after restart', async () => {
    const mnemonic = 'menu memory fury language physical wonder dog valid smart edge decrease worth'

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })
    await exodus.application.import({ passphrase, mnemonic })

    // Simulate new wallet after restart
    const newPort = new Emitter()
    const listener = jest.fn()

    newPort.subscribe((e) => {
      if (e.type !== 'restoringAssets') return
      listener(e.payload)
    })

    const newContainer = createExodus({ adapters: { ...adapters, port: newPort }, config })
    const newExodus = newContainer.resolve()
    await newExodus.application.start()
    await newExodus.application.load()
    await expect(newExodus.wallet.exists()).resolves.toBe(true)
    await newExodus.application.unlock({ passphrase })

    expect(listener).toBeCalledTimes(1)
    expect(listener.mock.calls[0][0]).toEqual({ bitcoin: true, ethereum: true })

    const expectBitcoinRestored = expectEvent({
      port: newPort,
      event: 'restoringAssets',
      payload: {
        ethereum: true,
      },
    })

    const expectEthereumRestored = expectEvent({
      port: newPort,
      event: 'restoringAssets',
      payload: {},
    })

    const { txLogMonitors } = newContainer.getAll()
    txLogMonitors.emit('after-tick-multiple-wallet-accounts', {
      assetName: 'bitcoin',
    })

    await expectBitcoinRestored

    const expectRestoreComplete = expectEvent({
      port: newPort,
      event: 'restore-completed',
    })

    txLogMonitors.emit('after-tick-multiple-wallet-accounts', {
      assetName: 'ethereum',
    })
    await expectEthereumRestored

    await expectRestoreComplete
  })

  test('should continue restore after user restart in the middle of process', async () => {
    const mnemonic = 'menu memory fury language physical wonder dog valid smart edge decrease worth'

    await exodus.application.start()
    await exodus.application.load()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })
    await exodus.application.import({ passphrase, mnemonic })

    const restartWallet = async () => {
      const newPort = new Emitter()
      const listener = jest.fn()
      newPort.subscribe((e) => {
        if (e.type !== 'restoringAssets') return
        listener(e.payload)
      })
      const newContainer = createExodus({ adapters: { ...adapters, port: newPort }, config })
      const newExodus = newContainer.resolve()
      await newExodus.application.start()
      await newExodus.application.load()
      await expect(newExodus.wallet.exists()).resolves.toBe(true)
      await newExodus.application.unlock({ passphrase })

      return {
        listener,
        newPort,
        newContainer,
      }
    }

    const { listener: firstRestartListener } = await restartWallet()

    expect(firstRestartListener).toBeCalledTimes(1)
    expect(firstRestartListener.mock.calls[0][0]).toEqual({ bitcoin: true, ethereum: true })

    const { newPort, newContainer, listener: secondRestartListener } = await restartWallet()

    expect(secondRestartListener).toBeCalledTimes(1)
    expect(secondRestartListener.mock.calls[0][0]).toEqual({ bitcoin: true, ethereum: true })

    const expectBitcoinRestored = expectEvent({
      port: newPort,
      event: 'restoringAssets',
      payload: {
        ethereum: true,
      },
    })

    const expectEthereumRestored = expectEvent({
      port: newPort,
      event: 'restoringAssets',
      payload: {},
    })

    const { txLogMonitors } = newContainer.getAll()
    txLogMonitors.emit('after-tick-multiple-wallet-accounts', {
      assetName: 'bitcoin',
    })

    await expectBitcoinRestored

    const expectRestoreComplete = expectEvent({
      port: newPort,
      event: 'restore-completed',
    })

    txLogMonitors.emit('after-tick-multiple-wallet-accounts', {
      assetName: 'ethereum',
    })
    await expectEthereumRestored

    await expectRestoreComplete
    // make sure we don't set restoring assets after restore complete
    expect(secondRestartListener.mock.calls).toEqual([
      [
        {
          bitcoin: true,
          ethereum: true,
        },
      ],
      [
        {
          ethereum: true,
        },
      ],
      [{}],
    ])
  })
})
