import { createInMemoryAtom } from '@exodus/atoms'
import KeyIdentifier from '@exodus/key-identifier'
import { PublicKeyProvider } from '@exodus/public-key-provider/lib/module/public-key-provider.js'
import publicKeyStoreDefinition from '@exodus/public-key-provider/lib/module/store/index.js'

import addressProviderDefinition from '../../../module/address-provider.js'
import knownAddressesDefinition from '../../../module/known-addresses.js'
import { setup, trezorAccount as walletAccount } from '../utils.js'
import createAssetsForTesting from './_assets.js'
import { trezorAddressesFixture } from './fixtures/addresses.js'
import { createTxLogsAtom } from './fixtures/blockchainMetadata.js'
import { fixture as publicKeys } from './fixtures/public-keys.js'

const mockLogger = { warn: jest.fn() }
const hardwareWalletPublicKeysAtom = createInMemoryAtom({ defaultValue: Object.create(null) })
const softwareWalletPublicKeysAtom = createInMemoryAtom({ defaultValue: Object.create(null) })

const mockWaletAccounts = {
  setAccounts: (data) => hardwareWalletPublicKeysAtom.set(data),
}
const { factory: createKnownAddresses } = knownAddressesDefinition
const { factory: createPublicKeyStore } = publicKeyStoreDefinition
const { factory: createAddressProvider } = addressProviderDefinition

describe('Trezor Address Compatibility', () => {
  const walletAccountsAtom = createInMemoryAtom({
    defaultValue: { [walletAccount]: walletAccount },
  })

  const publicKeyStore = createPublicKeyStore({
    logger: mockLogger,
    walletAccounts: mockWaletAccounts,
    hardwareWalletPublicKeysAtom,
    softwareWalletPublicKeysAtom,
    walletAccountsAtom,
  })

  const { assets } = createAssetsForTesting()
  const publicKeyProvider = new PublicKeyProvider({
    publicKeyStore,
    walletAccountsAtom,
    getBuildMetadata: jest.fn().mockResolvedValue({ dev: false }),
  })
  const { assetSources, assetsModule, addressCache } = setup({
    assets,
    walletAccountsAtom,
    publicKeyProvider,
  })

  const addressProvider = createAddressProvider({
    publicKeyProvider,
    assetsModule,
    knownAddresses: createKnownAddresses({
      txLogsAtom: createTxLogsAtom(),
      assetsModule,
    }),
    addressCache,
    logger: mockLogger,
    assetSources,
  })

  beforeAll(async () => {
    await hardwareWalletPublicKeysAtom.set(publicKeys)
  })

  const assetToAddressMap = trezorAddressesFixture[walletAccount.toString()]
  const testCases = Object.entries(assetToAddressMap).flatMap(([assetName, testsCasesPerAsset]) => {
    return testsCasesPerAsset.map(({ purpose, chainIndex, addressIndex, expectedAddress }) => {
      return {
        assetName,
        params: { assetName, purpose, chainIndex, addressIndex, walletAccount },
        expectedAddress,
      }
    })
  })

  it.each(testCases)(
    `.getAddress({ assetName: $assetName })`,
    async ({ params, expectedAddress }) => {
      const { assetName, purpose, chainIndex, addressIndex } = params
      const address = await addressProvider.getAddress({
        assetName,
        purpose,
        addressIndex,
        chainIndex,
        walletAccount,
      })

      expect(address.toJSON()).toEqual({
        address: expectedAddress,
        meta: {
          path: `m/${chainIndex}/${addressIndex}`,
          purpose,
          walletAccount: walletAccount.toString(),
          keyIdentifier: expect.any(KeyIdentifier),
        },
      })
    }
  )

  const testCasesReceive = testCases.filter(({ params }) => {
    const isReceiveAddress = params.chainIndex === 0
    const isFirstAddress = params.addressIndex === 0
    return isReceiveAddress && isFirstAddress
  })
  it.each(testCasesReceive)(
    `.getReceiveAddresses({ assetName: $assetName, multiAddressMode: false })`,
    async ({ params, expectedAddress }) => {
      const { assetName, purpose } = params
      const addresses = await addressProvider.getReceiveAddresses({
        assetName,
        purpose,
        walletAccount,
      })
      expect(addresses.size).toBe(1)
      expect(addresses.has(expectedAddress)).toBeTruthy()
    }
  )

  const testCasesChange = testCases.filter(({ params }) => {
    const isChangeAddress = params.chainIndex === 1
    const isFirstAddress = params.addressIndex === 0
    return isChangeAddress && isFirstAddress
  })
  it.each(testCasesChange)(
    `.getChangeAddresses({ assetName: $assetName, multiAddressMode: false })`,
    async ({ params, expectedAddress }) => {
      const { assetName, purpose } = params
      const addresses = await addressProvider.getChangeAddresses({
        assetName,
        purpose,
        walletAccount,
      })
      expect(addresses.size).toBe(1)
      expect(addresses.has(expectedAddress)).toBeTruthy()
    }
  )

  const testCasesPurposes = Object.entries(assetToAddressMap).flatMap(
    ([assetName, testsCasesPerAsset]) => {
      return {
        assetName,
        expectedPurposes: testsCasesPerAsset.reduce(
          (purposes, testCase) => new Set([...purposes, testCase.purpose]),
          []
        ),
      }
    }
  )
  it.each(testCasesPurposes)(
    `.getSupportedPurposes({ assetName: $assetName })`,
    async ({ assetName, expectedPurposes }) => {
      const purposes = await addressProvider.getSupportedPurposes({
        assetName,
        walletAccount,
      })
      // Sort, assuming that the higher purpose is likely the default one
      // indirectly this also checks that the default purpose is also correct
      // which is the first purpose return in the array of supported purposes.
      expect(purposes).toEqual([...expectedPurposes].sort((a, b) => b - a))
    }
  )
})
