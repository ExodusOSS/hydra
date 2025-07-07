import { createAsset as createBitcoinPlugin } from '@exodus/bitcoin-plugin'
import { createAsset as createBitcoinRegtestPlugin } from '@exodus/bitcoinregtest-plugin'
import { createAsset as createBitcoinTestnetPlugin } from '@exodus/bitcointestnet-plugin'
import { createAsset as createCosmosPlugin } from '@exodus/cosmos-plugin'
import ethereumPlugin from '@exodus/ethereum-plugin'
import { createAsset as createOsmosisPlugin } from '@exodus/osmosis-plugin'

const supportedAssetsList = {
  bitcoin: { createAsset: createBitcoinPlugin },
  bitcoinregtest: { createAsset: createBitcoinRegtestPlugin },
  bitcointestnet: { createAsset: createBitcoinTestnetPlugin },
  cosmos: { createAsset: createCosmosPlugin },
  osmosis: { createAsset: createOsmosisPlugin },
  ethereum: ethereumPlugin,
}

export default supportedAssetsList
