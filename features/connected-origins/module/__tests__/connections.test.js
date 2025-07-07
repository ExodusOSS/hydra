import addressProviderDefinition from '@exodus/address-provider/module/index.js'
import { createInMemoryAtom } from '@exodus/atoms'
import ethereumPlugin from '@exodus/ethereum-plugin'
import { getSeedId } from '@exodus/key-utils'
import { Keychain } from '@exodus/keychain/module/index.js'
import { WalletAccount } from '@exodus/models'
import publicKeyProviderDefinition from '@exodus/public-key-provider/lib/module/index.js'
import solanaPlugin from '@exodus/solana-plugin'
import { mnemonicToSeedSync } from 'bip39'

import createConnectedOriginsDefinition from '../index.js'

const solana = solanaPlugin.createAsset({ assetClientInterface: {} })
const ethereum = ethereumPlugin.createAsset({ assetClientInterface: {} })
const { factory: createPublicKeyProvider } = publicKeyProviderDefinition
const { factory: createAddressProvider } = addressProviderDefinition

describe('connected origins module', () => {
  let connectedOriginsAtom
  let connectedAccountsAtom
  let connectedOrigins
  let activeWalletAccountAtom
  let enabledWalletAccountsAtom

  const seed = mnemonicToSeedSync(
    'test memory fury language physical wonder dog valid smart edge decrease mirror'
  )

  const seedId = getSeedId(seed)

  const walletAccounts = {
    exodus_0: WalletAccount.defaultWith({ seedId }),
    exodus_1: WalletAccount.defaultWith({ index: 1, name: 'Exodus 1', seedId }),
  }

  beforeEach(async () => {
    const walletAccountsAtom = createInMemoryAtom({ defaultValue: walletAccounts })
    enabledWalletAccountsAtom = walletAccountsAtom

    const keychain = new Keychain({})
    keychain.addSeed(seed)

    const publicKeyProvider = createPublicKeyProvider({
      keychain,
      walletAccountsAtom,
      publicKeyStore: { add: () => {} },
      getBuildMetadata: () => ({}),
    })

    const assetSources = {
      getSupportedPurposes: async () => [44],
      isSupported: async () => true,
    }

    const assets = { solana, ethereum, optimism: solana }
    solana.baseAsset = solana
    ethereum.baseAsset = ethereum

    const assetsModule = {
      getAssets() {
        return assets
      },
      getAsset(name) {
        return assets[name]
      },
    }

    const addressCache = { get: async () => {}, set: async () => {} }

    const addressProvider = createAddressProvider({
      publicKeyProvider,
      assetSources,
      assetsModule,
      addressCache,
    })

    connectedOriginsAtom = createInMemoryAtom({ defaultValue: [] })
    connectedAccountsAtom = createInMemoryAtom({ defaultValue: [] })
    activeWalletAccountAtom = createInMemoryAtom({ defaultValue: 'exodus_0' })

    connectedOrigins = createConnectedOriginsDefinition.factory({
      activeWalletAccountAtom,
      connectedOriginsAtom,
      connectedAccountsAtom,
      addressProvider,
      enabledWalletAccountsAtom,
    })
  })

  test('trust new origin', async () => {
    await connectedOrigins.add({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      connectedAssetName: 'solana',
      trusted: true,
    })
    const origins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(origins[0]).toMatchObject({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      favorite: false,
      autoApprove: false,
      connectedAssetName: 'solana',
      activeConnections: [],
    })

    await expect(connectedAccountsAtom.get()).resolves.toEqual({
      exodus_0: {
        addresses: {
          solana: 'ASwcbiBuegaMrNUuXeN5WDYKoRuDXxMRt5DdStjvdSro',
        },
      },
      exodus_1: {
        addresses: {
          solana: '4orUhPn6CRzVcgq5DHfAVt2odiZpPjNy7wNQPYMT4bF1',
        },
      },
    })

    const stored = await connectedOriginsAtom.get()

    expect(stored).toHaveLength(1)
  })

  test('updates accounts when new assets added', async () => {
    await connectedOrigins.add({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      connectedAssetName: 'solana',
      assetNames: ['solana'],
      trusted: true,
    })

    await connectedOrigins.add({
      origin: 'exodus.com',
      assetNames: ['solana', 'ethereum'],
    })

    await expect(connectedAccountsAtom.get()).resolves.toEqual({
      exodus_0: {
        addresses: {
          ethereum: '0xbf41610c6D5e6E1DF97f37249D118Cc6FC47d407',
          solana: 'ASwcbiBuegaMrNUuXeN5WDYKoRuDXxMRt5DdStjvdSro',
        },
      },
      exodus_1: {
        addresses: {
          ethereum: '0x1Dc234Aa1c77e3AA781BB2DdF2099489053E11B2',
          solana: '4orUhPn6CRzVcgq5DHfAVt2odiZpPjNy7wNQPYMT4bF1',
        },
      },
    })
  })

  test('returns connected accounts with active wallet account first', async () => {
    await connectedOrigins.add({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      connectedAssetName: 'solana',
      assetNames: ['solana'],
      trusted: true,
    })

    await connectedOrigins.add({
      origin: 'wayne.foundation',
      name: 'Wayne Foundation',
      icon: 'exodus_icon',
      connectedAssetName: 'ethereum',
      assetNames: ['ethereum'],
      trusted: true,
    })

    await activeWalletAccountAtom.set('exodus_1')

    const accounts = await connectedOrigins.getConnectedAccounts({ origin: 'exodus.com' })
    expect(accounts).toEqual([
      {
        name: 'exodus_1',
        addresses: {
          solana: '4orUhPn6CRzVcgq5DHfAVt2odiZpPjNy7wNQPYMT4bF1',
        },
      },
      {
        name: 'exodus_0',
        addresses: {
          solana: 'ASwcbiBuegaMrNUuXeN5WDYKoRuDXxMRt5DdStjvdSro',
        },
      },
    ])
  })

  test('returns no connected accounts for untrusted account', async () => {
    await connectedOrigins.add({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      connectedAssetName: 'solana',
      assetNames: ['solana'],
      trusted: true,
    })

    await connectedOrigins.untrust({ origin: 'exodus.com' })

    const accounts = await connectedOrigins.getConnectedAccounts({ origin: 'exodus.com' })
    expect(accounts).toEqual([])
  })

  test('updates connected accounts when adding a wallet account', async () => {
    await connectedOrigins.add({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      connectedAssetName: 'solana',
      assetNames: ['solana'],
      trusted: true,
    })

    await enabledWalletAccountsAtom.set((current) => ({
      ...current,
      exodus_2: WalletAccount.defaultWith({ index: 2, name: 'Exodus 2', seedId }),
    }))

    await connectedOrigins.updateConnectedAccounts()

    await expect(connectedAccountsAtom.get()).resolves.toEqual({
      exodus_0: {
        addresses: {
          solana: 'ASwcbiBuegaMrNUuXeN5WDYKoRuDXxMRt5DdStjvdSro',
        },
      },
      exodus_1: {
        addresses: {
          solana: '4orUhPn6CRzVcgq5DHfAVt2odiZpPjNy7wNQPYMT4bF1',
        },
      },
      exodus_2: {
        addresses: {
          solana: '6MGVoPUB4VGF1rQwxG83icg6AFwUPXuKY1xwC4qxyYy2',
        },
      },
    })
  })

  test('updates connected accounts when removing a wallet account', async () => {
    await connectedOrigins.add({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      connectedAssetName: 'solana',
      assetNames: ['solana'],
      trusted: true,
    })

    await enabledWalletAccountsAtom.set({
      exodus_0: walletAccounts.exodus_0,
    })

    await connectedOrigins.updateConnectedAccounts()

    await expect(connectedAccountsAtom.get()).resolves.toEqual({
      exodus_0: {
        addresses: {
          solana: 'ASwcbiBuegaMrNUuXeN5WDYKoRuDXxMRt5DdStjvdSro',
        },
      },
    })
  })

  test('trust new origin for different asset', async () => {
    await connectedOrigins.add({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      connectedAssetName: 'ethereum',
      trusted: true,
    })
    const origins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(origins[0]).toMatchObject({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      favorite: false,
      autoApprove: false,
      connectedAssetName: 'ethereum',
      assetNames: ['ethereum'],
      activeConnections: [],
    })

    const stored = await connectedOriginsAtom.get()

    expect(stored).toHaveLength(1)
  })

  test('add new origin with additional assetNames', async () => {
    await connectedOrigins.add({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      connectedAssetName: 'ethereum',
      assetNames: ['ethereum', 'solana', 'optimism'],
    })
    const origins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(origins[0]).toMatchObject({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      favorite: false,
      autoApprove: false,
      connectedAssetName: 'ethereum',
      assetNames: ['ethereum', 'solana', 'optimism'],
      activeConnections: [],
    })

    const stored = await connectedOriginsAtom.get()

    expect(stored).toHaveLength(1)
  })

  test('not trust again trusted origin', async () => {
    await connectedOrigins.add({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      connectedAssetName: 'solana',
      trusted: true,
    })
    await connectedOrigins.add({
      origin: 'exodus.com',
      name: 'Exodus',
      icon: 'exodus_icon',
      connectedAssetName: 'solana',
      trusted: true,
    })

    const origins = await connectedOriginsAtom.get()
    expect(origins).toHaveLength(1)
  })

  test('untrust existing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])
    const origins = await connectedOriginsAtom.get()

    await connectedOrigins.untrust({ origin: 'exodus.com' })
    const newOrigins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(newOrigins).toHaveLength(0)
  })

  test('not untrust missing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])
    const origins = await connectedOriginsAtom.get()

    await connectedOrigins.untrust({ origin: 'exodude.com' })
    const newOrigins = await connectedOriginsAtom.get()

    expect(origins).toEqual(newOrigins)
  })

  test('isTrusted return true for trusted origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])
    const result = await connectedOrigins.isTrusted({ origin: 'exodus.com' })

    expect(result).toBe(true)
  })

  test('isTrusted return false for missing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])
    const result = await connectedOrigins.isTrusted({ origin: 'exodude.com' })

    expect(result).toBe(false)
  })

  test('isAutoApprove return true for trusted origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com', autoApprove: true }])
    const result = await connectedOrigins.isAutoApprove({ origin: 'exodus.com' })

    expect(result).toBe(true)
  })

  test('isAutoApprove return false for no non auto approve origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com', autoApprove: false }])
    const result = await connectedOrigins.isAutoApprove({ origin: 'exodus.com' })

    expect(result).toBe(false)
  })

  test('isAutoApprove return false for missing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])
    const result = await connectedOrigins.isAutoApprove({ origin: 'exodude.com' })

    expect(result).toBe(false)
  })

  test('setAutoApprove to true for existing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com', autoApprove: false }])
    await connectedOrigins.setAutoApprove({ origin: 'exodus.com', value: true })
    const origins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(origins).toMatchObject([{ origin: 'exodus.com', autoApprove: true }])
  })

  test('setAutoApprove to false for existing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com', autoApprove: true }])
    await connectedOrigins.setAutoApprove({ origin: 'exodus.com', value: false })

    const origins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(origins).toMatchObject([{ origin: 'exodus.com', autoApprove: false }])
  })

  test('setAutoApprove skip for missing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])
    const origins = await connectedOriginsAtom.get()

    await connectedOrigins.setAutoApprove({ origin: 'exodude.com', value: false })
    const newOrigins = await connectedOriginsAtom.get()

    expect(origins).toEqual(newOrigins)
  })

  test('setFavorite to true for existing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com', favorite: false }])
    await connectedOrigins.setFavorite({ origin: 'exodus.com', value: true })

    const origins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(origins).toMatchObject([{ origin: 'exodus.com', favorite: true }])
  })

  test('setFavorite to false for existing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com', favorite: true }])
    await connectedOrigins.setFavorite({ origin: 'exodus.com', value: false })

    const origins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(origins).toMatchObject([{ origin: 'exodus.com', favorite: false }])
  })

  test('setFavorite skip for missing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])
    const origins = await connectedOriginsAtom.get()

    await connectedOrigins.setFavorite({ origin: 'exodude.com', value: false })
    const newOrigins = await connectedOriginsAtom.get()

    expect(origins).toEqual(newOrigins)
  })

  test('connect should add connection to existing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])
    await connectedOrigins.connect({ id: 'connection-id', origin: 'exodus.com' })

    const origins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(origins).toMatchObject([
      { origin: 'exodus.com', activeConnections: [{ id: 'connection-id' }] },
    ])
  })

  test('connect should skip for missing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])

    await expect(
      connectedOrigins.connect({ id: 'connection-id', origin: 'exodude.com' })
    ).resolves.not.toThrow()
  })

  test('disconnect should add connection to existing origin', async () => {
    await connectedOriginsAtom.set([
      { origin: 'exodus.com', connectedOrigins: [{ id: 'connection-id' }] },
    ])
    await connectedOrigins.disconnect({ id: 'connection-id', origin: 'exodus.com' })

    const origins = await connectedOriginsAtom.get()

    expect(origins).toHaveLength(1)
    expect(origins).toMatchObject([{ origin: 'exodus.com', activeConnections: [] }])
  })

  test('disconnect should skip for missing origin', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com' }])

    await expect(
      connectedOrigins.disconnect({ id: 'connection-id', origin: 'exodude.com' })
    ).resolves.not.toThrow()
  })

  test('updateConnections should update icon', async () => {
    await connectedOriginsAtom.set([{ origin: 'exodus.com', icon: 'a' }])
    await connectedOrigins.updateConnection({ origin: 'exodus.com', icon: 'b' })

    const stored = await connectedOriginsAtom.get()

    expect(stored).toMatchObject([{ origin: 'exodus.com', icon: 'b' }])
  })

  test('clearConnections should clear all existing origins', async () => {
    await connectedOriginsAtom.set([
      { origin: 'exodus.com', connectedOrigins: [{ id: '1' }] },
      { origin: 'exodude.com', connectedOrigins: [{ id: '2' }] },
    ])
    await connectedOrigins.clearConnections()

    const stored = await connectedOriginsAtom.get()

    expect(stored).toMatchObject([
      { origin: 'exodus.com', activeConnections: [] },
      { origin: 'exodude.com', activeConnections: [] },
    ])
  })
})
