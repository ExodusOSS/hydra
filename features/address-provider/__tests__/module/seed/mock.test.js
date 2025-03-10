import { set } from '@exodus/basic-utils'
import createInMemoryStorage from '@exodus/storage-memory'
import lodash from 'lodash'

import { createMockableAddressProvider } from '../../../module/mock.js'
import reportDefinition from '../../../report/index.js'
import { setup as _setup, walletAccount } from '../utils.js'

const { get } = lodash

const mockAddress = '11111111111111111111111111111111'
const mockAddress1 = '11111111111111111111111111111112'
let addressesProviderReal
let addressProviderMock
let unsafeStorage
let expectAddress

const setup = (opts) => {
  const {
    assetsModule,
    publicKeyProvider,
    knownAddresses,
    addressCache,
    assetSources,
    enabledWalletAccountsAtom,
    ...rest
  } = _setup(opts)
  const addressProviderMock = createMockableAddressProvider({
    assetsModule,
    publicKeyProvider,
    knownAddresses,
    addressCache,
    assetSources,
    unsafeStorage,
    enabledWalletAccountsAtom,
  })

  return {
    ...rest,
    assetsModule,
    publicKeyProvider,
    knownAddresses,
    addressCache,
    assetSources,
    enabledWalletAccountsAtom,
    addressProviderMock,
  }
}

beforeEach(async () => {
  unsafeStorage = createInMemoryStorage()
  ;({ addressProvider: addressesProviderReal, addressProviderMock } = setup())
  expectAddress = async (opts, address) => {
    const result = await addressProviderMock.getAddress(opts)
    expect(result.address).toBe(address)
  }
})

test('getReceiveAddress() should return a mock address', async () => {
  const mockedAddresses = {
    [walletAccount.toString()]: { solana: { '44/0/0': { address: mockAddress } } },
  }

  await unsafeStorage
    .namespace('debug')
    .set('mockableAddressProvider', { addresses: mockedAddresses })

  const solanaAddress = await addressProviderMock.getReceiveAddress({
    walletAccount,
    assetName: 'solana',
  })

  expect(solanaAddress.address).toBe(mockAddress)
})

test('getReceiveAddress() should return a real address if mock config is not specified', async () => {
  const mockSolanaAddress = await addressProviderMock.getReceiveAddress({
    walletAccount,
    assetName: 'solana',
  })

  const realSolanaAddress = await addressesProviderReal.getReceiveAddress({
    walletAccount,
    assetName: 'solana',
  })

  expect(mockSolanaAddress.address).toBe(realSolanaAddress.address)
})

test('getReceiveAddress() should return a real address if mock config is for different asset', async () => {
  const mockedAddresses = {
    [walletAccount.toString()]: { ethereum: { '44/0/0': { address: mockAddress } } },
  }

  await unsafeStorage
    .namespace('debug')
    .set('mockableAddressProvider', { addresses: mockedAddresses })

  const mockSolanaAddress = await addressProviderMock.getReceiveAddress({
    walletAccount,
    assetName: 'solana',
  })

  const realSolanaAddress = await addressesProviderReal.getReceiveAddress({
    walletAccount,
    assetName: 'solana',
  })

  expect(mockSolanaAddress.address).toBe(realSolanaAddress.address)
})

test('mockAddress() should set a new mock address', async () => {
  const { addressProviderMock } = setup()
  await addressProviderMock.mockAddress({
    walletAccount,
    assetName: 'solana',
    address: mockAddress,
  })

  const solanaAddress = await addressProviderMock.getReceiveAddress({
    walletAccount,
    assetName: 'solana',
  })

  expect(solanaAddress.address).toBe(mockAddress)
})

test('mockAddress() should set a new mock address with purpose', async () => {
  const purpose = 44

  await addressProviderMock.mockAddress({
    walletAccount,
    assetName: 'bitcoin',
    address: mockAddress,
    purpose,
  })

  const derivedBitcoinAddress = await addressProviderMock.getReceiveAddress({
    walletAccount,
    assetName: 'bitcoin',
    purpose: 84,
  })

  expect(derivedBitcoinAddress.address).not.toBe(mockAddress)

  let bitcoinAddress = await addressProviderMock.getReceiveAddress({
    walletAccount,
    assetName: 'bitcoin',
    purpose,
  })

  expect(bitcoinAddress.address).toBe(mockAddress)

  await addressProviderMock.mockAddress({
    walletAccount,
    assetName: 'bitcoin',
    address: mockAddress1,
  })

  bitcoinAddress = await addressProviderMock.getReceiveAddress({
    walletAccount,
    assetName: 'bitcoin',
  })

  expect(bitcoinAddress.address).toBe(mockAddress1)

  bitcoinAddress = await addressProviderMock.getReceiveAddress({
    walletAccount,
    assetName: 'bitcoin',
    purpose,
  })

  expect(bitcoinAddress.address).toBe(mockAddress)
})

