import { connectAssets } from '@exodus/assets'
import { createAsset as createBitcoinAsset } from '@exodus/bitcoin-plugin'
import combinedAssets from '@exodus/combined-assets-meta'
import { createAsset as createDogecoinAsset } from '@exodus/dogecoin-plugin'
import { tokens as ethereumTokens } from '@exodus/ethereum-meta'
import ethereumPlugin from '@exodus/ethereum-plugin'
import { createAsset as createLitecoinAsset } from '@exodus/litecoin-plugin'
import { createNoopLogger } from '@exodus/logger'
import solanaPlugin from '@exodus/solana-plugin'
import stellarPlugin from '@exodus/stellar-plugin'

import type { Assets } from '../../types.js'

export const createAssetsForTesting = () => {
  const usdcoin = ethereumTokens.find((a) => a.name === 'usdcoin')
  const _usdcoin = combinedAssets.find((a) => a.name === '_usdcoin')

  const assets: Assets = connectAssets({
    bitcoin: createBitcoinAsset({ assetClientInterface: { createLogger: createNoopLogger } }),
    dogecoin: createDogecoinAsset({ assetClientInterface: { createLogger: createNoopLogger } }),
    ethereum: ethereumPlugin.createAsset({
      assetClientInterface: { createLogger: createNoopLogger },
    }),
    litecoin: createLitecoinAsset({ assetClientInterface: { createLogger: createNoopLogger } }),
    solana: solanaPlugin.createAsset({ assetClientInterface: { createLogger: createNoopLogger } }),
    stellar: stellarPlugin.createAsset({
      assetClientInterface: { createLogger: createNoopLogger },
    }),
    usdcoin,
    _usdcoin,
  })

  return {
    assets,
  }
}
