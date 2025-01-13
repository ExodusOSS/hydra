import { setup, trezorAccount, walletAccount, walletAccount2 } from '../utils.js'
import { wallets } from './fixtures/index.js'

const cardanoFixture = wallets.valid[0].bip44.coins.find((c) => c.coin === 'cardano').accounts[0]
const expectedCardanoAddress = cardanoFixture.chains[0].addresses[0].address

let addressProvider
let assetsModule

beforeEach(async () => {
  ;({ addressProvider, assetsModule } = setup())
})

afterEach(() => {
  jest.resetAllMocks()
})

test('getReceiveAddress() should return the same address for cardano asset', async () => {
  const cardanoAddress = await addressProvider.getReceiveAddress({
    walletAccount,
    assetName: 'cardano',
  })

  expect(cardanoAddress.address).toEqual(expectedCardanoAddress)
})

test('getReceiveAddress() should return a different address when different getReceiveAddressPath', async () => {
  const cardano = assetsModule.getAsset('cardano')
  expect(cardano).toBeDefined()

  const cardanoAddressOriginal = await addressProvider.getReceiveAddress({
    walletAccount: walletAccount2,
    assetName: 'cardano',
  })

  expect(cardanoAddressOriginal.address).toEqual(
    'addr1qxpwwjujr4p88wtk4q4e4z9a4ctqhu3z87z9rcfnq7xqvpuzua9ey82zwwuhd2ptn2ytmtskp0ezy0uy28snxpuvqcrst4yqgw'
  )

  jest.spyOn(cardano.api, 'getDefaultAddressPath').mockImplementation(({ walletAccount }) => {
    if (walletAccount === walletAccount2) {
      return 'm/0/1'
    }

    return 'm/0/1'
  })

  const cardanoAddressAlternative = await addressProvider.getReceiveAddress({
    walletAccount: walletAccount2,
    assetName: 'cardano',
  })

  expect(cardanoAddressAlternative.address).toEqual(
    'addr1qxlesu5jus7k466ph3khh7rh6z3am2394atyn597xtthnxdlnpef9epadt45r0rd00u8059rmk4ztt6kf8gtuvkh0xvslevxpm'
  )
})

test('getDefaultPurpose() for cardano', async () => {
  await expect(
    addressProvider.getDefaultPurpose({
      walletAccount: walletAccount.toString(),
      assetName: 'cardano',
    })
  ).resolves.toEqual(44)

  await expect(
    addressProvider.getDefaultPurpose({
      walletAccount: trezorAccount.toString(),
      assetName: 'cardano',
    })
  ).resolves.toEqual(1852)
})