test('mockAddress() should set a new mock address with purpose and address/chain index', async () => {
  const purpose = 44
  const addressIndex = 1
  const chainIndex = 1

  const assetName = 'bitcoin'
  await addressProviderMock.mockAddress({
    walletAccount,
    assetName,
    address: mockAddress,
    purpose,
    addressIndex,
    chainIndex,
  })

  const derivedAddress = await addressProviderMock.getReceiveAddress({
    walletAccount,
    assetName,
  })

  expect(derivedAddress.address).not.toBe(mockAddress)

  let address = await addressProviderMock.getReceiveAddress({
    walletAccount,
    assetName,
    purpose,
  })

  expect(address.address).not.toBe(mockAddress)

  address = await addressProviderMock.getAddress({
    walletAccount,
    assetName,
    purpose,
    addressIndex,
    chainIndex,
  })

  expect(address.address).toBe(mockAddress)
  expect(address.meta.path).toBe(`m/${addressIndex}/${chainIndex}`)

  await addressProviderMock.mockAddress({
    walletAccount,
    assetName,
    address: mockAddress1,
  })

  address = await addressProviderMock.getReceiveAddress({
    walletAccount,
    assetName,
  })

  expect(address.address).toBe(mockAddress1)
  expect(address.meta.path).toBe(`m/0/0`)

  address = await addressProviderMock.getReceiveAddress({
    walletAccount,
    assetName,
    purpose,
  })

  expect(address.address).toBe(mockAddress1)
  expect(address.meta.path).toBe(`m/0/0`)

  address = await addressProviderMock.getAddress({
    walletAccount,
    assetName,
    purpose,
    addressIndex,
    chainIndex,
  })

  expect(address.address).toBe(mockAddress)
  expect(address.meta.path).toBe(`m/${addressIndex}/${chainIndex}`)
})

test('mockAddress without chain/address index sets default for all chain/address indexes', async () => {
  const purpose = 86
  const assetName = 'bitcoin'

  await addressProviderMock.mockAddress({
    walletAccount,
    assetName,
    address: 'a',
    purpose,
  })

  await addressProviderMock.mockAddress({
    walletAccount,
    assetName,
    address: 'b',
    purpose,
    chainIndex: 1,
    addressIndex: 4,
  })

  await addressProviderMock.mockAddress({
    walletAccount,
    assetName,
    address: 'c',
  })

  await expectAddress(
    {
      walletAccount,
      assetName,
      purpose,
      chainIndex: 1,
      addressIndex: 4,
    },
    'b'
  )

  await expectAddress(
    {
      walletAccount,
      assetName,
      purpose,
      chainIndex: 1,
      addressIndex: 5,
    },
    'a'
  )

  await expectAddress(
    {
      walletAccount,
      assetName,
      purpose: 44,
      chainIndex: 1,
      addressIndex: 5,
    },
    'c'
  )

  await expectAddress(
    {
      walletAccount,
      assetName,
      purpose: 44,
      chainIndex: 1,
      addressIndex: 4,
    },
    'c'
  )
})

test('importReport', async () => {
  const {
    assetsModule,
    walletAccountsAtom,
    accountStatesAtom,
    availableAssetNamesByWalletAccountAtom,
    addressProvider,
    addressProviderMock,
  } = setup()

  const reportNode = reportDefinition.factory({
    assetsModule,
    enabledWalletAccountsAtom: walletAccountsAtom,
    availableAssetNamesByWalletAccountAtom,
    addressProvider,
    accountStatesAtom,
  })

  const report = await reportNode.export({ walletExists: true })
  const path = ['exodus_0', 'bitcoin', 'bip44', 'address']
  expect(get(report, path)).toBeDefined()
  set(report, path, mockAddress)

  await addressProviderMock.importReport(report)
  await expectAddress(
    {
      walletAccount,
      assetName: 'bitcoin',
      purpose: 44,
    },
    mockAddress
  )

  await expectAddress(
    {
      walletAccount,
      assetName: 'bitcoin',
      purpose: 44,
      chainIndex: 1,
      addressIndex: 1,
    },
    mockAddress
  )

  const derivedAddress = await addressProviderMock.getAddress({
    walletAccount,
    assetName: 'bitcoin',
    purpose: 84,
    chainIndex: 0,
    addressIndex: 1,
  })

  expect(derivedAddress.toString()).not.toEqual(mockAddress)
})
