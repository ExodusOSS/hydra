import Emitter from '@exodus/wild-emitter'

import createAdapters from './adapters'
import baseConfig from './config'
import createExodus from './exodus'
import expectEvent from './expect-event'

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

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    adapters = createAdapters()

    port = adapters.port

    const container = createExodus({ adapters, config })

    exodus = container.resolve()
    ;({ enabledAssetsAtom, enabledAndDisabledAssetsAtom } = container.getByType('atom'))

    await exodus.application.start()
    await exodus.application.create({ passphrase })
    await exodus.application.unlock({ passphrase })
    await expect(enabledAndDisabledAssetsAtom.get()).resolves.toEqual({
      disabled: { ethereum: false },
    })

    await expect(enabledAssetsAtom.get()).resolves.toEqual({ ethereum: true })
  })

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
  })
})
