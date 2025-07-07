import KeyIdentifier from '@exodus/key-identifier'
import { WalletAccount } from '@exodus/models'

import createAdapters from './adapters/index.js'
import config from './config.js'
import createExodus from './exodus.js'

describe.each(['synced', 'memory'])('address-provider (%s)', (addressCacheFlavor) => {
  let exodus

  let adapters

  let port

  let reportNode

  const passphrase = 'my-password-manager-generated-this'

  const setupWallet = async ({ createWallet = true } = {}) => {
    adapters = createAdapters()

    port = adapters.port

    const configToUse = {
      ...config,
      addressProvider: { ...config.addressProvider, addressCacheFlavor },
    }
    const container = createExodus({ adapters, config: configToUse, port })

    exodus = container.resolve()

    await exodus.application.start()
    await exodus.application.load()
    if (createWallet) {
      await exodus.application.create({ passphrase })
    }

    reportNode = container.getByType('report').addressProviderReport
  }

  beforeEach(setupWallet)

  afterEach(() => exodus.application.stop())

  test('should get receive address if wallet unlocked', async () => {
    await exodus.application.unlock({ passphrase })

    const address = await exodus.addressProvider.getReceiveAddress({
      assetName: 'ethereum',
      walletAccount: WalletAccount.DEFAULT_NAME,
    })

    expect(address).toMatch(/^0x.+$/g)
  })

  test('should get default address if wallet unlocked', async () => {
    await exodus.application.unlock({ passphrase })

    const address = await exodus.addressProvider.getDefaultAddress({
      assetName: 'ethereum',
      walletAccount: WalletAccount.DEFAULT_NAME,
    })

    expect(address.address).toMatch(/^0x.+$/g)
    expect(address.meta).toEqual({
      walletAccount: WalletAccount.DEFAULT_NAME,
      keyIdentifier: expect.any(KeyIdentifier),
      path: 'm/0/0',
      purpose: 44,
    })
  })

  test('should get unused address if wallet unlocked', async () => {
    await exodus.application.unlock({ passphrase })

    const address = await exodus.addressProvider.getUnusedAddress({
      assetName: 'ethereum',
      walletAccount: WalletAccount.DEFAULT_NAME,
      chainIndex: 0,
    })

    expect(address.address).toMatch(/^0x.+$/g)
    expect(address.meta).toEqual({
      walletAccount: WalletAccount.DEFAULT_NAME,
      keyIdentifier: expect.any(KeyIdentifier),
      path: 'm/0/0',
      purpose: 44,
    })
  })

  test('should not get receive address if wallet locked', async () => {
    const getAddress = exodus.addressProvider.getReceiveAddress({
      assetName: 'ethereum',
      walletAccount: WalletAccount.DEFAULT_NAME,
    })

    await expect(getAddress).rejects.toThrow('address-provider: wallet should be unlocked')
  })

  test('should get address if wallet unlocked', async () => {
    await exodus.application.unlock({ passphrase })

    const address = await exodus.addressProvider.getAddress({
      purpose: 44,
      assetName: 'ethereum',
      walletAccount: WalletAccount.DEFAULT_NAME,
      chainIndex: 0,
      addressIndex: 0,
    })

    expect(address.address).toMatch(/^0x.+$/g)
    expect(address.meta.path).toBeTruthy()
  })

  test('should not get address if wallet locked', async () => {
    // needed to trigger address cache load, as addressCache.get is waiting for onStart
    await exodus.application.unlock({ passphrase })
    await exodus.application.lock()

    const getAddress = exodus.addressProvider.getAddress({
      purpose: 44,
      assetName: 'ethereum',
      walletAccount: WalletAccount.DEFAULT_NAME,
      chainIndex: 0,
      addressIndex: 0,
    })

    await expect(getAddress).rejects.toThrow('address-provider: wallet should be unlocked')
  })

  test('should get supported purposes', async () => {
    await exodus.application.unlock({ passphrase })

    const purposes = await exodus.addressProvider.getSupportedPurposes({
      assetName: 'ethereum',
      walletAccount: WalletAccount.DEFAULT_NAME,
    })

    expect(purposes).toEqual([44])
  })

  test('should get default purpose', async () => {
    await exodus.application.unlock({ passphrase })

    await expect(
      exodus.addressProvider.getDefaultPurpose({
        assetName: 'bitcoin',
        walletAccount: WalletAccount.DEFAULT_NAME,
      })
    ).resolves.toEqual(84)
  })

  test('should successfully export report (pre-wallet-exists)', async () => {
    await exodus.application.stop() // stop the instance from beforeEach
    await setupWallet({ createWallet: false })

    await expect(exodus.wallet.exists()).resolves.toBe(false)
    await expect(exodus.reporting.export()).resolves.toMatchObject({
      addressProvider: await reportNode.export({ walletExists: await exodus.wallet.exists() }),
    })
  })

  test('should successfully export report (post-wallet-exists)', async () => {
    await exodus.application.unlock({ passphrase })
    await expect(exodus.wallet.exists()).resolves.toBe(true)
    await expect(exodus.reporting.export()).resolves.toMatchObject({
      addressProvider: await reportNode.export({ walletExists: await exodus.wallet.exists() }),
    })
  })
})
