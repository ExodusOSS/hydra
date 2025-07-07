import assetsModuleDefinition from '@exodus/assets-feature/module/index.js'
import { createInMemoryAtom } from '@exodus/atoms'
import bcash from '@exodus/bcash-plugin'
import bgold from '@exodus/bgold-plugin'
import bip44Constants from '@exodus/bip44-constants/by-ticker.js'
import bitcoin from '@exodus/bitcoin-plugin'
import cardano from '@exodus/cardano-plugin'
import dash from '@exodus/dash-plugin'
import decred from '@exodus/decred-plugin'
import digibyte from '@exodus/digibyte-plugin'
import dogecoin from '@exodus/dogecoin-plugin'
import ethereum from '@exodus/ethereum-plugin'
import ethereumclassic from '@exodus/ethereumclassic-plugin'
import litecoin from '@exodus/litecoin-plugin'
import * as moneroLib from '@exodus/monero-lib'
import ripple from '@exodus/ripple-plugin'
import stellar from '@exodus/stellar-plugin'
import createStorage from '@exodus/storage-memory'
import zcash from '@exodus/zcash-plugin'

const createIconsStorage = () => ({ storeIcons: () => {}, getIcon: () => {} })

const moneroAsset = {
  name: 'monero',
  bip44: bip44Constants.XMR,
  api: {
    defaultAddressPath: 'm/0/0',
    // TODO: replace me once upstream
    getKeyIdentifier: () => ({
      assetName: 'monero',
      derivationAlgorithm: 'SLIP10',
      derivationPath: "m/44'/128'/0'",
      keyType: 'nacl',
    }),
  },
  keys: {
    encodePublic: jest.fn((publicKey) =>
      moneroLib.address.create(publicKey.spendPub, publicKey.viewPub, null, 'mainnet')
    ),
  },
}
moneroAsset.baseAsset = moneroAsset

const assetPlugins = {
  bitcoin,
  bcash,
  bgold,
  dash,
  dogecoin,
  decred,
  digibyte,
  litecoin,
  zcash,
  cardano,
  ethereum,
  ethereumclassic,
  monero: { createAsset: () => moneroAsset },
  stellar,
  ripple,
}

const createAssetsModule = assetsModuleDefinition.factory

const createAssetsForTesting = ({
  assetClientInterface = { createLogger: () => console },
} = {}) => {
  const storage = createStorage()
  const customTokensStorage = storage.namespace('customTokens')

  const iconsStorage = createIconsStorage()

  const assetsModule = createAssetsModule({
    assetPlugins,
    assetsAtom: createInMemoryAtom(),
    storage: customTokensStorage,
    iconsStorage,
  })
  assetsModule.initialize({ assetClientInterface })

  return {
    assetsModule,
    assets: assetsModule.getAssets(),
  }
}

export default createAssetsForTesting
