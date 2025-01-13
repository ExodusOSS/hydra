import createAdapters from './adapters'
import config from './config'
import createExodus from './exodus'

describe('wallet', () => {
  let exodus
  let adapters = createAdapters()
  let port

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
    adapters = createAdapters()

    port = adapters.port

    exodus = createExodus({ adapters, config, port }).resolve()

    await exodus.application.start()
  })

  test('unlock should unlock encrypted storage', async () => {
    const mnemonic = 'menu memory fury language physical wonder dog valid smart edge decrease worth'

    await exodus.application.import({ passphrase, mnemonic })

    await expect(exodus.wallet.isLocked()).resolves.toBe(true)

    expect(adapters.storage._isUnlocked()).toBe(false)

    await exodus.application.unlock({ passphrase })

    expect(adapters.storage._isUnlocked()).toBe(true)
    await adapters.storage.set('a', '1')
    const storedValue = await adapters.storage.get('a')
    expect(typeof storedValue).toEqual('string')
  })
})
