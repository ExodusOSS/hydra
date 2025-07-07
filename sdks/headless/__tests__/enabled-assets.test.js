import Emitter from '@exodus/wild-emitter'

import createAdapters from './adapters/index.js'
import baseConfig from './config.js'
import createExodus from './exodus.js'
import expectEvent from './expect-event.js'

const config = {
  ...baseConfig,
  enabledAssets: { defaultEnabledAssetsList: ['ethereum'] },
}

describe('enabledAssets', () => {
  let exodus
  let adapters
  let port
  let enabledAssetsAtom
  let enabledAndDisabledAssetsAtom
  let reportNode

  const passphrase = 'my-password-manager-generated-this'

  const setup = async ({ createWallet = true } = {}) => {
    adapters = createAdapters()

    port = adapters.port

    const container = createExodus({ adapters, config })

    exodus = container.resolve()
    ;({ enabledAssetsAtom, enabledAndDisabledAssetsAtom } = container.getByType('atom'))
    reportNode = container.getByType('report').enabledAssetsReport

    await exodus.application.start()
    if (createWallet) {
      await exodus.application.create({ passphrase })
      await exodus.application.unlock({ passphrase })

      await expect(enabledAndDisabledAssetsAtom.get()).resolves.toEqual({
        disabled: { ethereum: false },
      })

      await expect(enabledAssetsAtom.get()).resolves.toEqual({ ethereum: true })
    }
  }

  beforeEach(setup)
  afterEach(() => exodus.application.stop())

  test('enable assets', async () => {
    await exodus.assets.enable(['bitcoin'])
    await expect(enabledAndDisabledAssetsAtom.get()).resolves.toEqual({
      disabled: { bitcoin: false, ethereum: false },
    })

    await expect(enabledAssetsAtom.get()).resolves.toEqual({ bitcoin: true, ethereum: true })
  })

  test('disable assets', async () => {
    await exodus.assets.disable(['ethereum'])
    await expect(enabledAndDisabledAssetsAtom.get()).resolves.toEqual({
      disabled: { ethereum: true },
    })

    await expect(enabledAssetsAtom.get()).resolves.toEqual({})
  })

  test('should reset enabledAssets on delete wallet', async () => {
    await exodus.assets.enable(['bitcoin'])
    await expect(enabledAssetsAtom.get()).resolves.toEqual({ bitcoin: true, ethereum: true })

    const expectRestart = expectEvent({ port, event: 'restart', payload: { reason: 'delete' } })

    await exodus.application.delete()

    await expectRestart

    // Simulate new wallet after restart
    const newPort = new Emitter()
    const expectStart = expectEvent({ port: newPort, event: 'start' })

    const container = createExodus({ adapters: { ...adapters, port: newPort }, config })
    const newExodus = container.resolve()

    await newExodus.application.start()
    await newExodus.application.create({ passphrase })
    await newExodus.application.unlock({ passphrase })

    const { enabledAssetsAtom: newEnabledAssetsAtom } = container.getByType('atom')

    await expectStart

    await expect(newEnabledAssetsAtom.get()).resolves.toEqual({ ethereum: true })

    await newExodus.application.stop()
  })

  test('should successfully export report (pre-wallet-exists)', async () => {
    await exodus.application.stop() // stop the instance from beforeEach
    await setup({ createWallet: false })

    await expect(exodus.wallet.exists()).resolves.toBe(false)
    await expect(exodus.reporting.export()).resolves.toMatchObject({
      enabledAssets: await reportNode.export({ walletExists: await exodus.wallet.exists() }),
    })
  })

  test('should successfully export report (post-wallet-exists)', async () => {
    await exodus.application.unlock({ passphrase })
    await expect(exodus.wallet.exists()).resolves.toBe(true)
    await expect(exodus.reporting.export()).resolves.toMatchObject({
      enabledAssets: await reportNode.export({ walletExists: await exodus.wallet.exists() }),
    })
  })
})
