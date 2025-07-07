import fiatRamp from '@exodus/fiat-ramp'
import kyc from '@exodus/kyc'

import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'

describe('fiat-ramp', () => {
  let adapters
  let exodus
  let reportNode

  const passphrase = 'my-password-manager-generated-this'

  const setup = async ({ createWallet = true } = {}) => {
    adapters = createAdapters()

    const container = createExodus({ adapters, config })
    container.use(kyc({ apiVersion: 1 }))
    container.registerMultiple(fiatRamp(config.fiatRamp).definitions)

    exodus = container.resolve()
    reportNode = container.getByType('report').fiatRampReport
    await container.get('fiatAssetsAtom').set({})
    await container.get('fiatCountriesAtom').set({})

    await exodus.application.start()
    await exodus.application.load()
    if (createWallet) {
      await exodus.application.create({ passphrase })
      await exodus.application.unlock({ passphrase })
    }
  }

  beforeEach(setup)
  afterEach(() => exodus.application.stop())

  test('should successfully export report (pre-wallet-exists)', async () => {
    await exodus.application.stop() // stop the instance from beforeEach
    await setup({ createWallet: false })

    await expect(exodus.wallet.exists()).resolves.toBe(false)
    await expect(exodus.reporting.export()).resolves.toMatchObject({
      fiatRamp: await reportNode.export({ walletExists: await exodus.wallet.exists() }),
    })
  })

  test('should successfully export report (post-wallet-exists)', async () => {
    await expect(exodus.wallet.exists()).resolves.toBe(true)
    await expect(exodus.reporting.export()).resolves.toMatchObject({
      fiatRamp: await reportNode.export({ walletExists: await exodus.wallet.exists() }),
    })
  })
})
