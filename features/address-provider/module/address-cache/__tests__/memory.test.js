import addressCacheModuleDefinition from '../memory.js'

const btcFirstBip32Path = "m/84'/0'/0'"
const btcFirstPath = `${btcFirstBip32Path}/0/0`

const receiveAddresses = {
  bitcoin: 'bc1qra6g60wnu8tdp8nfgp9te90rqf4txdflm99hk2',
  kava: 'kava1fzjh88d70kjcz4whvvn98xr7lqax7txcm0tq6k',
  osmosis: 'osmo17ux3h6fs0ethay4xm065wh2pkuhw8kjy9u27ne',
  ethereum: '0x3a6c678ab6f5c1e6B77D0ecDdDa81f998162E14f',
  cardano:
    'addr1qykynnu4tsg7ewx5e52xf6r94exy06qyps6j4c0s025txk3vf88e2hq3ajudfng5vn5xttjvgl5qgrp49tslq74gkddqc7usjq',
}

let addressCache

describe('address cache', () => {
  beforeEach(async () => {
    addressCache = addressCacheModuleDefinition.factory({
      logger: console,
    })
  })

  afterEach(async () => {
    await addressCache.clear()
  })

  it('adds address', async () => {
    await addressCache.load()

    const bitcoin0BeforeValue = await addressCache.get({
      walletAccountName: 'exodus_0',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
    })

    const bitcoin1BeforeValue = await addressCache.get({
      walletAccountName: 'exodus_1',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
    })

    expect(bitcoin0BeforeValue).toBe(undefined)
    expect(bitcoin1BeforeValue).toBe(undefined)

    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
      address: receiveAddresses.bitcoin,
    })

    await addressCache.set({
      walletAccountName: 'exodus_1',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
      address: receiveAddresses.bitcoin,
    })

    const bitcoin0AfterValue = await addressCache.get({
      walletAccountName: 'exodus_0',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
    })

    const bitcoin1AfterValue = await addressCache.get({
      walletAccountName: 'exodus_1',
      baseAssetName: 'bitcoin',
      derivationPath: btcFirstPath,
    })

    expect(bitcoin0AfterValue).toBe(receiveAddresses.bitcoin)
    expect(bitcoin1AfterValue).toBe(receiveAddresses.bitcoin)
  })

  it('adds address for legacy key asset', async () => {
    await addressCache.load()

    const ethereumBeforeValue = await addressCache.get({
      walletAccountName: 'exodus_0',
      baseAssetName: 'ethereum',
      derivationPath: 'test',
    })

    expect(ethereumBeforeValue).toBe(undefined)

    await addressCache.set({
      walletAccountName: 'exodus_0',
      baseAssetName: 'ethereum',
      derivationPath: 'test',
      address: receiveAddresses.ethereum,
    })

    const ethereumAfterValue = await addressCache.get({
      walletAccountName: 'exodus_0',
      baseAssetName: 'ethereum',
      derivationPath: 'test',
    })

    expect(ethereumAfterValue).toBe(receiveAddresses.ethereum)
  })
})
