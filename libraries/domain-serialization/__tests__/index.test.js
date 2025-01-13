import KeyIdentifier from '@exodus/key-identifier'

import createDomainSerialization, {
  assetsApi as _assetsApi,
  createBackendDomainSerialization,
  createUIDomainSerialization,
} from '../src/index.js'
import createAssetsForTesting from './assets-for-testing.js'
import {
  accountState,
  fiatOrderSet,
  keyIdentifier,
  orderSet,
  personalNoteSet,
  SOL,
  SomeAccountState,
  tx,
  txSet,
  utxoCollection,
} from './fixture.js'

describe('domain serialization', () => {
  /** @type {ReturnType<import('../src/index.js').default>} */
  let domainSerialization

  beforeEach(() => {
    domainSerialization = createDomainSerialization()
  })

  test.each([
    {
      name: 'NumberUnit',
      value: SOL.parse('10 SOL'),
      matches: (value) => value.equals(SOL.parse('10 SOL')),
    },
    {
      name: 'PersonalNoteSet',
      value: personalNoteSet,
      matches: (value) => value.equals(personalNoteSet),
    },
    {
      name: 'UtxoCollection',
      value: utxoCollection,
      matches: (value) => value.equals(utxoCollection),
    },
    {
      name: 'TxSet',
      value: txSet,
      matches: (value) => value.equals(txSet),
    },
    {
      name: 'Tx',
      value: tx,
      matches: (value) => value.equals(tx),
    },
    {
      name: 'OrderSet',
      value: orderSet,
      matches: (value) => value.equals(orderSet),
    },
    {
      name: 'FiatOrderSet',
      value: fiatOrderSet,
      matches: (value) => value.equals(fiatOrderSet),
    },
    {
      name: 'KeyIdentifier',
      value: keyIdentifier,
      matches: (value) =>
        value[Symbol.toStringTag] === 'KeyIdentifier' &&
        KeyIdentifier.compare(value, keyIdentifier),
    },
    {
      name: 'AccountState',
      value: accountState,
      matches: (value) => {
        // deserialized object is not an AccountState instance, it's just a POJO
        return SomeAccountState.fromJSON(value).equals(accountState)
      },
    },
  ])('handles $name', ({ value, matches }) => {
    const { serialize, deserialize } = domainSerialization
    const serialized = serialize(value)

    // ensure values are fully JSON-serialized
    expect(JSON.parse(JSON.stringify(serialized))).toStrictEqual(serialized)

    const deserialized = deserialize(serialized)
    expect(matches(deserialized, value)).toBe(true)
  })
})

describe('ui/backend serialization', () => {
  const { assets } = createAssetsForTesting()

  const { solana } = assets

  const assetsApi = (assetName, ...args) => _assetsApi(assets[assetName], ...args)

  const ui = createUIDomainSerialization({
    getStoredAssets: () => assets,
    proxyFunction: assetsApi,
  })

  const backend = createBackendDomainSerialization()

  test('serialize asset in backend and restore in ui', () => {
    const serializedAsset = backend.serialize(solana)
    expect(typeof serializedAsset).toEqual('string')

    const deserializedAsset = ui.deserialize(serializedAsset)
    const {
      assetType,
      baseAssetName,
      chainBadgeColors,
      displayName,
      displayNetworkName,
      displayNetworkTicker,
      displayTicker,
      gradientColors,
      gradientCoords,
      info,
      name,
      primaryColor,
      ticker,
      units,
      isBuiltIn,
      bip44,
      accountReserve,
      lowBalance,
      MIN_STAKING_AMOUNT,
      currency,
    } = solana

    expect(deserializedAsset).toMatchObject({
      assetType,
      baseAssetName,
      chainBadgeColors,
      displayName,
      displayNetworkName,
      displayNetworkTicker,
      displayTicker,
      gradientColors,
      gradientCoords,
      info,
      name,
      primaryColor,
      ticker,
      units,
      isBuiltIn,
      bip44,
      accountReserve,
      lowBalance,
      MIN_STAKING_AMOUNT,
      currency,
      feeAsset: expect.any(Object),
      baseAsset: expect.any(Object),
      feeAssetName: solana.feeAsset.name,
      api: {
        features: solana.api.features,
        getFee: expect.any(Function),
        hasFeature: expect.any(Function),
        validateAssetId: expect.any(Function),
      },
      address: { validate: expect.any(Function) },
      keys: { encodePrivate: expect.any(Function), encodePublic: expect.any(Function) },
      blockExplorer: { addressUrl: expect.any(Function), txUrl: expect.any(Function) },
    })
  })

  test('serialize assets in backend and restore in ui', () => {
    expect(assets.bitcoin.address.resolvePurpose).toBeDefined()
    expect(assets.bitcoin.insightClient).toBeDefined()
    expect(assets.ethereum.server).toBeDefined()

    const serializedAssets = backend.serialize(assets)
    expect(typeof serializedAssets).toEqual('string')
    const deserializedAssets = ui.deserialize(serializedAssets)
    expect(Object.keys(deserializedAssets)).toEqual(Object.keys(assets))

    expect(deserializedAssets.bitcoin.address.resolvePurpose).toBeDefined()
    expect(deserializedAssets.bitcoin.insightClient).toBeUndefined()
    expect(deserializedAssets.ethereum.server).toBeUndefined()
  })

  test('ui cannot serialize asset', () => {
    expect(() => ui.serialize(assets)).toThrow(/UI cannot serialize asset bitcoin/)
  })

  test('backend cannot deserialize asset', () => {
    expect(() => backend.deserialize(backend.serialize(assets))).toThrow(
      /Backend cannot deserialize asset bitcoin/
    )
  })

  test('ui cannot serialize accountState', () => {
    expect(() => ui.serialize(accountState)).toThrow(/accountstate cannot be serialized/)
  })

  test('backend can serialize accountState', () => {
    expect(backend.serialize(accountState)).toEqual(
      '{"t":"accountstate","v":{"t":"object","v":{"utxos":{"t":"utxocollection","v":{"v":{},"u":{"satoshis":0,"bits":2,"BTC":8}}},"tokenUtxos":{"t":"object","v":{}},"mem":{"t":"object","v":{"unclaimed":{"t":"numberunit","v":{"v":"1000 satoshis","u":{"satoshis":0,"bits":2,"BTC":8}}}}},"_version":1}}}'
    )
  })
})
