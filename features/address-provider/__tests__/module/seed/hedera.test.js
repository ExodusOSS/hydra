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

  test('getEncodedPublicKey() returns address', async () => {
    // to gen the fixture:
    //
    // const publicKey = await publicKeyProvider.getPublicKey({
    //   walletAccount: walletAccount.toString(),
    //   keyIdentifier: assets.hedera.api.getKeyIdentifier({
    //     purpose: 44,
    //     accountIndex: walletAccount.index,
    //     chainIndex: 0,
    //     addressIndex: 0,
    //     compatibilityMode: walletAccount.compatibilityMode,
    //   }),
    // })
    //
    // const encodedPublicKey = assets.hedera.keys.encodePublic(publicKey, { purpose: 44 })

    await expect(
      addressProvider.getEncodedPublicKey({
        assetName: 'hedera',
        walletAccount,
        purpose: 44,
        chainIndex: 0,
        addressIndex: 0,
      })
    ).resolves.toEqual(
      '302a300506032b657003210074f7198c9a149cf3f97e95e35b3e49dfeef17f239561a7376a4556fbf3422046'
    )
  })
})
