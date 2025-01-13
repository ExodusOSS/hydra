import { assets, setup, walletAccount } from '../utils.js'

describe('hedera', () => {
  let addressProvider
  let accountStatesAtom

  beforeEach(() => {
    ;({ addressProvider, accountStatesAtom } = setup())
  })

  describe('getReceiveAddress', () => {
    it('should return main account name', async () => {
      const accountName = 'Secret Chamber'
      await accountStatesAtom.set({
        value: {
          [walletAccount]: {
            [assets.hedera.name]: {
              mainAccountName: accountName,
            },
          },
        },
      })

      const address = await addressProvider.getReceiveAddress({
        walletAccount,
        assetName: 'hedera',
      })

      expect(address.toString()).toBe(accountName)
    })
  })
})
