import { connectAssets } from '@exodus/assets'
import { combinedAssetsList, tokens } from '@exodus/assets-test-meta'
import { createAsset as createBitcoinAsset } from '@exodus/bitcoin-plugin'
import { createAsset as createDogecoinAsset } from '@exodus/dogecoin-plugin'
import ethereumPlugin from '@exodus/ethereum-plugin'
import { createAsset as createLitecoinAsset } from '@exodus/litecoin-plugin'
import { createNoopLogger } from '@exodus/logger'
import solanaPlugin from '@exodus/solana-plugin'
import stellarPlugin from '@exodus/stellar-plugin'

import type { Assets } from '../../types.js'

export const createAssetsForTesting = () => {
  const { usdcoin } = tokens
  const _usdcoin = combinedAssetsList.find((a: { name: string }) => a.name === '_usdcoin')

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
