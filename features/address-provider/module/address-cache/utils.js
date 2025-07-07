import lodash from 'lodash'
import assert from 'minimalistic-assert'
import { set } from '@exodus/basic-utils'

const { get } = lodash

// This allows new assets to use a full key, without regenerating existing data in fusion for legacy ones. Please do NOT add new names here!
const legacyKeyAssetNames = new Set([
  'algorand',
  'ark',
  'avalanchec',
  'bcash',
  'bgold',
  'bitcoin',
  'bitcoinsv',
  'bnbmainnet',
  'bsc',
  'cardano',
  'cosmos',
  'dash',
  'decred',
  'digibyte',
  'dogecoin',
  'elrond',
  'eosio',
  'ethereum',
  'ethereumarbnova',
  'ethereumarbone',
  'ethereumclassic',
  'ethereumgoerli',
  'fantommainnet',
  'filecoin',
  'flare',
  'harmonymainnet',
  'hedera',
  'iconmainnet',
  'lightningnetwork',
  'lisk',
  'litecoin',
  'matic',
  'neo3',
  'monero',
  'nano',
  'nem',
  'neo',
  'ontology',
  'optimism',
  'polkadot',
  'qtumignition',
  'ravencoin',
  'ripple',
  'solana',
  'stellar',
  'terra',
  'tezos',
  'theta',
  'tronmainnet',
  'vechainthor',
  'vertcoin',
  'waves',
  'zcash',
  'zilliqa',
])

export const getCachePath = ({ walletAccountName, baseAssetName, derivationPath }) => {
  assert(typeof walletAccountName === 'string', 'expected string "walletAccountName"')
  assert(typeof baseAssetName === 'string', 'expected string "baseAssetName"')
  assert(typeof derivationPath === 'string', 'expected string "derivationPath"')

  // todo add assetName for all assets when we migrate to a new fusion channel
  let path = derivationPath
  if (!legacyKeyAssetNames.has(baseAssetName)) {
    path = `${baseAssetName}/${path}` // combine these two to match fusion shape
  }

  return [
    // walletAccount is indirectly captured in the BIP path but it is still required because the BIP path is not enough, Trezor's accountIndex always use 1 regardless of the index of a walletAccount.
    walletAccountName,
    // assetName is required because some assets encode the network identifier into the address e.g splitting mainnet vs testnet results in different addresses for the same public key.
    // bipPath is required for assets that may have multiple addresses, or stake addresses etc
    path,
  ]
}

export const diffCaches = (cache1, cache2, fromSync) => {
  let isDifferent = false
  let needsSync = false

  const result = Object.create(null)
  for (const walletAccount in cache2) {
    const subCache = cache2[walletAccount]
    for (const path in subCache) {
      const existing = get(cache1, [walletAccount, path])
      const incoming = subCache[path]
      const newAddress = !existing
      const addressMismatch = !newAddress && existing.address !== incoming.address
      needsSync = needsSync || existing?.synced === false
      const justSynced = !existing?.synced && incoming.synced
      if (fromSync && addressMismatch && !existing?.synced) {
        // We have an address scheduled to sync up, that is mismatching with a
        // sync down, in this case we actually prefer the one scheduled to sync up.
        set(result, [walletAccount, path], existing)
      } else if (newAddress || addressMismatch || justSynced) {
        isDifferent = true
        set(result, [walletAccount, path], incoming)
      }
    }
  }

  return {
    diff: result,
    isDifferent,
    needsSync: isDifferent || needsSync,
  }
}

export const getUnsyncedAddressesForPush = (cache, currentCache) => {
  const out = Object.create(null)
  for (const walletAccount in cache) {
    const subCache = cache[walletAccount]
    for (const path in subCache) {
      const item = subCache[path]
      const currentCacheItem = get(currentCache, [walletAccount, path])
      if (
        currentCacheItem &&
        currentCacheItem.synced &&
        currentCacheItem.address.toString() === item.address.toString()
      )
        continue
      if (!item.synced) set(out, [walletAccount, path], item.address)
    }
  }

  return out
}
