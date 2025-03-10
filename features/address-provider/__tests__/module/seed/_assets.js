import { connectAssets } from '@exodus/assets'
import { createAsset as createBitcoin } from '@exodus/bitcoin-plugin'
import cardanoPlugin from '@exodus/cardano-plugin'
import eosioPlugin from '@exodus/eosio-plugin'
import ethereumPlugin from '@exodus/ethereum-plugin'
import hederaPlugin from '@exodus/hedera-plugin'
import { tokens } from '@exodus/solana-meta'
import solanaPlugin from '@exodus/solana-plugin'

const assetClientInterface = { createLogger: () => console }

const bitcoin = createBitcoin({ assetClientInterface })
const cardano = cardanoPlugin.createAsset({ assetClientInterface })

const eosio = eosioPlugin.createAsset({ assetClientInterface })

const ethereum = ethereumPlugin.createAsset({ assetClientInterface })
const hedera = hederaPlugin.createAsset({ assetClientInterface })
const solana = solanaPlugin.createAsset({ assetClientInterface })
const serum = {
  ...solana.api.createToken(tokens.find(({ name }) => name === 'serum')),
  name: 'serum',
}

const assets = connectAssets({ bitcoin, cardano, eosio, ethereum, hedera, serum, solana })

export default assets
