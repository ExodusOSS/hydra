import { createInMemoryAtom } from '@exodus/atoms'
import { WalletAccount } from '@exodus/models'

import { assets as seedAssets, seedId, setup } from './utils.js'

const PROXY_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678'

const externalAccount = new WalletAccount({
  source: 'polymarket',
  index: 0,
  id: 'test-external-wallet',
})

const createSetup = async (externalAddresses = {}, overrides = {}) => {
  const externalWalletAddressesAtom = createInMemoryAtom({ defaultValue: externalAddresses })
  const result = await setup({ externalWalletAddressesAtom, ...overrides })
  return { ...result, externalWalletAddressesAtom }
}

describe('external wallet addresses', () => {
  it('should return external address for external wallet account', async () => {
    const { addressProvider } = await createSetup({
      [externalAccount.toString()]: { matic: PROXY_ADDRESS },
    })

    const address = await addressProvider.getReceiveAddress({
      assetName: 'matic',
      walletAccount: externalAccount,
    })

    expect(address.address).toBe(PROXY_ADDRESS)
    expect(address.meta.walletAccount).toBe(externalAccount.toString())
  })

  it('should skip external lookup for non-external wallet account', async () => {
    const normalAccount = new WalletAccount({ source: 'exodus', index: 0, seedId })

    const { addressProvider } = await createSetup({
      [normalAccount.toString()]: { bitcoin: PROXY_ADDRESS },
    })

    const address = await addressProvider.getReceiveAddress({
      assetName: 'bitcoin',
      walletAccount: normalAccount,
    })

    expect(address.address).not.toBe(PROXY_ADDRESS)
  })

  it('should throw ExternalAddressNotFoundError when mapping is missing', async () => {
    const { addressProvider } = await createSetup({})

    await expect(
      addressProvider.getReceiveAddress({
        assetName: 'matic',
        walletAccount: externalAccount,
      })
    ).rejects.toMatchObject({
      name: 'ExternalAddressNotFoundError',
      message: `External address not found for asset "matic" in wallet account "${externalAccount.toString()}"`,
    })
  })

  it('should reflect atom updates', async () => {
    const updatedAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'
    const { addressProvider, externalWalletAddressesAtom } = await createSetup({
      [externalAccount.toString()]: { matic: PROXY_ADDRESS },
    })

    await externalWalletAddressesAtom.set({
      [externalAccount.toString()]: { matic: updatedAddress },
    })

    const address = await addressProvider.getReceiveAddress({
      assetName: 'matic',
      walletAccount: externalAccount,
    })

    expect(address.address).toBe(updatedAddress)
  })

  it('should resolve token assetName to base asset key', async () => {
    const tokenName = 'pusd_matic_c86dc349'
    const pusdMatic = { name: tokenName, baseAsset: seedAssets.matic }
    const assetsAtom = createInMemoryAtom({
      defaultValue: { value: { ...seedAssets, [tokenName]: pusdMatic } },
    })

    const { addressProvider } = await createSetup(
      { [externalAccount.toString()]: { matic: PROXY_ADDRESS } },
      { assetsAtom }
    )

    const address = await addressProvider.getReceiveAddress({
      assetName: tokenName,
      walletAccount: externalAccount,
    })

    expect(address.address).toBe(PROXY_ADDRESS)
  })
})
