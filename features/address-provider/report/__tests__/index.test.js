import { createInMemoryAtom } from '@exodus/atoms'
import { pick } from '@exodus/basic-utils'
import KeyIdentifier from '@exodus/key-identifier'
import { Address, WalletAccount } from '@exodus/models'
import { when } from 'jest-when'

import assets from '../../__tests__/module/seed/_assets.js'
import { setup } from '../../__tests__/module/utils.js'
import addressProviderDefinition from '../../module/index.js'
import addressProviderReportDefinition from '../index.js'

const { factory: createAddressProvider } = addressProviderDefinition

describe('addressProviderReport', () => {
  let assetsModule
  let enabledWalletAccountsAtom
  let availableAssetNamesByWalletAccountAtom
  let addressProvider

  const walletAccounts = {
    exodus_0: new WalletAccount({
      color: '#ff3974',
      enabled: true,
      icon: 'exodus',
      index: 0,
      label: 'Exodus',
      source: 'exodus',
    }),
    exodus_1: new WalletAccount({
      color: '#30d968',
      enabled: true,
      icon: 'trezor',
      index: 1,
      label: 'asdf',
      source: 'exodus',
    }),
    ftx_0_123: new WalletAccount({
      color: '#30d968',
      enabled: true,
      icon: 'ftx',
      index: 0,
      id: 123,
      label: 'asdf',
      source: 'ftx',
    }),
    trezor_0_123: new WalletAccount({
      color: '#30d968',
      enabled: true,
      icon: 'trezor',
      index: 0,
      id: 123,
      label: 'asdf',
      source: 'trezor',
      model: 'T',
    }),
  }

  const addresses = {
    exodus_0: {
      solana: { bip44: { address: 'sol0', chain: [0, 0] } },
      ethereum: { bip44: { address: 'eth0', chain: [0, 0] } },
      bitcoin: { bip44: { address: 'btc0', chain: [0, 1] } },
    },
    exodus_1: {
      solana: { bip44: { address: 'sol1', chain: [0, 0] } },
      ethereum: { bip44: { address: 'eth1', chain: [0, 0] } },
      bitcoin: { bip44: { address: 'btc1', chain: [1, 0] } },
    },
    trezor_0_123: {
      ethereum: { bip44: { address: 'eth2', chain: [0, 0] } },
      bitcoin: { bip44: { address: 'btc2', chain: [0, 1] } },
      // solana is not supported
    },
  }

  const getAddress = async ({ assetName, walletAccount, purpose }) => {
    const { address, chain = [0, 0] } = addresses[walletAccount][assetName][`bip${purpose}`]

    const dummyKeyIdentifier = new KeyIdentifier({
      derivationPath: "m/44'",
      derivationAlgorithm: 'BIP32',
      keyType: assetName === 'solana' ? 'nacl' : 'secp256k1',
    })

    return Address.fromJSON({
      address,
      meta: {
        keyIdentifier: dummyKeyIdentifier,
        path: `m/${chain.join('/')}`,
      },
    })
  }

  beforeEach(() => {
    assetsModule = {
      getAssets: jest.fn().mockReturnValue(assets),
      getAsset: (assetName) => assets[assetName],
    }

    enabledWalletAccountsAtom = createInMemoryAtom({ defaultValue: walletAccounts })
    availableAssetNamesByWalletAccountAtom = createInMemoryAtom({
      defaultValue: {
        exodus_0: ['solana', 'ethereum', 'bitcoin'],
        exodus_1: ['solana', 'ethereum', 'bitcoin'],
        ftx_0_123: ['solana', 'ethereum', 'bitcoin'],
        trezor_0_123: ['ethereum', 'bitcoin'],
      },
    })

    addressProvider = {
      getReceiveAddress: jest.fn().mockImplementation(getAddress),
      getSupportedPurposes: jest.fn().mockImplementation(async () => [44]),
    }
  })

  it('should provide the correct namespace', async () => {
    const report = addressProviderReportDefinition.factory({
      assetsModule,
      enabledWalletAccountsAtom,
      availableAssetNamesByWalletAccountAtom,
      addressProvider,
    })

    expect(report.namespace).toEqual('addressProvider')
  })

  it('should report addresses for each enabled wallet account and asset', async () => {
    const report = addressProviderReportDefinition.factory({
      assetsModule,
      enabledWalletAccountsAtom,
      availableAssetNamesByWalletAccountAtom,
      addressProvider,
    })
    const result = await report.export()

    expect(result).toEqual(addresses)
  })

  it('should sort assets and purposes alphabetically', async () => {
    // Make sure assets are not sorted alphabetically
    const assetNames = ['ethereum', 'solana', 'bitcoin']
    assetsModule.getAssets.mockReturnValue(pick(assets, assetNames))
    when(addressProvider.getSupportedPurposes)
      .calledWith(expect.objectContaining({ assetName: 'bitcoin' }))
      .mockResolvedValue([84, 44, 86])

    const report = addressProviderReportDefinition.factory({
      assetsModule,
      enabledWalletAccountsAtom,
      availableAssetNamesByWalletAccountAtom,
      addressProvider,
    })
    const result = await report.export()

    expect(Object.keys(result.exodus_0)).toEqual(['bitcoin', 'ethereum', 'solana'])
    expect(Object.keys(result.exodus_0.bitcoin)).toEqual(['bip44', 'bip84', 'bip86'])
  })

  it('should throw if enabled wallet accounts could not be retrieved', async () => {
    const error = new Error('Could not load enabled accounts')
    jest.spyOn(enabledWalletAccountsAtom, 'get').mockRejectedValue(error)

    const report = addressProviderReportDefinition.factory({
      assetsModule,
      enabledWalletAccountsAtom,
      availableAssetNamesByWalletAccountAtom,
      addressProvider,
    })

    await expect(report.export()).rejects.toEqual(error)
  })

  it('should expose error for an address', async () => {
    const error = new Error('Could not get address')
    when(addressProvider.getReceiveAddress)
      .calledWith(expect.objectContaining({ assetName: 'solana' }))
      .mockRejectedValue(error)

    const report = addressProviderReportDefinition.factory({
      assetsModule,
      enabledWalletAccountsAtom,
      availableAssetNamesByWalletAccountAtom,
      addressProvider,
    })
    const result = await report.export()

    expect(result).toEqual({
      exodus_0: {
        ...addresses.exodus_0,
        solana: { bip44: { error } },
      },
      exodus_1: {
        ...addresses.exodus_1,
        solana: { bip44: { error } },
      },
      trezor_0_123: addresses.trezor_0_123,
    })
  })

  describe('extended keys', () => {
    let addressProvider
    let report

    beforeEach(() => {
      const {
        assetsModule,
        accountStatesAtom,
        walletAccountsAtom,
        assetSources,
        publicKeyProvider,
        knownAddresses,
        addressCache,
      } = setup()

      addressProvider = createAddressProvider({
        assetsModule,
        addressCache,
        accountStatesAtom,
        publicKeyProvider,
        knownAddresses,
        walletAccountsAtom,
        assetSources,
      })

      const enabledWalletAccountsAtom = createInMemoryAtom({
        defaultValue: { exodus_0: walletAccounts.exodus_0 },
      })
      const availableAssetNamesByWalletAccountAtom = createInMemoryAtom({
        defaultValue: {
          exodus_0: ['solana', 'ethereum', 'bitcoin'],
        },
      })

      report = addressProviderReportDefinition.factory({
        assetsModule,
        enabledWalletAccountsAtom,
        availableAssetNamesByWalletAccountAtom,
        addressProvider,
        publicKeyProvider,
      })
    })

    test('exports extended keys where possible', async () => {
      const result = await report.export()

      expect(result).toEqual({
        exodus_0: {
          bitcoin: {
            bip44: {
              address: '12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT',
              xpub: 'xpub6Cs97hSdwZAriqnrRxJA8kz7LSYWvxCttTLGBPHNvC6swZCN5D2bkt3SZc7arwtywB4SzD76vBW9YNRPad8qwa5Vxh7s6U99sjiEax3Nz75',
              chain: [0, 0],
            },
            bip84: {
              address: 'bc1qcgclnu4m5lv5k8eg2hytysvnlkjlhmyuyhtrna',
              xpub: 'xpub6D38wHpjsyV5UNaKPe2oXaios5ThiexMA4DQCRQBiiraVAUXCen9LvpY8JjEr54G9WZE467WjuRytH2JrD5CSUdQRD3qyZbzaGf15LLCyDK',
              zpub: 'zpub6rhfYdAaBLa3AxxZ4Mc3wkupD1kbbtwLzHFqmDBxUjcLbN6yhy7Gb48pAieQqtN6xnnqZ3JdfE95erFSHbuE2wzc9tSh9PEy7inHrUGMKdG',
              chain: [0, 0],
            },
            bip86: {
              address: 'bc1puqwugvnl8rkv7hggvtnl5dzahs3ckuwx2aucmadqes2l2trgam6s7r0ncn',
              xpub: 'xpub6DW2vbkDbdmwHeaAfaChFwoRWbW7t7LnSFUeW4rNcswxqdrmuqcefCAh3C4n2BqNbcjx4f7FUhC5VnSpCU8AsaqMmgw966EMLRwcFtdoruN',
              zpub: 'zpub6sAZXw63tzrtzExQLHmwg7zRrXo1mMKnGUX64re9NthiwqVER9wmuKUy5byx219DQtyZZcJNQ1uBGMfwdrxCU4CZWNKzFusKst4u35EeJbk',
              chain: [0, 0],
            },
          },
          ethereum: {
            bip44: {
              address: '0x8DC3a13761B0c72cD309FCBB89560f58926ABc99',
              xpub: 'xpub6C1DE2ZznuwibN77nN9qS6J5tsJ6rwbf5zqW4MonpBN9VDSuoT6ywgd9hUJeshXMjUt15Yt5GWFKa5w3ameJntk4ZsemYBj2B5XR4Kj4tuR',
              chain: [0, 0],
            },
          },
          solana: {
            bip44: {
              address: 'EuNMWG8CzKHBWDGJhiJYZGqPKtC71CZHRpA46e3GLGq2',
              // xpub: solana does not have xpub (ed25519)
              chain: [0, 0],
            },
          },
        },
      })
    }, 20_000)
  }, 20_000)
})
