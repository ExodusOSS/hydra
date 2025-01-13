import { assets, setup, walletAccount } from '../utils.js'

describe('eosio', () => {
  let addressProvider
  let addressCache
  let accountStatesAtom
  let setMainAccountName

  beforeEach(() => {
    ;({ addressProvider, addressCache, accountStatesAtom } = setup())

    setMainAccountName = async (mainAccountName) => {
      await accountStatesAtom.set({
        value: {
          [walletAccount]: {
            [assets.eosio.name]: {
              mainAccountName,
            },
          },
        },
      })
    }
  })

  describe('isOwnAddress', () => {
    it('should return true if provided address equals main account name', async () => {
      await setMainAccountName('Secret Chamber')
      await expect(
        addressProvider.isOwnAddress({
          walletAccount,
          assetName: 'eosio',
          address: 'Secret Chamber',
        })
      ).resolves.toBe(true)
    })

    it('should return false if provided address does not equal main account name', async () => {
      await setMainAccountName('Secret Chamber')
      await expect(
        addressProvider.isOwnAddress({ walletAccount, assetName: 'eosio', address: 'Wayne Tower' })
      ).resolves.toBe(false)
    })

    it('should return false if no main account name', async () => {
      await expect(
        addressProvider.isOwnAddress({ walletAccount, assetName: 'eosio', address: 'Wayne Tower' })
      ).resolves.toBe(false)
    })

    it('should return false if not abstract accounts asset and address does not mach', async () => {
      const { abstractAccounts } = assets.eosio.api.features
      assets.eosio.api.features.abstractAccounts = false
      jest.spyOn(accountStatesAtom, 'get')

      await expect(
        addressProvider.isOwnAddress({ walletAccount, assetName: 'eosio', address: 'Wayne Tower' })
      ).resolves.toBe(false)
      expect(accountStatesAtom.get).not.toHaveBeenCalled()
      // reset to initial value
      assets.eosio.api.features.abstractAccounts = abstractAccounts
    })
  })

  describe('getReceiveAddress', () => {
    it('should return noAccountYet until accountName is set', async () => {
      addressCache.set = jest.fn()
      const address = await addressProvider.getReceiveAddress({ walletAccount, assetName: 'eosio' })
      expect(address.toString()).toBe(assets.eosio.noAccountYet)
      expect(addressCache.set).not.toHaveBeenCalled()
    })

    it('should return main account name', async () => {
      addressCache.set = jest.fn()
      await setMainAccountName('Secret Chamber')
      const address = await addressProvider.getReceiveAddress({ walletAccount, assetName: 'eosio' })
      expect(address.toString()).toBe('Secret Chamber')
      expect(addressCache.set).not.toHaveBeenCalled()
    })
  })
})
