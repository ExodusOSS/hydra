import { createInMemoryAtom } from '@exodus/atoms'
import { TxSet, WalletAccount } from '@exodus/models'

import { assets, setup, walletAccount } from '../utils.js'
import { wallets } from './fixtures/index.js'

const { ethereum } = assets
const ethereumFixture = wallets.valid[0].bip44.coins.find((c) => c.coin === 'ethereum').accounts[0] // m/60'/0'/0'
const assetName = 'ethereum'
const ethereumReceiveAddressPath = "m/44'/60'/0'/0/0"
const ethereumReceiveAddress = ethereumFixture.chains[0].addresses[0].address

const createTestData = () => {
  const addresses = {
    // legacy
    [ethereumReceiveAddressPath]: ethereumFixture.chains[0].addresses[0].address,
  }

  const txLog = {
    [WalletAccount.DEFAULT_NAME]: {
      ethereum: TxSet.fromArray([
        {
          coinName: 'ethereum',
          txId: '1',
          addresses: [
            {
              address: addresses[ethereumReceiveAddressPath],
              meta: { path: 'm/0/0' },
            },
          ],
          currencies: { ethereum: ethereum.currency },
        },
      ]),
    },
  }

  const walletAccounts = {
    [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
  }

  return { txLog, walletAccounts }
}

test('getReceiveAddresses() should return only one Ethereum address', async () => {
  const { txLog } = createTestData()

  /*
  what's happening here is we leverage the fact that each TX we receive logs the addresses in the wallet.
  Since Exodus is only ever watching receive addresses, we know the unique set of all addresses we currently have
  + 1 is what Exodus should be watching.
*/

  const txLogsAtom = createInMemoryAtom({
    defaultValue: { value: { [walletAccount]: { [assetName]: txLog[walletAccount][assetName] } } },
  })

  const { addressProvider, addressCache } = setup({ txLogsAtom })

  const set = await addressProvider.getReceiveAddresses({
    walletAccount,
    assetName,
  })

  expect(set.size).toEqual(1)
  expect([...set][0].toString()).toEqual(ethereumReceiveAddress)
  const { address: cachedAddress } = await addressCache.get({
    walletAccountName: WalletAccount.DEFAULT_NAME,
    baseAssetName: assetName,
    derivationPath: "m/44'/60'/0'/0/0",
  })
  expect(cachedAddress).toEqual(ethereumReceiveAddress)

  ethereum.keys.encodePublic = jest.fn(ethereum.keys.encodePublic)
  const viaCache = await addressProvider.getReceiveAddresses({
    walletAccount,
    assetName,
    useCache: true,
  })

  expect(ethereum.keys.encodePublic).not.toHaveBeenCalled()

  expect(viaCache.size).toEqual(1)
  expect([...viaCache][0].toString()).toEqual(ethereumReceiveAddress)
})

test('getSupportedPurposes() should return the list for ethereum', async () => {
  const asset = assets.ethereum
  const { addressProvider } = setup()
  const supportedPurposes = await addressProvider.getSupportedPurposes({
    assetName: asset.name,
    walletAccount,
  })

  expect(supportedPurposes).toEqual([44])
})
