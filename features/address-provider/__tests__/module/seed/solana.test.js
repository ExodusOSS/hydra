import { setup, walletAccount } from '../utils.js'
import { wallets } from './fixtures/index.js'

const solanaFixture = wallets.valid[0].bip44.coins.find((c) => c.coin === 'solana').accounts[0]
const expectedSolanaAddress = solanaFixture.chains[0].addresses[0].address

let addressProvider

beforeEach(async () => {
  ;({ addressProvider } = setup())
})

test('getReceiveAddress() should return the same address for solana base asset and solana token from cache', async () => {
  const solanaAddress = await addressProvider.getReceiveAddress({
    walletAccount,
    assetName: 'solana',
  })

  expect(solanaAddress.address).toEqual(expectedSolanaAddress)

  const serumAddress = await addressProvider.getReceiveAddress({
    walletAccount,
    assetName: 'serum',
  })

  expect(serumAddress.address).toEqual(expectedSolanaAddress)
})

test('isOwnAddress() returns true for own address', async () => {
  await expect(
    addressProvider.isOwnAddress({
      walletAccount,
      assetName: 'solana',
      address: expectedSolanaAddress,
    })
  ).resolves.toBe(true)
})

test('isOwnAddress() returns false for other address', async () => {
  await expect(
    addressProvider.isOwnAddress({
      walletAccount,
      assetName: 'solana',
      address: 'other address',
    })
  ).resolves.toBe(false)
})

test('getReceiveAddress() should return the same address for solana base asset and solana token without cache', async () => {
  const serumAddress = await addressProvider.getReceiveAddress({
    walletAccount,
    assetName: 'serum',
  })

  expect(serumAddress.address).toEqual(expectedSolanaAddress)
})
