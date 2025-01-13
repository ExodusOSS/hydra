import KeyIdentifier from '@exodus/key-identifier'
import { WalletAccount } from '@exodus/models'

import createAdapters from './adapters'
import config from './config'
import createExodus from './exodus'

describe.each(['synced', 'memory'])('address-provider (%s)', (addressCacheFlavor) => {
  let exodus

  let adapters

  let port

  const passphrase = 'my-password-manager-generated-this'

  beforeEach(async () => {
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
    await exodus.application.create({ passphrase })
  })

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
})
